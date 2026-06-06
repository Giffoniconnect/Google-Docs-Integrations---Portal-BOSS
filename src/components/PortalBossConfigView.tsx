import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings, 
  Key, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Globe, 
  Database, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Pencil, 
  Copy, 
  X, 
  Save, 
  RefreshCw, 
  Send, 
  FileJson, 
  AlertTriangle,
  Folder,
  ArrowUpRight
} from 'lucide-react';

export default function PortalBossConfigView() {
  const navigate = useNavigate();

  // --- COMPONENT STATE ---
  const [gdiEnv, setGdiEnv] = useState<'preview' | 'production'>('preview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Fields state (Portal BOSS)
  const [endpointUrl, setEndpointUrl] = useState<string>('');
  const [webhookUrl, setWebhookUrl] = useState<string>('https://api.portalboss.com.br/gdi/webhook');
  const [templateId, setTemplateId] = useState<string>('16k_n_BTdf8wTCG8CK4T2TyAT93o5qrmZqjbROtrBqzk');
  const [templateKey, setTemplateKey] = useState<string>(''); // X-BOSS-Google-Docs-Integration-Key
  const [destinationFolderId, setDestinationFolderId] = useState<string>('1fhMk2RMwEM7RlDCEOlKl5CsEjujX5zMJ');
  const [destinationFolderUrl, setDestinationFolderUrl] = useState<string>('https://drive.google.com/drive/folders/1fhMk2RMwEM7RlDCEOlKl5CsEjujX5zMJ');
  const [serviceAccountEmail, setServiceAccountEmail] = useState<string>('firebase-adminsdk-fbsvc@planar-granite-495814-r8.iam.gserviceaccount.com');
  const [projectId, setProjectId] = useState<string>('planar-granite-495814-r8');
  const [callbackSecret, setCallbackSecret] = useState<string>('boss_callback_sec_8849');
  
  // Payloads & Logs
  const [payloadReceived, setPayloadReceived] = useState<string>(`{
  "event": "document.create",
  "source": "Portal BOSS Clientes",
  "documentType": "procuracao_pf",
  "caseId": "CASE-2026-0605",
  "clientId": "CLI-889",
  "data": {
    "outorgante_nome": "Felipe Giffoni",
    "outorgante_nacionalidade": "Brasileiro",
    "outorgante_estado_civil": "Casado",
    "outorgante_profissao": "Advogado",
    "outorgante_cpf": "111.222.333-44"
  }
}`);
  const [payloadSent, setPayloadSent] = useState<string>(`{
  "status": "success",
  "gdiJobId": "job-8874-gdocs-pf",
  "documentUrl": "https://docs.google.com/document/d/16k_n_BTdf8wTCG8CK4T2TyAT93o5qrmZqjbROtrBqzk/edit",
  "pdfUrl": "https://drive.google.com/file/d/992_pdf_export_id/view"
}`);
  const [lastError, setLastError] = useState<string>('Nenhum erro registrado.');
  const [lastResponse, setLastResponse] = useState<string>('{"success":true,"jobStatus":"processed"}');
  const [lastSuccess, setLastSuccess] = useState<string>('Documento gerado com sucesso via GDI.');

  // GDI Side configuration fetched for comparison
  const [gdiIntegrationKey, setGdiIntegrationKey] = useState<string>('');
  
  // UI States
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modalData, setModalData] = useState<{ title: string; text: string } | null>(null);
  const [confirmData, setConfirmData] = useState<{
    title?: string;
    message: string;
    confirmText?: string;
    type?: 'delete' | 'auth';
    toastOnConfirm?: string;
    onConfirm: () => void;
  } | null>(null);
  
  // Fields in editing mode
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});
  const [tempValues, setTempValues] = useState<Record<string, string>>({});

  // Reveal switches
  const [revealedFields, setRevealedFields] = useState<Record<string, boolean>>({});

  // Fetch initial config from server
  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        const envMode = data.viteGdiEnv === 'production' ? 'production' : 'preview';
        setGdiEnv(envMode);
        setGdiIntegrationKey(data.gdiIntegrationKey || '');
        
        // Seed default endpointUrl to current address
        const originUrl = window.location.origin;
        setEndpointUrl(data.viteGdiPublicBaseUrl || originUrl);
        
        // Set other loaded values if defined
        if (data.gdiIntegrationKey) setTemplateKey(data.gdiIntegrationKey);
        if (data.gdiPortalBossWebhookUrl) setWebhookUrl(data.gdiPortalBossWebhookUrl);
        if (data.gdiGoogleServiceAccountEmail) setServiceAccountEmail(data.gdiGoogleServiceAccountEmail);
        if (data.gdiGoogleProjectId) setProjectId(data.gdiGoogleProjectId);
        if (data.gdiPortalBossCallbackSecret) setCallbackSecret(data.gdiPortalBossCallbackSecret);
      }
    } catch (err) {
      console.error("Erro ao carregar configurações do GDI receptor", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    
    // Load from local storage if exists
    const bossEndpoint = localStorage.getItem('pb_endpointUrl');
    if (bossEndpoint) setEndpointUrl(bossEndpoint);
    const bossWebhook = localStorage.getItem('pb_webhookUrl');
    if (bossWebhook) setWebhookUrl(bossWebhook);
    const bossTemplate = localStorage.getItem('pb_templateId');
    if (bossTemplate) setTemplateId(bossTemplate);
    const bossTemplateKey = localStorage.getItem('pb_templateKey');
    if (bossTemplateKey) setTemplateKey(bossTemplateKey);
    const bossDestFolder = localStorage.getItem('pb_destinationFolderId');
    if (bossDestFolder) setDestinationFolderId(bossDestFolder);
    const bossDestFolderUrl = localStorage.getItem('pb_destinationFolderUrl');
    if (bossDestFolderUrl) setDestinationFolderUrl(bossDestFolderUrl);
    const bossSa = localStorage.getItem('pb_serviceAccountEmail');
    if (bossSa) setServiceAccountEmail(bossSa);
    const bossProjectId = localStorage.getItem('pb_projectId');
    if (bossProjectId) setProjectId(bossProjectId);
    const bossCallbackSecret = localStorage.getItem('pb_callbackSecret');
    if (bossCallbackSecret) setCallbackSecret(bossCallbackSecret);
  }, []);

  // Show customized toast notice
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Switch between preview and production modes
  const handleToggleEnv = async (mode: 'preview' | 'production') => {
    try {
      setGdiEnv(mode);
      const payload = { viteGdiEnv: mode };
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(`Ambiente alterado para: ${mode === 'production' ? 'DEPOY BLINDADO' : 'PREVIEW ABERTO'}`);
      } else {
        showToast("Erro ao sincronizar ambiente com o servidor backend.");
      }
    } catch (err) {
      console.error(err);
      showToast("Não foi possível salvar o estado do ambiente no backend.");
    }
  };

  // Field Operators and Utilities
  const startEditField = (fieldName: string, currentValue: string) => {
    setEditingFields(prev => ({ ...prev, [fieldName]: true }));
    setTempValues(prev => ({ ...prev, [fieldName]: currentValue }));
  };

  const cancelEditField = (fieldName: string) => {
    setEditingFields(prev => ({ ...prev, [fieldName]: false }));
  };

  const saveField = async (fieldName: string, valueSetter: (val: string) => void) => {
    const newVal = tempValues[fieldName] !== undefined ? tempValues[fieldName] : '';
    valueSetter(newVal);
    setEditingFields(prev => ({ ...prev, [fieldName]: false }));
    localStorage.setItem(`pb_${fieldName}`, newVal);
    showToast("Sucesso! O parâmetro foi salvo.");

    // Sincronizar dados importantes com o servidor GDI se for campo mapeado
    try {
      let gdiPayload: any = {};
      if (fieldName === 'templateKey') gdiPayload.gdiIntegrationKey = newVal;
      if (fieldName === 'webhookUrl') gdiPayload.gdiPortalBossWebhookUrl = newVal;
      if (fieldName === 'serviceAccountEmail') gdiPayload.gdiGoogleServiceAccountEmail = newVal;
      if (fieldName === 'projectId') gdiPayload.gdiGoogleProjectId = newVal;
      if (fieldName === 'callbackSecret') gdiPayload.gdiPortalBossCallbackSecret = newVal;
      
      if (Object.keys(gdiPayload).length > 0) {
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gdiPayload)
        });
        // Reload comparison variables
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          setGdiIntegrationKey(data.gdiIntegrationKey || '');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearField = (fieldName: string, valueSetter: (val: string) => void) => {
    setConfirmData({
      message: `Deseja realmente limpar o valor do campo "${fieldName}"?`,
      onConfirm: () => {
        valueSetter('');
        localStorage.removeItem(`pb_${fieldName}`);
        showToast("Valores limpos com sucesso! Salvo.");
      }
    });
  };

  const copyField = (fieldName: string, value: string) => {
    if (!value) {
      showToast("Nada para copiar! O campo está vazio.");
      return;
    }
    navigator.clipboard.writeText(value);
    showToast("Sucesso! O parâmetro foi copiado.");
  };

  const viewField = (fieldName: string, label: string, value: string) => {
    if (gdiEnv === 'production') {
      // Deploy Blindado mode requires confirmation
      setConfirmData({
         title: "Autorizar Visualização (DEPLOY BLINDADO)",
         message: `MODO DEPLOY BLINDADO: Para visualizar este segredo sensível, confirme a autorização do operador Giffoni.`,
         confirmText: "Autorizar",
         type: "auth",
         toastOnConfirm: "Visualização autorizada com sucesso!",
         onConfirm: () => {
           setModalData({ title: label, text: value || 'Sem valor definido' });
         }
      });
    } else {
      // Open instant visualization in preview
      setModalData({ title: label, text: value || 'Sem valor definido' });
    }
  };

  const handleCopyGdiToBossKey = () => {
    if (!gdiIntegrationKey) {
      showToast("Erro: Nenhuma chave cadastrada no GDI para copiar.");
      return;
    }
    setTemplateKey(gdiIntegrationKey);
    localStorage.setItem('pb_templateKey', gdiIntegrationKey);
    showToast("Sincronizado! Chave copiada do GDI para o Portal BOSS.");
  };

  // Helper values to check key mismatch
  const keysMatch = templateKey && gdiIntegrationKey && templateKey === gdiIntegrationKey;

  // Mask function for production
  const maskSensitiveValue = (val: string, isRevealed: boolean) => {
    if (!val) return 'Não definido';
    if (gdiEnv === 'preview' || isRevealed) {
      return val;
    }
    // Production mask
    if (val.length <= 8) return '••••••••';
    return val.substring(0, 4) + '••••••••••••••••' + val.substring(val.length - 4);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase font-mono">
              Portal BOSS Clientes
            </span>
            <span className="bg-slate-205 text-slate-500 font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-200">Área de Integração</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="h-6 w-6 text-indigo-600" />
            <span>Configurações • Integração de Google Docs</span>
          </h1>
          <p className="text-xs text-slate-500 max-w-3xl">
            Ambiente técnico para mapeamento do cabeçalho <code className="bg-slate-100 px-1 rounded text-red-600 font-mono">X-BOSS-Google-Docs-Integration-Key</code>, endpoints de destino e status dos webhooks associados.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button 
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-350 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer font-sans"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Central</span>
          </button>
          
          <button 
            type="button"
            onClick={fetchConfig}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition cursor-pointer text-slate-500 hover:text-slate-700"
            title="Recarregar Parâmetros"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* TAREFA 2 & TAREFA 3 — BANDEIRAS DE AMBIENTE (INTERATIVO) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Environment Selector and Visual Cards */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm font-sans flex items-center gap-2">
                  <Settings className="h-4 w-4 text-indigo-500" />
                  <span>Seletor de Segurança de Barramento</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Defina o modo de blindagem do motor de integração para habilitar auditorias ou mascaramento avançado.
                </p>
              </div>

              {/* Toggle controls */}
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-150">
                <button
                  type="button"
                  onClick={() => handleToggleEnv('preview')}
                  className={`px-3 py-1.5 text-xs font-bold font-sans rounded-md transition-all cursor-pointer ${gdiEnv === 'preview' ? 'bg-white text-blue-650 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Modo Preview Aberto
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleEnv('production')}
                  className={`px-3 py-1.5 text-xs font-bold font-sans rounded-md transition-all cursor-pointer ${gdiEnv === 'production' ? 'bg-white text-indigo-650 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Deploy Blindado
                </button>
              </div>
            </div>

            {/* Render chosen Mode Card */}
            {gdiEnv === 'preview' ? (
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-5 flex items-start gap-4 animate-in fade-in duration-200">
                <div className="h-10 w-10 rounded-xl bg-blue-105 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest font-mono">
                    MODO PREVIEW ABERTO
                  </h4>
                  <p className="text-xs text-blue-800 font-bold">
                    Diagnóstico liberado.
                  </p>
                  <p className="text-[11.5px] text-blue-600 leading-relaxed">
                    Valores técnicos e chaves sensíveis estão visíveis na área técnica para facilitar correções de canais de webhook. A blindagem automatizada de produção será aplicada apenas no deploy oficial.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-5 flex items-start gap-4 animate-in fade-in duration-200">
                <div className="h-10 w-10 rounded-xl bg-rose-105 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                  <XCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-rose-900 uppercase tracking-widest font-mono">
                    MODO DEPLOY BLINDADO
                  </h4>
                  <p className="text-xs text-rose-800 font-bold">
                    Credenciais sensíveis protegidas.
                  </p>
                  <p className="text-[11.5px] text-rose-600 leading-relaxed">
                    Chaves secretas, private keys e tokens de barramento serão mascarados com segurança em produção. A visualização extensa exige confirmação prévia para evitar espionagem lógica e proteger logs de webhooks.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TAREFA 6 — CARD DE COMPARAÇÃO VISUAL */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide font-mono">
                  Comparador Entre Portais
                </h3>
                <p className="text-[10px] text-slate-400">Auditoria lógica cruzada BOSS ⇆ GDI</p>
              </div>

              <div className="space-y-4 text-[11px] font-mono leading-tight">
                <div className="space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  <span className="text-[9px] font-sans font-bold text-orange-655 uppercase block">Portal BOSS enviará:</span>
                  <div><strong>Endpoint:</strong> POST {endpointUrl ? endpointUrl : 'http://gdi-server'}/api/webhook/gdi-job</div>
                  <div className="truncate" title="X-BOSS-Google-Docs-Integration-Key"><strong>Header:</strong> X-BOSS-Google-Docs-Integration-Key</div>
                  <div className="truncate"><strong>Valor:</strong> {templateKey ? maskSensitiveValue(templateKey, false) : 'Não definido'}</div>
                </div>

                <div className="space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  <span className="text-[9px] font-sans font-bold text-blue-655 uppercase block">GDI espera:</span>
                  <div><strong>Endpoint:</strong> POST /api/webhook/gdi-job</div>
                  <div className="truncate" title="X-BOSS-Google-Docs-Integration-Key"><strong>Header:</strong> X-BOSS-Google-Docs-Integration-Key</div>
                  <div className="truncate"><strong>Valor esperado:</strong> {gdiIntegrationKey ? maskSensitiveValue(gdiIntegrationKey, false) : 'Não definido'}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              {keysMatch ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>Chaves sincronizadas</span>
                  </div>
                  <p className="text-[10.5px] text-emerald-650 leading-relaxed font-sans">
                    O Portal BOSS está plenamente apto a enviar payloads reais e ser reconhecido pelo normalizador do GDI.
                  </p>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>Chaves divergentes</span>
                  </div>
                  <p className="text-[10.5px] text-rose-650 leading-relaxed font-sans font-medium">
                    O GDI <strong>não reconhecerá</strong> o payload real. Sincronize colando a Chave de Auditoria do GDI no campo correspondente ou clique abaixo.
                  </p>
                  
                  {gdiIntegrationKey && (
                    <button
                      type="button"
                      onClick={handleCopyGdiToBossKey}
                      className="mt-2 w-full py-1 px-2 bg-white hover:bg-rose-100/30 border border-rose-200 hover:border-rose-300 text-rose-700 font-bold text-[10px] rounded transition cursor-pointer"
                    >
                      Autocollocar Chave GDI no BOSS
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* TAREFA 1 — CONFIGURADOR DE CAMPOS COM BOTÕES OPERACIONAIS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <h3 className="font-bold text-slate-900 text-sm font-sans flex items-center gap-2">
            <Key className="h-4.5 w-4.5 text-indigo-500" />
            <span>Mapeador de Chaves de Integração (Campos Técnicos Relevantes)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Gerencie cada segredo e parâmetro da webhook. Clique em Editar para alterar, Copiar para transferir ou Visualizar para ler.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* 1. endpointUrl */}
          <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Destination Endpoint URL (GDI Receptor)</label>
              {editingFields['endpointUrl'] ? (
                <input 
                  type="text"
                  value={tempValues['endpointUrl'] || ''}
                  onChange={(e) => setTempValues({ ...tempValues, endpointUrl: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono text-[11px]"
                />
              ) : (
                <div className="text-[11px] font-mono text-indigo-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg truncate select-all font-semibold">
                  {endpointUrl || 'Não definido'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {editingFields['endpointUrl'] ? (
                <>
                  <button onClick={() => saveField('endpointUrl', setEndpointUrl)} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Save className="h-3 w-3" /> <span>Salvar</span>
                  </button>
                  <button onClick={() => cancelEditField('endpointUrl')} className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-650 font-bold text-[10px] rounded cursor-pointer">
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditField('endpointUrl', endpointUrl)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Pencil className="h-3 w-3 text-blue-500" /> <span>Editar</span>
                  </button>
                  <button onClick={() => clearField('endpointUrl', setEndpointUrl)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Trash2 className="h-3 w-3 text-rose-500" /> <span>Excluir</span>
                  </button>
                </>
              )}
              <button onClick={() => viewField('endpointUrl', 'Destination Endpoint URL', endpointUrl)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Eye className="h-3 w-3 text-emerald-500" /> <span>Visualizar</span>
              </button>
              <button onClick={() => copyField('endpointUrl', endpointUrl)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Copy className="h-3 w-3 text-blue-500" /> <span>Copiar</span>
              </button>
              <button onClick={() => navigate(-1)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                Voltar
              </button>
            </div>
          </div>

          {/* 2. webhookUrl */}
          <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Webhook Callback URL (BOSS Side)</label>
              {editingFields['webhookUrl'] ? (
                <input 
                  type="text"
                  value={tempValues['webhookUrl'] || ''}
                  onChange={(e) => setTempValues({ ...tempValues, webhookUrl: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono text-[11px]"
                />
              ) : (
                <div className="text-[11px] font-mono text-purple-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg truncate select-all font-semibold">
                  {webhookUrl || 'Não definido'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {editingFields['webhookUrl'] ? (
                <>
                  <button onClick={() => saveField('webhookUrl', setWebhookUrl)} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Save className="h-3 w-3" /> <span>Salvar</span>
                  </button>
                  <button onClick={() => cancelEditField('webhookUrl')} className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-650 font-bold text-[10px] rounded cursor-pointer">
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditField('webhookUrl', webhookUrl)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Pencil className="h-3 w-3 text-blue-500" /> <span>Editar</span>
                  </button>
                  <button onClick={() => clearField('webhookUrl', setWebhookUrl)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Trash2 className="h-3 w-3 text-rose-500" /> <span>Excluir</span>
                  </button>
                </>
              )}
              <button onClick={() => viewField('webhookUrl', 'Webhook Callback URL', webhookUrl)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Eye className="h-3 w-3 text-emerald-500" /> <span>Visualizar</span>
              </button>
              <button onClick={() => copyField('webhookUrl', webhookUrl)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Copy className="h-3 w-3 text-blue-500" /> <span>Copiar</span>
              </button>
              <button onClick={() => navigate(-1)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                Voltar
              </button>
            </div>
          </div>

          {/* 3. templateId */}
          <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Google Docs templateId</label>
              {editingFields['templateId'] ? (
                <input 
                  type="text"
                  value={tempValues['templateId'] || ''}
                  onChange={(e) => setTempValues({ ...tempValues, templateId: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono text-[11px]"
                />
              ) : (
                <div className="text-[11px] font-mono text-slate-750 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg truncate select-all">
                  {templateId || 'Não definido'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {editingFields['templateId'] ? (
                <>
                  <button onClick={() => saveField('templateId', setTemplateId)} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Save className="h-3 w-3" /> <span>Salvar</span>
                  </button>
                  <button onClick={() => cancelEditField('templateId')} className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-650 font-bold text-[10px] rounded cursor-pointer">
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditField('templateId', templateId)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Pencil className="h-3 w-3 text-blue-500" /> <span>Editar</span>
                  </button>
                  <button onClick={() => clearField('templateId', setTemplateId)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Trash2 className="h-3 w-3 text-rose-500" /> <span>Excluir</span>
                  </button>
                </>
              )}
              <button onClick={() => viewField('templateId', 'Google Docs Template ID', templateId)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Eye className="h-3 w-3 text-emerald-500" /> <span>Visualizar</span>
              </button>
              <button onClick={() => copyField('templateId', templateId)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Copy className="h-3 w-3 text-blue-500" /> <span>Copiar</span>
              </button>
              <button onClick={() => navigate(-1)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                Voltar
              </button>
            </div>
          </div>

          {/* 4. templateKey / X-BOSS-Google-Docs-Integration-Key */}
          <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                Chave secreta do header X-BOSS-Google-Docs-Integration-Key (Portal BOSS)
              </label>
              {editingFields['templateKey'] ? (
                <input 
                  type={revealedFields['templateKey'] ? 'text' : 'password'}
                  value={tempValues['templateKey'] || ''}
                  onChange={(e) => setTempValues({ ...tempValues, templateKey: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono text-[11px]"
                />
              ) : (
                <div className="text-[11px] font-mono text-emerald-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg truncate select-all font-bold">
                  {maskSensitiveValue(templateKey, !!revealedFields['templateKey'])}
                </div>
              )}
            </div>
            
            {/* Explanatory text (TAREFA 4) */}
            <p className="text-[9.5px] text-slate-400 leading-tight">
              Esta é a chave de auditoria que deve corresponder exatamente ao valor mapeado no GDI receptor.
            </p>

            <div className="flex items-center gap-1.5 mt-3">
              {editingFields['templateKey'] ? (
                <>
                  <button onClick={() => saveField('templateKey', setTemplateKey)} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Save className="h-3 w-3" /> <span>Salvar</span>
                  </button>
                  <button onClick={() => cancelEditField('templateKey')} className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-655 font-bold text-[10px] rounded cursor-pointer">
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditField('templateKey', templateKey)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Pencil className="h-3 w-3 text-blue-500" /> <span>Editar</span>
                  </button>
                  <button onClick={() => clearField('templateKey', setTemplateKey)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Trash2 className="h-3 w-3 text-rose-500" /> <span>Excluir</span>
                  </button>
                </>
              )}
              <button 
                onClick={() => {
                  if (gdiEnv === 'production') {
                    setConfirmData({
                      message: "Deseja realmente revelar esta chave sensível?",
                      onConfirm: () => setRevealedFields(prev => ({ ...prev, templateKey: !prev['templateKey'] }))
                    });
                  } else {
                    setRevealedFields(prev => ({ ...prev, templateKey: !prev['templateKey'] }));
                  }
                }} 
                className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer"
              >
                {revealedFields['templateKey'] ? <EyeOff className="h-3 w-3 text-rose-500" /> : <Eye className="h-3 w-3 text-emerald-555" />}
                <span>{revealedFields['templateKey'] ? 'Mascarar' : 'Revelar'}</span>
              </button>
              <button onClick={() => viewField('templateKey', 'Chave Secreta X-BOSS-Google-Docs-Integration-Key', templateKey)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <span>Visualizar</span>
              </button>
              <button onClick={() => copyField('templateKey', templateKey)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Copy className="h-3 w-3 text-blue-500" /> <span>Copiar</span>
              </button>
              <button onClick={() => navigate(-1)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                Voltar
              </button>
            </div>
          </div>

          {/* 5. destinationFolderId */}
          <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">destinationFolderId (Google Drive)</label>
              {editingFields['destinationFolderId'] ? (
                <input 
                  type="text"
                  value={tempValues['destinationFolderId'] || ''}
                  onChange={(e) => setTempValues({ ...tempValues, destinationFolderId: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono text-[11px]"
                />
              ) : (
                <div className="text-[11px] font-mono text-slate-755 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg truncate select-all">
                  {destinationFolderId || 'Não definido'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {editingFields['destinationFolderId'] ? (
                <>
                  <button onClick={() => saveField('destinationFolderId', setDestinationFolderId)} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Save className="h-3 w-3" /> <span>Salvar</span>
                  </button>
                  <button onClick={() => cancelEditField('destinationFolderId')} className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-655 font-bold text-[10px] rounded cursor-pointer">
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditField('destinationFolderId', destinationFolderId)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Pencil className="h-3 w-3 text-blue-500" /> <span>Editar</span>
                  </button>
                  <button onClick={() => clearField('destinationFolderId', setDestinationFolderId)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Trash2 className="h-3 w-3 text-rose-500" /> <span>Excluir</span>
                  </button>
                </>
              )}
              <button onClick={() => viewField('destinationFolderId', 'Google Drive Folder ID', destinationFolderId)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Eye className="h-3 w-3 text-emerald-500" /> <span>Visualizar</span>
              </button>
              <button onClick={() => copyField('destinationFolderId', destinationFolderId)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Copy className="h-3 w-3 text-blue-500" /> <span>Copiar</span>
              </button>
              <button onClick={() => navigate(-1)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                Voltar
              </button>
            </div>
          </div>

          {/* 6. destinationFolderUrl */}
          <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">destinationFolderUrl (Google Drive link)</label>
              {editingFields['destinationFolderUrl'] ? (
                <input 
                  type="text"
                  value={tempValues['destinationFolderUrl'] || ''}
                  onChange={(e) => setTempValues({ ...tempValues, destinationFolderUrl: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono text-[11px]"
                />
              ) : (
                <div className="text-[11px] font-mono text-blue-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg truncate select-all font-semibold">
                  {destinationFolderUrl || 'Não definido'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {editingFields['destinationFolderUrl'] ? (
                <>
                  <button onClick={() => saveField('destinationFolderUrl', setDestinationFolderUrl)} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Save className="h-3 w-3" /> <span>Salvar</span>
                  </button>
                  <button onClick={() => cancelEditField('destinationFolderUrl')} className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-655 font-bold text-[10px] rounded cursor-pointer">
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditField('destinationFolderUrl', destinationFolderUrl)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Pencil className="h-3 w-3 text-blue-500" /> <span>Editar</span>
                  </button>
                  <button onClick={() => clearField('destinationFolderUrl', setDestinationFolderUrl)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Trash2 className="h-3 w-3 text-rose-500" /> <span>Excluir</span>
                  </button>
                </>
              )}
              <button onClick={() => viewField('destinationFolderUrl', 'Google Drive Folder Link', destinationFolderUrl)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Eye className="h-3 w-3 text-emerald-500" /> <span>Visualizar</span>
              </button>
              <button onClick={() => copyField('destinationFolderUrl', destinationFolderUrl)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Copy className="h-3 w-3 text-blue-500" /> <span>Copiar</span>
              </button>
              <button onClick={() => navigate(-1)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                Voltar
              </button>
            </div>
          </div>

          {/* 7. Service Account Email */}
          <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Google Service Account Email</label>
              {editingFields['serviceAccountEmail'] ? (
                <input 
                  type="text"
                  value={tempValues['serviceAccountEmail'] || ''}
                  onChange={(e) => setTempValues({ ...tempValues, serviceAccountEmail: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono text-[11px]"
                />
              ) : (
                <div className="text-[11px] font-mono text-slate-750 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg truncate select-all">
                  {serviceAccountEmail || 'Não definido'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {editingFields['serviceAccountEmail'] ? (
                <>
                  <button onClick={() => saveField('serviceAccountEmail', setServiceAccountEmail)} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Save className="h-3 w-3" /> <span>Salvar</span>
                  </button>
                  <button onClick={() => cancelEditField('serviceAccountEmail')} className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-655 font-bold text-[10px] rounded cursor-pointer">
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditField('serviceAccountEmail', serviceAccountEmail)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Pencil className="h-3 w-3 text-blue-500" /> <span>Editar</span>
                  </button>
                  <button onClick={() => clearField('serviceAccountEmail', setServiceAccountEmail)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Trash2 className="h-3 w-3 text-rose-500" /> <span>Excluir</span>
                  </button>
                </>
              )}
              <button onClick={() => viewField('serviceAccountEmail', 'Google Service Account Email', serviceAccountEmail)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Eye className="h-3 w-3 text-emerald-500" /> <span>Visualizar</span>
              </button>
              <button onClick={() => copyField('serviceAccountEmail', serviceAccountEmail)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Copy className="h-3 w-3 text-blue-500" /> <span>Copiar</span>
              </button>
              <button onClick={() => navigate(-1)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                Voltar
              </button>
            </div>
          </div>

          {/* 8. Project ID */}
          <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Google Cloud Project ID</label>
              {editingFields['projectId'] ? (
                <input 
                  type="text"
                  value={tempValues['projectId'] || ''}
                  onChange={(e) => setTempValues({ ...tempValues, projectId: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono text-[11px]"
                />
              ) : (
                <div className="text-[11px] font-mono text-slate-750 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg truncate select-all">
                  {projectId || 'Não definido'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {editingFields['projectId'] ? (
                <>
                  <button onClick={() => saveField('projectId', setProjectId)} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Save className="h-3 w-3" /> <span>Salvar</span>
                  </button>
                  <button onClick={() => cancelEditField('projectId')} className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-655 font-bold text-[10px] rounded cursor-pointer">
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditField('projectId', projectId)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Pencil className="h-3 w-3 text-blue-500" /> <span>Editar</span>
                  </button>
                  <button onClick={() => clearField('projectId', setProjectId)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Trash2 className="h-3 w-3 text-rose-500" /> <span>Excluir</span>
                  </button>
                </>
              )}
              <button onClick={() => viewField('projectId', 'Google Cloud Project ID', projectId)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Eye className="h-3 w-3 text-emerald-500" /> <span>Visualizar</span>
              </button>
              <button onClick={() => copyField('projectId', projectId)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Copy className="h-3 w-3 text-blue-500" /> <span>Copiar</span>
              </button>
              <button onClick={() => navigate(-1)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                Voltar
              </button>
            </div>
          </div>

          {/* 9. Callback Secret */}
          <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Callback Callback Secret Token</label>
              {editingFields['callbackSecret'] ? (
                <input 
                  type="text"
                  value={tempValues['callbackSecret'] || ''}
                  onChange={(e) => setTempValues({ ...tempValues, callbackSecret: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono text-[11px]"
                />
              ) : (
                <div className="text-[11px] font-mono text-slate-750 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg truncate select-all">
                  {callbackSecret || 'Não definido'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {editingFields['callbackSecret'] ? (
                <>
                  <button onClick={() => saveField('callbackSecret', setCallbackSecret)} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Save className="h-3 w-3" /> <span>Salvar</span>
                  </button>
                  <button onClick={() => cancelEditField('callbackSecret')} className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-655 font-bold text-[10px] rounded cursor-pointer">
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditField('callbackSecret', callbackSecret)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Pencil className="h-3 w-3 text-blue-500" /> <span>Editar</span>
                  </button>
                  <button onClick={() => clearField('callbackSecret', setCallbackSecret)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Trash2 className="h-3 w-3 text-rose-500" /> <span>Excluir</span>
                  </button>
                </>
              )}
              <button onClick={() => viewField('callbackSecret', 'Callback Secret Callback Token', callbackSecret)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Eye className="h-3 w-3 text-emerald-500" /> <span>Visualizar</span>
              </button>
              <button onClick={() => copyField('callbackSecret', callbackSecret)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Copy className="h-3 w-3 text-blue-500" /> <span>Copiar</span>
              </button>
              <button onClick={() => navigate(-1)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                Voltar
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* PAYLOADS & RESPONSES PANEL (TAREFA 1 CONTROLS) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <h3 className="font-bold text-slate-900 text-sm font-sans flex items-center gap-2">
            <FileJson className="h-4.5 w-4.5 text-purple-500" />
            <span>Área Técnica de Auditoria Operacional (Payloads, Erros e Respostas)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Acompanhe o tráfego técnico em tempo real enviado pelo Portal BOSS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 10. Payload Recebido */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Payload recebido (bruto JSON)</span>
              {editingFields['payloadReceived'] ? (
                <textarea 
                  value={tempValues['payloadReceived'] || ''}
                  onChange={(e) => setTempValues({ ...tempValues, payloadReceived: e.target.value })}
                  className="w-full h-40 bg-white border border-slate-300 rounded-lg p-2 font-mono text-[10px] leading-relaxed"
                />
              ) : (
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-[9px] leading-relaxed overflow-x-auto h-40">
                  {payloadReceived || 'Vazio'}
                </pre>
              )}
            </div>
            <div className="flex items-center gap-1 mt-3">
              {editingFields['payloadReceived'] ? (
                <>
                  <button onClick={() => saveField('payloadReceived', setPayloadReceived)} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] rounded flex items-center gap-1 cursor-pointer">
                    <Save className="h-3 w-3" /> <span>Salvar</span>
                  </button>
                  <button onClick={() => cancelEditField('payloadReceived')} className="px-2 py-1 bg-white border border-slate-200 text-slate-650 font-bold text-[9px] rounded cursor-pointer">
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditField('payloadReceived', payloadReceived)} className="px-2 py-1 bg-white border border-slate-200 font-bold text-[9px] rounded flex items-center gap-1 cursor-pointer hover:bg-slate-100">
                    <Pencil className="h-3 w-3 text-blue-500" /> <span>Editar</span>
                  </button>
                  <button onClick={() => clearField('payloadReceived', setPayloadReceived)} className="px-2 py-1 bg-white border border-slate-200 text-[9px] font-semibold rounded flex items-center gap-1 cursor-pointer hover:bg-slate-100">
                    <Trash2 className="h-3 w-3 text-rose-500" /> <span>Excluir</span>
                  </button>
                </>
              )}
              <button onClick={() => viewField('payloadReceived', 'Payload Recebido do Portal BOSS', payloadReceived)} className="px-2 py-1 bg-white border border-slate-200 text-[9px] font-semibold rounded flex items-center gap-1 cursor-pointer hover:bg-slate-100">
                <Eye className="h-3 w-3 text-emerald-500" /> <span>Visualizar</span>
              </button>
              <button onClick={() => copyField('payloadReceived', payloadReceived)} className="px-2 py-1 bg-white border border-slate-200 text-[9px] font-semibold rounded flex items-center gap-1 cursor-pointer hover:bg-slate-100">
                <Copy className="h-3 w-3 text-blue-550" /> <span>Copiar</span>
              </button>
              <button onClick={() => navigate(-1)} className="px-2 py-1 bg-white border border-slate-150 text-slate-705 text-[9px] font-semibold rounded cursor-pointer">
                Voltar
              </button>
            </div>
          </div>

          {/* 11. Payload Enviado */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Payload enviado (GDI Webhook Callback)</span>
              {editingFields['payloadSent'] ? (
                <textarea 
                  value={tempValues['payloadSent'] || ''}
                  onChange={(e) => setTempValues({ ...tempValues, payloadSent: e.target.value })}
                  className="w-full h-40 bg-white border border-slate-300 rounded-lg p-2 font-mono text-[10px] leading-relaxed"
                />
              ) : (
                <pre className="bg-slate-900 text-blue-400 p-3 rounded-lg font-mono text-[9px] leading-relaxed overflow-x-auto h-40">
                  {payloadSent || 'Vazio'}
                </pre>
              )}
            </div>
            <div className="flex items-center gap-1 mt-3">
              {editingFields['payloadSent'] ? (
                <>
                  <button onClick={() => saveField('payloadSent', setPayloadSent)} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] rounded flex items-center gap-1 cursor-pointer">
                    <Save className="h-3 w-3" /> <span>Salvar</span>
                  </button>
                  <button onClick={() => cancelEditField('payloadSent')} className="px-2 py-1 bg-white border border-slate-200 text-slate-655 font-bold text-[9px] rounded cursor-pointer">
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditField('payloadSent', payloadSent)} className="px-2 py-1 bg-white border border-slate-200 font-bold text-[9px] rounded flex items-center gap-1 cursor-pointer hover:bg-slate-100">
                    <Pencil className="h-3 w-3 text-blue-500" /> <span>Editar</span>
                  </button>
                  <button onClick={() => clearField('payloadSent', setPayloadSent)} className="px-2 py-1 bg-white border border-slate-200 text-[9px] font-semibold rounded flex items-center gap-1 cursor-pointer hover:bg-slate-100">
                    <Trash2 className="h-3 w-3 text-rose-500" /> <span>Excluir</span>
                  </button>
                </>
              )}
              <button onClick={() => viewField('payloadSent', 'Payload Enviado (GDI Webhook Callback)', payloadSent)} className="px-2 py-1 bg-white border border-slate-200 text-[9px] font-semibold rounded flex items-center gap-1 cursor-pointer hover:bg-slate-100">
                <Eye className="h-3 w-3 text-emerald-500" /> <span>Visualizar</span>
              </button>
              <button onClick={() => copyField('payloadSent', payloadSent)} className="px-2 py-1 bg-white border border-slate-200 text-[9px] font-semibold rounded flex items-center gap-1 cursor-pointer hover:bg-slate-100">
                <Copy className="h-3 w-3 text-blue-550" /> <span>Copiar</span>
              </button>
              <button onClick={() => navigate(-1)} className="px-2 py-1 bg-white border border-slate-150 text-slate-705 text-[9px] font-semibold rounded cursor-pointer">
                Voltar
              </button>
            </div>
          </div>

          {/* 12. Último Erro */}
          <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Último erro registrado (GDI / Webhook)</label>
              {editingFields['lastError'] ? (
                <input 
                  type="text"
                  value={tempValues['lastError'] || ''}
                  onChange={(e) => setTempValues({ ...tempValues, lastError: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono text-[11px]"
                />
              ) : (
                <div className="text-[11px] font-mono text-rose-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg truncate">
                  {lastError || 'Nenhum erro registrado'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {editingFields['lastError'] ? (
                <>
                  <button onClick={() => saveField('lastError', setLastError)} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Save className="h-3 w-3" /> <span>Salvar</span>
                  </button>
                  <button onClick={() => cancelEditField('lastError')} className="px-2 py-1 bg-white border border-slate-200 text-slate-655 font-bold text-[10px] rounded cursor-pointer">
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditField('lastError', lastError)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Pencil className="h-3 w-3 text-blue-500" /> <span>Editar</span>
                  </button>
                  <button onClick={() => clearField('lastError', setLastError)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Trash2 className="h-3 w-3 text-rose-500" /> <span>Excluir</span>
                  </button>
                </>
              )}
              <button onClick={() => viewField('lastError', 'Último Erro Registrado', lastError)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Eye className="h-3 w-3 text-emerald-500" /> <span>Visualizar</span>
              </button>
              <button onClick={() => copyField('lastError', lastError)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Copy className="h-3 w-3 text-blue-500" /> <span>Copiar</span>
              </button>
              <button onClick={() => navigate(-1)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                Voltar
              </button>
            </div>
          </div>

          {/* 13. Última Resposta */}
          <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Última resposta bruta (GDI API Response)</label>
              {editingFields['lastResponse'] ? (
                <input 
                  type="text"
                  value={tempValues['lastResponse'] || ''}
                  onChange={(e) => setTempValues({ ...tempValues, lastResponse: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono text-[11px]"
                />
              ) : (
                <div className="text-[11px] font-mono text-slate-750 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg truncate">
                  {lastResponse || 'Sem resposta registrada'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {editingFields['lastResponse'] ? (
                <>
                  <button onClick={() => saveField('lastResponse', setLastResponse)} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Save className="h-3 w-3" /> <span>Salvar</span>
                  </button>
                  <button onClick={() => cancelEditField('lastResponse')} className="px-2 py-1 bg-white border border-slate-200 text-slate-655 font-bold text-[10px] rounded cursor-pointer">
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditField('lastResponse', lastResponse)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Pencil className="h-3 w-3 text-blue-500" /> <span>Editar</span>
                  </button>
                  <button onClick={() => clearField('lastResponse', setLastResponse)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Trash2 className="h-3 w-3 text-rose-500" /> <span>Excluir</span>
                  </button>
                </>
              )}
              <button onClick={() => viewField('lastResponse', 'Última Resposta Bruta', lastResponse)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Eye className="h-3 w-3 text-emerald-500" /> <span>Visualizar</span>
              </button>
              <button onClick={() => copyField('lastResponse', lastResponse)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Copy className="h-3 w-3 text-blue-500" /> <span>Copiar</span>
              </button>
              <button onClick={() => navigate(-1)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                Voltar
              </button>
            </div>
          </div>

          {/* 14. Último Sucesso */}
          <div className="space-y-1.5 bg-slate-50/50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between md:col-span-2">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Último sucesso de geração</label>
              {editingFields['lastSuccess'] ? (
                <input 
                  type="text"
                  value={tempValues['lastSuccess'] || ''}
                  onChange={(e) => setTempValues({ ...tempValues, lastSuccess: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono text-[11px]"
                />
              ) : (
                <div className="text-[11px] font-sans text-emerald-800 font-semibold bg-emerald-50/50 border border-emerald-100 px-2.5 py-1.5 rounded-lg truncate">
                  {lastSuccess || 'Nenhum sucesso registrado'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {editingFields['lastSuccess'] ? (
                <>
                  <button onClick={() => saveField('lastSuccess', setLastSuccess)} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Save className="h-3 w-3" /> <span>Salvar</span>
                  </button>
                  <button onClick={() => cancelEditField('lastSuccess')} className="px-2 py-1 bg-white border border-slate-200 text-slate-655 font-bold text-[10px] rounded cursor-pointer">
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditField('lastSuccess', lastSuccess)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-bold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Pencil className="h-3 w-3 text-blue-500" /> <span>Editar</span>
                  </button>
                  <button onClick={() => clearField('lastSuccess', setLastSuccess)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                    <Trash2 className="h-3 w-3 text-rose-500" /> <span>Excluir</span>
                  </button>
                </>
              )}
              <button onClick={() => viewField('lastSuccess', 'Último Sucesso Registrado', lastSuccess)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Eye className="h-3 w-3 text-emerald-500" /> <span>Visualizar</span>
              </button>
              <button onClick={() => copyField('lastSuccess', lastSuccess)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                <Copy className="h-3 w-3 text-blue-500" /> <span>Copiar</span>
              </button>
              <button onClick={() => navigate(-1)} className="px-2 py-1 bg-white hover:bg-slate-150 border border-slate-200 text-slate-700 font-semibold text-[10px] rounded flex items-center gap-1 cursor-pointer">
                Voltar
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* --- OVERLAY NOTIFICATIONS (MODALS & TOAST) --- */}

      {/* Custom Toast Overlay */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[9999] bg-slate-900 text-white text-xs px-4 py-3 rounded-lg shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-450 text-emerald-400 shrink-0" />
          <span className="font-sans font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Custom View Modal Overlay */}
      {modalData && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs font-mono tracking-wide uppercase flex items-center gap-2">
                <Key className="h-4 w-4 text-indigo-500" />
                <span>{modalData.title}</span>
              </h3>
              <button 
                onClick={() => setModalData(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto font-mono text-[11px] text-slate-850 bg-slate-50/50 border-b border-slate-100 select-all whitespace-pre-wrap break-all leading-relaxed max-h-96">
              {modalData.text}
            </div>
            <div className="px-5 py-3.5 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(modalData.text);
                  showToast("Copiado para a área de transferência!");
                }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer font-sans"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar Tudo</span>
              </button>
              <button
                type="button"
                onClick={() => setModalData(null)}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-350 text-slate-700 font-semibold text-xs rounded-lg shadow-2xs transition cursor-pointer font-sans"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation / Alert Overlay */}
      {confirmData && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              {confirmData.type === 'auth' ? (
                <div className="h-9 w-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
              ) : (
                <div className="h-9 w-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-indigo-600" />
                </div>
              )}
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm font-sans leading-snug">
                  {confirmData.title || "Solicitação de Confirmação"}
                </h3>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">{confirmData.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setConfirmData(null)}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs rounded-lg shadow-2xs transition cursor-pointer font-sans"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmData.onConfirm();
                  if (confirmData.toastOnConfirm) {
                    showToast(confirmData.toastOnConfirm);
                  }
                  setConfirmData(null);
                }}
                className={`px-4 py-1.5 text-white font-semibold text-xs rounded-lg shadow-xs transition cursor-pointer font-sans ${
                  confirmData.type === 'auth'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {confirmData.confirmText || "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
