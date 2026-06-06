import React, { useState } from 'react';
import { 
  Settings, FileCode, ExternalLink, ShieldAlert, FolderCheck, 
  RefreshCw, Copy, CheckCircle, Terminal, Trash2, CheckCircle2, History, Send, Info,
  Pencil, Eye, Save
} from 'lucide-react';
import { GoogleDocsCard } from '../types';
import { getTechnicalPayloadForDoc } from '../utils/portalBossMapper';

interface GdiPainelTabProps {
  card: GoogleDocsCard;
  templateId: string;
  setTemplateId: (id: string) => void;
  templateStatus: string;
  setTemplateStatus: (status: string) => void;
  templateError: string;
  setTemplateError: (err: string) => void;
  googleDocsStatus: string;
  setGoogleDocsStatus: (status: string) => void;
  googleDriveStatus: string;
  setGoogleDriveStatus: (status: string) => void;
  googleAuthStatus: string;
  dbConfig?: any;
  jobsQueue: any[];
  userActionLogs: any[];
  triggerGoogleAuthDiagnostics: () => Promise<void>;
  triggerGoogleDocsDiagnostics: () => Promise<void>;
  triggerGoogleDriveDiagnostics: () => Promise<void>;
  triggerClearJobsQueue: () => Promise<void>;
  reloadJobsList?: () => Promise<void>;
  onSaveTemplate: (updatedFields?: any) => Promise<void>;
  isSavingTemplate: boolean;
  getDocFriendlyName: () => string;
  rawPayloadText: string;
  setRawPayloadText: (val: string) => void;
  isPayloadValid: boolean;
  parseError: string | null;
  normalizedData: any;
  triggerTechnicalJob: () => Promise<void>;
}

export const GdiPainelTab: React.FC<GdiPainelTabProps> = ({
  card,
  templateId,
  setTemplateId,
  templateStatus,
  setTemplateStatus,
  templateError,
  setTemplateError,
  googleDocsStatus,
  setGoogleDocsStatus,
  googleDriveStatus,
  setGoogleDriveStatus,
  googleAuthStatus,
  dbConfig,
  jobsQueue,
  userActionLogs,
  triggerGoogleAuthDiagnostics,
  triggerGoogleDocsDiagnostics,
  triggerGoogleDriveDiagnostics,
  triggerClearJobsQueue,
  reloadJobsList,
  onSaveTemplate,
  isSavingTemplate,
  getDocFriendlyName,
  rawPayloadText,
  setRawPayloadText,
  isPayloadValid,
  parseError,
  normalizedData,
  triggerTechnicalJob
}) => {
  const [payloadViewMode, setPayloadViewMode] = useState<'real' | 'contract'>('real');
  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);

  const handleDeleteSingleJob = async (jobId: string) => {
    if (confirm(`Deseja realmente excluir permanentemente o log de payload #${jobId}?`)) {
      try {
        const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
        if (res.ok) {
          alert(`Payload #${jobId} excluído com sucesso.`);
          if (reloadJobsList) {
            await reloadJobsList();
          }
        } else {
          alert('Falha ao excluir o payload.');
        }
      } catch (err: any) {
        alert('Erro ao processar exclusão: ' + err.message);
      }
    }
  };

  const handleEditJobPayload = (job: any) => {
    const payloadStr = JSON.stringify(job.payload || job, null, 2);
    setRawPayloadText(payloadStr);
    alert(`Payload #${job.id} carregado com sucesso no Editor JSON! Modifique o conteúdo e dispare o integrador se desejar.`);
    // Smooth scroll to payload editor
    const editorEl = document.getElementById('technical-payload-card');
    if (editorEl) {
      editorEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyJobPayload = (jobId: string, payload: any) => {
    const textToCopy = JSON.stringify(payload || {}, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopiedJobId(jobId);
    setTimeout(() => setCopiedJobId(null), 2000);
  };

  const matchingJobs = jobsQueue.filter((job: any) => {
    if (!job) return false;
    const docType = job.documentType || (job.payload && job.payload.documentType) || '';
    const canonicalJobType = docType.toLowerCase().replace(/_/g, '-');
    const canonicalCardId = card.id.toLowerCase().replace(/_/g, '-');
    return canonicalJobType === canonicalCardId;
  });

  const latestJob = matchingJobs.length > 0 ? matchingJobs[0] : null;

  // runtimeMode computation
  let runtimeMode: 'preview' | 'production' | 'unknown' = 'unknown';
  const rawEnv = dbConfig?.viteGdiEnv ? dbConfig.viteGdiEnv.toLowerCase().trim() : '';
  if (rawEnv === 'production') {
    runtimeMode = 'production';
  } else if (rawEnv === 'preview' || rawEnv === 'dev' || rawEnv === 'development' || !rawEnv) {
    runtimeMode = 'preview';
  } else {
    runtimeMode = 'unknown';
  }

  // apiHealth computation
  let apiHealth: 'operational' | 'blocked' | 'error' = 'blocked';
  const hasSa = dbConfig?.gdiGoogleServiceAccountEmail && dbConfig?.hasServiceAccountPrivateKey;

  if (googleAuthStatus === 'não_configurado' || googleDocsStatus === 'não_configurado' || googleDriveStatus === 'não_configurado' || !hasSa) {
    apiHealth = 'blocked';
  } else if (
    googleAuthStatus === 'erro_auth' || 
    googleAuthStatus === 'não_autenticado' || 
    googleDocsStatus === 'erro_docs' || 
    googleDriveStatus === 'erro_drive' ||
    templateStatus === 'erro_template'
  ) {
    apiHealth = 'error';
  } else if (
    ['conectado', 'autenticado', 'service_account_validada'].includes(googleAuthStatus) &&
    googleDocsStatus === 'conectado' &&
    googleDriveStatus === 'conectado'
  ) {
    apiHealth = 'operational';
  } else {
    apiHealth = 'blocked';
  }

  // totalJobsReceived counts the overall number of real payloads in the queue
  const totalJobsReceived = jobsQueue ? jobsQueue.length : 0;

  // Last payload details
  const latestOverallJob = jobsQueue && jobsQueue.length > 0 ? jobsQueue[0] : null;
  const lastPayloadReceivedAt = latestOverallJob ? (latestOverallJob.receivedAt || latestOverallJob.createdAt) : null;
  const lastPayloadSource = latestOverallJob ? (latestOverallJob.source || 'N/A') : null;
  const lastPayloadCaseId = latestOverallJob ? (latestOverallJob.caseId || 'N/A') : null;
  const lastPayloadClientId = latestOverallJob ? (latestOverallJob.clientId || 'N/A') : null;

  return (
    <div className="space-y-6">
      {/* CARD — AMBIENTE ATUAL (Tarefa 2) */}
      <div id="ambiente-atual-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="flex items-center space-x-2.5">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${
              apiHealth === 'operational' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
              apiHealth === 'error' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
              <Settings className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider">Ambiente atual de runtime</h3>
              <p className="text-[10px] text-slate-400">Verificação de barramento e identificação física do GDI</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
              runtimeMode === 'production' 
                ? 'bg-purple-50 text-purple-700 border-purple-200' 
                : runtimeMode === 'preview' 
                ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}>
              MODO: {runtimeMode}
            </span>
            <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider flex items-center gap-1 ${
              apiHealth === 'operational' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : apiHealth === 'error' 
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${apiHealth === 'operational' ? 'bg-emerald-500 animate-pulse' : apiHealth === 'error' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
              SAÚDE: {apiHealth}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 text-xs font-mono">
          <div className="bg-slate-50/55 p-3 rounded-xl border border-slate-150">
            <span className="text-[9.5px] uppercase text-slate-400 block font-sans font-bold">runtimeMode</span>
            <span className="text-[11px] font-bold text-slate-800 block mt-1 uppercase">{runtimeMode}</span>
          </div>
          <div className="bg-slate-50/55 p-3 rounded-xl border border-slate-150">
            <span className="text-[9.5px] uppercase text-slate-400 block font-sans font-bold">apiHealth</span>
            <span className="text-[11px] font-bold text-slate-800 block mt-1 uppercase">{apiHealth}</span>
          </div>
          <div className="bg-slate-50/55 p-3 rounded-xl border border-slate-150">
            <span className="text-[9.5px] uppercase text-slate-400 block font-sans font-bold">lastPayloadReceivedAt</span>
            <span className="text-[11px] font-bold text-slate-700 block mt-1 truncate" title={lastPayloadReceivedAt || 'Nenhum'}>
              {lastPayloadReceivedAt ? new Date(lastPayloadReceivedAt).toLocaleString('pt-BR') : 'Nenhum'}
            </span>
          </div>
          <div className="bg-slate-50/5	 p-3 rounded-xl border border-slate-150">
            <span className="text-[9.5px] uppercase text-slate-400 block font-sans font-bold">lastPayload (Case/Cli)</span>
            <span className="text-[11px] font-bold text-slate-705 block mt-1 truncate" title={`Origem: ${lastPayloadSource} | Caso: ${lastPayloadCaseId} | Cli: ${lastPayloadClientId}`}>
              {latestOverallJob ? `${lastPayloadCaseId} / ${lastPayloadClientId}` : 'Nenhum'}
            </span>
          </div>
          <div className="bg-slate-50/55 p-3 rounded-xl border border-slate-150">
            <span className="text-[9.5px] uppercase text-slate-400 block font-sans font-bold">totalJobsReceived</span>
            <span className="text-[11px] font-bold text-slate-850 block mt-1">{totalJobsReceived} payloads</span>
          </div>
        </div>

        {totalJobsReceived === 0 && (
          <div className="bg-blue-50/70 border border-blue-150 rounded-xl p-3.5 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-850 leading-relaxed font-sans">
              <p className="font-bold">GDI Modo Preview Ativo</p>
              <p className="mt-0.5">GDI está aberto em modo preview, mas ainda não recebeu nenhum payload real do Portal BOSS.</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SEÇÃO DA ESQUERDA: INFOS DA AUTOMAÇÃO E TEMPLATES */}
        <div className="lg:col-span-7 space-y-6">
        
        {/* CARD — IDENTIFICAÇÃO DO MOTOR */}
        <div id="motor-info-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center space-x-2.5 mb-4 border-b border-slate-100 pb-3">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Settings className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Identificação do Motor Documental</h3>
              <p className="text-[10px] text-slate-400">Parâmetros de mapeamento e roteamento GDI</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 animate-fadeIn">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-0.5">Nome da automação</span>
                <span className="font-semibold text-slate-800">{getDocFriendlyName()}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-0.5">documentType</span>
                <span className="font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold">{card.documentType}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-0.5">Tipo de Pessoa</span>
                <span className="font-semibold text-slate-700">{card.category.toUpperCase() === 'PF' ? 'Pessoa Física (PF)' : 'Pessoa Jurídica (PJ)'}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-0.5">Origem Recebimento</span>
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  Portal BOSS Clientes (Real Webhook)
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-0.5">Executor Autorizado</span>
                <span className="font-medium text-slate-705 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  GDI — Google Docs Engine
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 mt-1">
                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-400 block">Sincronia</span>
                  <span className="font-mono text-[10px] font-bold text-emerald-600">Ativa (Live)</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-400 block">Status Motor</span>
                  <span className="font-mono text-[10px] font-bold text-slate-600">Integrado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD — TEMPLATE DO GOOGLE DOCS */}
        <div id="template-vinculado-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileCode className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Template mestre vinculado no Google Docs</h3>
                <p className="text-[10px] text-slate-400">Chave estrutural que servirá de modelo físico</p>
              </div>
            </div>

            {templateStatus === 'validated' && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[9px] uppercase font-mono px-2 py-0.5 rounded">
                Validado
              </span>
            )}
            {templateStatus === 'configurado' && (
              <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[9px] uppercase font-mono px-2 py-0.5 rounded">
                Diferente
              </span>
            )}
            {templateStatus === 'não_configurado' && (
              <span className="bg-slate-100 text-slate-650 border border-slate-200 font-bold text-[9px] uppercase font-mono px-2 py-0.5 rounded">
                Não Definido
              </span>
            )}
            {templateStatus === 'erro_template' && (
              <span className="bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[9px] uppercase font-mono px-2 py-0.5 rounded animate-pulse">
                Erro de Leitura
              </span>
            )}
          </div>

          <div className="space-y-4">
            {templateStatus === 'erro_template' && (
              <div className="bg-rose-50 border border-rose-100 text-rose-800 p-3 rounded-lg flex items-start gap-2 animate-fadeIn">
                <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[11px] uppercase font-mono tracking-wider">Falha de Leitura no Google API</p>
                  <p className="mt-0.5 text-xs text-rose-700 leading-normal">{templateError || 'O ID informado para o Google API está inacessível ou inválido.'}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1">Nome Amigável do Modelo</label>
                <input 
                  type="text" 
                  value={getDocFriendlyName()} 
                  disabled
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-500 font-medium cursor-not-allowed text-xs" 
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1">Google Docs Template ID</label>
                <input 
                  type="text" 
                  id="templateIdInput"
                  value={templateId} 
                  onChange={(e) => {
                    setTemplateId(e.target.value);
                    if (templateStatus === 'não_configurado') setTemplateStatus('configurado');
                  }}
                  placeholder="ID da URL do Google Docs..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-[11px] text-slate-800" 
                />
              </div>
            </div>

            {/* BARRA DE AÇÕES RÁPIDAS DO MODELO (com os 5 botões funcionais) */}
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/75 space-y-2.5">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-550 block">Ações do Modelo de Procuração</span>
              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Lápis para editar */}
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('templateIdInput');
                    if (el) {
                      el.focus();
                      alert('Modo de edição do ID ativado! Insira o novo ID do Google Docs na caixa de campo correspondente.');
                    }
                  }}
                  className="bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs px-3 py-2 rounded-lg border border-slate-200 transition inline-flex items-center gap-1.5 cursor-pointer shadow-3xs"
                  title="Editar ID do template"
                >
                  <Pencil className="h-3.5 w-3.5 text-blue-500" />
                  <span>Editar ID</span>
                </button>

                {/* 2. Lixeira para excluir */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Deseja realmente excluir/limpar o ID do template atual do campo de edição?')) {
                      setTemplateId('');
                      if (templateStatus === 'configurado' || templateStatus === 'validated') {
                        setTemplateStatus('não_configurado');
                      }
                      alert('ID do template excluído do campo de digitação!');
                    }
                  }}
                  className="bg-white hover:bg-slate-105 text-slate-700 font-semibold text-xs px-3 py-2 rounded-lg border border-slate-200 transition inline-flex items-center gap-1.5 cursor-pointer shadow-3xs"
                  title="Excluir/limpar ID do formulário"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                  <span>Excluir ID</span>
                </button>

                {/* 3. Olhinho para visualizar */}
                <a
                  href={templateId ? `https://docs.google.com/document/d/${templateId}/edit` : '#'}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    if (!templateId) {
                      e.preventDefault();
                      alert('Não há ID de template definido para visualizar. Digite um ID primeiro!');
                    }
                  }}
                  className="bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs px-3 py-2 rounded-lg border border-slate-200 transition inline-flex items-center gap-1.5 cursor-pointer shadow-3xs"
                  title="Visualizar documento mestre no Google Docs"
                >
                  <Eye className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Visualizar</span>
                </a>

                {/* 4. Dois quadradinhos para copiar */}
                <button
                  type="button"
                  onClick={() => {
                    if (templateId) {
                      navigator.clipboard.writeText(templateId);
                      alert('Chave Google Docs ID copiada com sucesso para a área de transferência!');
                    } else {
                      alert('Nada para copiar (o campo está vazio).');
                    }
                  }}
                  className="bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs px-3 py-2 rounded-lg border border-slate-200 transition inline-flex items-center gap-1.5 cursor-pointer shadow-3xs"
                  title="Copiar ID do template"
                >
                  <Copy className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Copiar ID</span>
                </button>

                {/* 5. Salvar configurações */}
                <button
                  type="button"
                  onClick={async () => {
                    if (!templateId) {
                      alert('GDI AVISO: não é possível salvar uma configuração de ID de template vazia.');
                      return;
                    }
                    await onSaveTemplate({ templateGoogleDocsId: templateId });
                  }}
                  disabled={isSavingTemplate}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-350 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer shadow-3xs ml-auto"
                  title="Salvar alterações de ID no banco de dados definitivamente"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isSavingTemplate ? 'Salvando...' : 'Salvar Configurações'}</span>
                </button>
              </div>
            </div>
            
            <p className="text-[10.5px] text-slate-400 font-sans italic">
              * Para permitir que a conta de serviço do GDI copie este template, certifique-se de que o compartilhamento do arquivo do Google Docs esteja liberado na nuvem do Google Drive corporativo para <strong>"Leitor / Qualquer um com o Link"</strong> ou compartilhado diretamente com o e-mail sob a aba de credenciais.
            </p>
          </div>
        </div>

        {/* CARD — PAYLOAD TÉCNICO RECEBIDO */}
        <div id="technical-payload-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-850 flex items-center justify-center border border-slate-220">
                <FileCode className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Payload técnico recebido</h3>
                <p className="text-[10px] text-slate-400">Auditoria estrutural de variáveis e diagnose de placeholders</p>
              </div>
            </div>

            {/* TAB SELECTOR FOR TECHNICAL PAYLOAD */}
            <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-[10px] font-medium font-mono">
              <button
                type="button"
                onClick={() => setPayloadViewMode('real')}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  payloadViewMode === 'real'
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Real Payload Recebido
              </button>
              <button
                type="button"
                onClick={() => setPayloadViewMode('contract')}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  payloadViewMode === 'contract'
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                2. Expected Contract
              </button>
            </div>
          </div>

          {payloadViewMode === 'real' ? (
            <div className="space-y-4">
              {latestJob ? (
                /* TASK 3: Real payload received summary statistics */
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-205 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-500">RESUMO DA INTEGRAÇÃO DO WEBHOOK</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                      latestJob.status === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : latestJob.status === 'received'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : latestJob.status === 'validating' || latestJob.status === 'processing'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {latestJob.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] font-mono">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans font-medium">TOTAL RECEBIDOS (ESTE DOC):</span>
                      <span className="font-bold text-slate-800">{matchingJobs.length} payloads</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans font-medium font-bold">RECEBIDO EM:</span>
                      <span className="font-bold text-slate-700">
                        {new Date(latestJob.receivedAt || latestJob.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {latestJob.processedAt && (
                      <div>
                        <span className="text-[9px] text-slate-400 block font-sans font-medium">PROCESSADO EM:</span>
                        <span className="font-bold text-slate-700">
                          {new Date(latestJob.processedAt).toLocaleTimeString('pt-BR')}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans font-medium">CASE ID / CLIENT ID:</span>
                      <span className="text-slate-750 font-bold break-all">
                        {latestJob.caseId || 'N/A'} / {latestJob.clientId || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans font-medium">DESTINO PASTA DRIVE:</span>
                      <span className="text-blue-600 font-bold truncate max-w-[150px] block" title={latestJob.destinationFolderId}>
                        {latestJob.destinationFolderId || 'N/A'}
                      </span>
                    </div>
                    {latestJob.errorCode && (
                      <div className="col-span-2 sm:col-span-3">
                        <span className="text-[9px] text-rose-500 block font-sans font-semibold">CÓDIGO DE ERRO:</span>
                        <span className="text-rose-700 font-bold bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded text-[10px] inline-block mt-0.5">
                          {latestJob.errorCode}: {latestJob.errorMessage}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* TASK 6: Non-reception diagnostic warning */
                <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-amber-850">Nenhum payload real recebido do Portal BOSS até o momento</h4>
                      <p className="text-[11px] text-amber-700 leading-normal font-sans">
                        GDI operacional, mas nenhum payload recebido do Portal BOSS até o momento. Verifique se o Portal BOSS está apontando corretamente para o endereço de integração deste GDI e enviando o cabeçalho <code className="bg-white/60 px-1 border border-amber-200 py-0.5 rounded text-amber-900 font-mono font-bold">X-BOSS-Google-Docs-Integration-Key</code>.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/80 rounded-lg p-3 text-[10.5px] font-mono border border-amber-100/60 leading-normal space-y-1">
                    <div>
                      <span className="text-slate-400 font-sans font-semibold">Método e Endpoint Esperados:</span>
                      <pre className="text-blue-700 font-bold bg-slate-50 px-2 py-1 rounded mt-0.5 break-all select-all text-[11px]">
                        POST {window.location.origin}/api/webhook/gdi-job
                      </pre>
                    </div>
                    <div className="pt-1">
                      <span className="text-slate-400 font-sans font-semibold">Cabeçalhos Obrigatórios:</span>
                      <pre className="text-slate-850 font-medium bg-slate-50 px-2 py-1 rounded mt-0.5 select-all">
                        X-BOSS-Google-Docs-Integration-Key: (sua-chave)
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-500 leading-normal font-sans pt-1">
                Este campo representa o payload real recebido do Portal BOSS. Não é simulação. Altere ou verifique os valores JSON brutos abaixo e dispare manualmente o job operacional real se desejar validar as APIs conectadas.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Editor Textarea */}
                <div className="space-y-1.5 flex flex-col">
                  <div className="flex items-center justify-between font-sans">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-0.5 font-bold">Editor JSON</span>
                    {parseError ? (
                      <span className="text-[9px] text-rose-600 font-mono font-bold bg-rose-50 px-1 border border-rose-100 rounded">Sintaxe Inválida</span>
                    ) : (
                      <span className="text-[9px] text-emerald-600 font-mono font-bold bg-emerald-50 px-1 border border-emerald-100 rounded">Sintaxe OK</span>
                    )}
                  </div>
                  <textarea
                    value={rawPayloadText}
                    onChange={(e) => setRawPayloadText(e.target.value)}
                    className="w-full h-64 bg-slate-905 text-slate-300 p-3 rounded-lg font-mono text-[10px] leading-relaxed border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none select-text"
                    placeholder="Insira o payload JSON real recebido..."
                  />
                </div>

                {/* Normalizador result preview */}
                <div className="space-y-1.5 flex flex-col">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-0.5 font-bold">Variáveis Extraídas (GDI Normalizado)</span>
                  <div className="bg-slate-905 border border-slate-200 rounded-lg h-64 overflow-y-auto p-3 font-mono text-[10px] text-emerald-600 leading-relaxed shadow-inner">
                    <pre>{JSON.stringify(normalizedData, null, 2)}</pre>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-[10.5px] border-t border-slate-100 font-sans">
                <span className="text-slate-400 italic">
                  * O envio criará um novo Job de processamento real na fila do barramento.
                </span>
                <button
                  onClick={triggerTechnicalJob}
                  disabled={!isPayloadValid || !templateId}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-slate-100 font-bold rounded-lg transition text-xs cursor-pointer inline-flex items-center gap-1 shadow-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Disparar Integrador GDI</span>
                </button>
              </div>
            </div>
          ) : (
            /* TASK 4: Expected Contract Tab (Empty schema without mock/fictitious values) */
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-blue-50/50 border border-blue-150 rounded-xl p-3.5 text-xs text-blue-800 leading-normal space-y-1 font-sans">
                <p className="font-bold">Contrato Esperado de Integração (Schema do Portador)</p>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Abaixo está mapeada a estrutura exata de payload JSON esperada pelo normalizador GDI para a fabricação correta de procurações. Todos os dados fictícios foram removidos para evitar vazamentos e simulações mockadas.
                </p>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <div className="flex items-center justify-between font-sans">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-0.5 font-bold">Esquema Vazio (Schema)</span>
                  <button
                    type="button"
                    onClick={() => {
                      const contractText = JSON.stringify(getTechnicalPayloadForDoc(card.documentType, (card.category || 'PF').toUpperCase() as 'PF' | 'PJ'), null, 2);
                      navigator.clipboard.writeText(contractText);
                      setCopiedContract(true);
                      setTimeout(() => setCopiedContract(false), 2000);
                    }}
                    className="text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer bg-slate-100 border border-slate-200 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-700 transition"
                  >
                    <Copy className="h-2.5 w-2.5" />
                    <span>{copiedContract ? 'Copiado!' : 'Copiar Esquema'}</span>
                  </button>
                </div>
                <div className="bg-slate-905 border border-slate-200 rounded-lg max-h-[300px] overflow-y-auto p-3.5 font-mono text-[10px] text-blue-600 leading-relaxed shadow-inner">
                  <pre>{JSON.stringify(getTechnicalPayloadForDoc(card.documentType, (card.category || 'PF').toUpperCase() as 'PF' | 'PJ'), null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CARD — PAYLOADS REAIS RECEBIDOS DO PORTAL BOSS (Tarefa 5) */}
        <div id="real-payloads-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Terminal className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Payloads reais recebidos do Portal BOSS</h3>
                <p className="text-[10px] text-slate-400">Banco de dados em tempo de execução na rota segura do GDI</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                Registrados ({jobsQueue.length})
              </span>
              {jobsQueue.length > 0 && (
                <button
                  type="button"
                  onClick={triggerClearJobsQueue}
                  className="p-1 text-slate-400 hover:text-rose-600 transition hover:bg-rose-50 rounded cursor-pointer"
                  title="Expurgar histórico do banco"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {jobsQueue.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
              <Terminal className="h-8 w-8 text-slate-350 mx-auto mb-2.5" />
              <p className="text-xs font-bold text-slate-755">Nenhum payload recebido.</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">O Portal ainda não alcançou este runtime GDI.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[455px] overflow-y-auto pr-1">
              {jobsQueue.map((job: any, index: number) => (
                <div key={job.id || index} className="bg-slate-50/70 border border-slate-150 rounded-xl p-4 space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 font-mono text-[11px]">#{job.id}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        ({job.receivedAt ? new Date(job.receivedAt).toLocaleTimeString('pt-BR') : new Date(job.createdAt).toLocaleTimeString('pt-BR')})
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                      job.status === 'success' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : job.status === 'received' || job.status === 'dry_run_received'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                        : job.status === 'processing' || job.status === 'validating'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {job.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 font-mono text-[10px] leading-tight">
                    <div>
                      <span className="text-[8.5px] uppercase text-slate-400 block font-sans">caseId</span>
                      <span className="text-slate-800 font-bold truncate block">{job.caseId || job.payload?.caseId || '(ausente)'}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] uppercase text-slate-400 block font-sans">clientId</span>
                      <span className="text-slate-800 font-bold truncate block">{job.clientId || job.payload?.clientId || '(ausente)'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[8.5px] uppercase text-slate-400 block font-sans">documentType</span>
                      <span className="text-blue-700 font-bold bg-blue-50/70 py-0.5 px-1.5 rounded truncate block" title={job.documentType || job.payload?.documentType}>
                        {job.documentType || job.payload?.documentType || '(ausente)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8.5px] uppercase text-slate-400 block font-sans">receivedAt</span>
                      <span className="text-slate-655 font-medium whitespace-nowrap block">
                        {job.receivedAt ? new Date(job.receivedAt).toLocaleString('pt-BR') : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8.5px] uppercase text-slate-400 block font-sans">processedAt</span>
                      <span className="text-slate-655 font-medium whitespace-nowrap block">
                        {job.processedAt ? new Date(job.processedAt).toLocaleString('pt-BR') : 'Pendente'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[8.5px] uppercase text-slate-400 block font-sans">googleDocsId</span>
                      <span className="text-slate-655 font-medium truncate block" title={job.result?.googleDocsId || job.googleDocsId}>
                        {job.result?.googleDocsId || job.googleDocsId || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {(job.result?.googleDocsUrl || job.googleDocsUrl) && (
                    <div className="bg-white border border-slate-200 rounded-lg p-2 flex items-center justify-between mt-1 animate-fadeIn">
                      <div className="truncate max-w-[80%] pr-2">
                        <span className="text-[8.5px] font-mono text-slate-400 block">googleDocsUrl:</span>
                        <a 
                          href={job.result?.googleDocsUrl || job.googleDocsUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-blue-600 font-bold underline hover:text-blue-800 text-[10.5px] truncate block"
                        >
                          {job.result?.googleDocsUrl || job.googleDocsUrl}
                        </a>
                      </div>
                      <a 
                        href={job.result?.googleDocsUrl || job.googleDocsUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-2 py-1 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-500 hover:text-blue-600 rounded flex items-center gap-1 text-[10px] shrink-0"
                        title="Ver arquivo final no Drive"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Abrir</span>
                      </a>
                    </div>
                  )}

                  {/* BARRA DE AÇÕES DO LOG DE PAYLOAD (Editar, Excluir, Visualizar, Copiar) */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200 mt-2">
                    {/* 1. Lápis para editar */}
                    <button
                      type="button"
                      onClick={() => handleEditJobPayload(job)}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer shadow-3xs"
                      title="Carregar payload no Editor JSON acima para editar"
                    >
                      <Pencil className="h-3 w-3 text-blue-500" />
                      <span>Editar</span>
                    </button>

                    {/* 2. Lixeira para excluir */}
                    <button
                      type="button"
                      onClick={() => handleDeleteSingleJob(job.id)}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer shadow-3xs"
                      title="Excluir este payload do histórico"
                    >
                      <Trash2 className="h-3 w-3 text-rose-500" />
                      <span>Excluir</span>
                    </button>

                    {/* 3. Olhinho para visualizar */}
                    <button
                      type="button"
                      onClick={() => {
                        const docUrl = job.result?.googleDocsUrl || job.googleDocsUrl;
                        if (docUrl) {
                          window.open(docUrl, '_blank');
                        } else {
                          alert(`O documento para este payload #${job.id} não foi gerado ou falhou no processamento.`);
                        }
                      }}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer shadow-3xs"
                      title="Visualizar documento gerado no Google Docs"
                    >
                      <Eye className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Visualizar</span>
                    </button>

                    {/* 4. Dois quadradinhos para copiar */}
                    <button
                      type="button"
                      onClick={() => handleCopyJobPayload(job.id, job.payload || job)}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer shadow-3xs"
                      title="Copiar payload JSON para área de transferência"
                    >
                      <Copy className="h-3 w-3 text-indigo-500" />
                      <span>{copiedJobId === job.id ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  {(job.errorCode || job.errorMessage) && (
                    <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-[10.5px] text-rose-800 animate-fadeIn font-mono leading-relaxed space-y-0.5 mt-2">
                      <div className="font-bold text-[9px] uppercase tracking-wider text-rose-900">Erro de Processamento</div>
                      <div><strong>Código:</strong> {job.errorCode || 'N/A'}</div>
                      <div><strong>Mensagem:</strong> {job.errorMessage || 'N/A'}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* SEÇÃO DA DIREITA: CONEXÕES DO SERVIDOR GOOGLE CLOUD */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* CARD — CONEXÃO LIVE GOOGLE CLOUD */}
        <div id="conexoes-google-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center space-x-2.5 mb-3.5 border-b border-slate-100 pb-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Status das Conexões com API Google</h3>
              <p className="text-[10px] text-slate-400">Handshakes reais de barramento síncrono</p>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* status 1: Auth */}
            <div className="border border-slate-150 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">1. Autenticação Cloud IAM</span>
                  <span className="text-xs font-bold text-slate-700">Conta de Serviço Google IAM</span>
                </div>
                {['conectado', 'autenticado', 'service_account_validada'].includes(googleAuthStatus) ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Conectado
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                    Desconectado
                  </span>
                )}
              </div>
              <button 
                onClick={triggerGoogleAuthDiagnostics}
                className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-705 border border-slate-250 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                <span>Testar Autenticação Cloud</span>
              </button>
            </div>

            {/* status 2: Google Docs Docs API */}
            <div className="border border-slate-150 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">2. Google Docs API Connector</span>
                  <span className="text-xs font-bold text-slate-700">Edição e Clone de Templates</span>
                </div>
                {googleDocsStatus === 'conectado' ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Conectado
                  </span>
                ) : googleDocsStatus === 'não_configurado' ? (
                  <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-mono px-2 py-0.5 rounded">
                    Não configurado
                  </span>
                ) : (
                  <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                     Erro API
                  </span>
                )}
              </div>
              <button 
                onClick={triggerGoogleDocsDiagnostics}
                className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-705 border border-slate-250 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                <span>Testar Google Docs API</span>
              </button>
            </div>

            {/* status 3: Google Drive API */}
            <div className="border border-slate-150 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">3. Google Drive Service</span>
                  <span className="text-xs font-bold text-slate-700">Salvamento e Permissões de Pasta</span>
                </div>
                {googleDriveStatus === 'conectado' ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Conectado
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-550 border border-slate-200 text-[10px] font-mono px-2 py-0.5 rounded">
                    Desconectado
                  </span>
                )}
              </div>
              <button 
                onClick={triggerGoogleDriveDiagnostics}
                className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-705 border border-slate-250 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                <span>Testar Google Drive API</span>
              </button>
            </div>

          </div>
        </div>

        {/* CARD — LOGS EM TEMPO REAL DENTRO DO PAINEL */}
        <div id="live-activity-logs" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center space-x-2.5 mb-3 border-b border-slate-100 pb-3">
            <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-650 flex items-center justify-center border border-slate-100">
              <History className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Histórico Recente de Ações Logadas</h3>
              <p className="text-[10px] text-slate-400">Acontecimentos, handshakes e retornos faturados cronologicamente</p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-[10.5px] leading-normal text-slate-600 max-h-[280px] overflow-y-auto pr-1">
            {userActionLogs.length === 0 ? (
              <p className="text-center italic text-slate-400 py-6">Nenhum evento registrado nesta sessão.</p>
            ) : (
              userActionLogs.map((log: any, index: number) => (
                <div key={index} className="border-l-2 border-slate-200 pl-3 py-0.5 relative">
                  <span className={`absolute left-[-4px] top-1.5 h-2 w-2 rounded-full border border-white ${
                    log.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}></span>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5">
                    <span>{log.timestamp}</span>
                    <span className={`font-bold uppercase ${log.status === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>{log.step}</span>
                  </div>
                  <p className="font-bold text-slate-850 leading-relaxed">{log.message}</p>
                  {log.details && <p className="text-[9px] text-slate-500 font-sans mt-0.5">{log.details}</p>}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
    </div>
  );
};
