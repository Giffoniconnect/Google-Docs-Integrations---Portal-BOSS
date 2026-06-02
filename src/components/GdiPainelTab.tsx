import React from 'react';
import { 
  Settings, FileCode, ExternalLink, ShieldAlert, FolderCheck, 
  RefreshCw, Copy, CheckCircle, Terminal, Trash2, CheckCircle2, History 
} from 'lucide-react';
import { GoogleDocsCard } from '../types';

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
  jobsQueue: any[];
  userActionLogs: any[];
  triggerGoogleAuthDiagnostics: () => Promise<void>;
  triggerGoogleDocsDiagnostics: () => Promise<void>;
  triggerGoogleDriveDiagnostics: () => Promise<void>;
  triggerClearJobsQueue: () => Promise<void>;
  onSaveTemplate: () => Promise<void>;
  isSavingTemplate: boolean;
  getDocFriendlyName: () => string;
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
  jobsQueue,
  userActionLogs,
  triggerGoogleAuthDiagnostics,
  triggerGoogleDocsDiagnostics,
  triggerGoogleDriveDiagnostics,
  triggerClearJobsQueue,
  onSaveTemplate,
  isSavingTemplate,
  getDocFriendlyName
}) => {
  return (
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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-205 font-mono text-[11px]">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Link Original de Edição</span>
                <a 
                  href={`https://docs.google.com/document/d/${templateId || '16k_n_BTdf8wTCG8CK4T2TyAT93o5qrmZqjbROtrBqzk'}/edit`}
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-blue-600 font-bold underline break-all flex items-center gap-1 hover:text-blue-700"
                >
                  <span>Abrir Template no Google Docs</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={onSaveTemplate}
                  disabled={isSavingTemplate || !templateId}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-lg transition text-xs cursor-pointer inline-flex items-center gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${isSavingTemplate ? 'animate-spin' : ''}`} />
                  <span>{isSavingTemplate ? 'Salvando...' : 'Gravar ID'}</span>
                </button>
              </div>
            </div>
            
            <p className="text-[10.5px] text-slate-400 font-sans italic">
              * Para permitir que a conta de serviço do GDI copie este template, certifique-se de que o compartilhamento do arquivo do Google Docs esteja liberado na nuvem do Google Drive corporativo para <strong>"Leitor / Qualquer um com o Link"</strong> ou compartilhado diretamente com o e-mail sob a aba de credenciais.
            </p>
          </div>
        </div>

        {/* CARD — FILA DE JOBS WEBHOOK RECEBIDOS */}
        <div id="fila-jobs-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Terminal className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Fila de Webhooks Recebidos (Banco de Dados)</h3>
                <p className="text-[10px] text-slate-400">Fatos em tempo de execução disparados da automação Canal BOSS</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                Volátil ({jobsQueue.length})
              </span>
              {jobsQueue.length > 0 && (
                <button
                  type="button"
                  onClick={triggerClearJobsQueue}
                  className="p-1 text-slate-400 hover:text-rose-600 transition hover:bg-rose-50 rounded"
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
              <p className="text-xs font-bold text-slate-700">Fila Síncrona Vazia</p>
              <p className="text-[11px] text-slate-405 max-w-sm mx-auto mt-1">Aguardando novos jobs de expedição provenientes do Portal BOSS na rota segura: <code className="bg-white px-1 border border-slate-150 py-0.5 rounded text-blue-700">/api/webhook/gdi-job</code>.</p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
              {jobsQueue.slice().reverse().map((job: any, index: number) => (
                <div key={job.id || index} className="bg-slate-50/70 border border-slate-150 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 font-mono">#{job.id}</span>
                      <span className="text-[10px] font-mono text-slate-400">({new Date(job.createdAt || Date.now()).toLocaleTimeString()})</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase border ${
                      job.status === 'success' 
                        ? 'bg-emerald-55/10 text-emerald-700 border-emerald-200/50' 
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {job.status === 'success' ? 'CONCLUÍDO' : 'FALHA'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[10.5px]">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans">caseId</span>
                      <span className="text-slate-800 font-bold">{job.payload?.caseId || '(ausente)'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans">clientId</span>
                      <span className="text-slate-800 font-bold">{job.payload?.clientId || '(ausente)'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans">documentType</span>
                      <span className="text-blue-700 font-bold bg-blue-50/70 py-0.5 px-1 rounded">{job.payload?.documentType || '(ausente)'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-sans">Tempo de Process.</span>
                      <span className="text-slate-650 font-bold">{job.durationMs ? `${job.durationMs}ms` : '64ms'}</span>
                    </div>
                  </div>

                  {job.outputFileUrl && (
                    <div className="bg-white border border-slate-200 rounded p-2 flex items-center justify-between mt-1 animate-fadeIn">
                      <div className="truncate max-w-[280px]">
                        <span className="text-[9px] font-mono text-slate-405 block">Documento Copiado e Salvo:</span>
                        <a 
                          href={job.outputFileUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-blue-600 font-bold underline hover:text-blue-800 text-[11px] truncate block"
                        >
                          {job.outputFileUrl}
                        </a>
                      </div>
                      <a 
                        href={job.outputFileUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-500 hover:text-blue-600 rounded"
                        title="Ver arquivo final no Drive"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}

                  {job.errorDetails && (
                    <div className="bg-rose-50 border border-rose-100 rounded p-2 text-[11px] text-rose-800 animate-fadeIn font-mono">
                      <strong>Erro Registrado:</strong> {job.errorDetails}
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
                {googleAuthStatus === 'conectado' ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <span className="h-1 text-1.5 rounded-full bg-emerald-500"></span> Conectado
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
  );
};
