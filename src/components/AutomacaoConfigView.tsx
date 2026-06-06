import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Settings, 
  Brackets, 
  FileCode, 
  FolderCheck, 
  History, 
  Settings2, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  Play, 
  RefreshCw, 
  Send, 
  Check, 
  FileJson, 
  Info,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  Database,
  CheckCircle,
  Terminal
} from 'lucide-react';
import { DocCard, GoogleDocsCard } from '../types';
import {
  normalizePortalBossPayload,
  getTechnicalPayloadForDoc,
  getPlaceholdersForDoc,
  PF_FIELD_RULES,
  PJ_FIELD_RULES,
  SOCIO_FIELD_RULES,
  BANKING_FIELD_RULES,
  ACESSO_FIELD_RULES,
  PF_MANDATORY_FIELDS,
  PJ_MANDATORY_FIELDS,
  PortalBossPayload,
  NormalizedGdiData,
  GdiLogEntry,
  getFormattedNow
} from '../utils/portalBossMapper';

// Import modular tab components
import { GdiPainelTab } from './GdiPainelTab';
import { GdiPlaceholdersTab } from './GdiPlaceholdersTab';
import { GdiCredentialsTab } from './GdiCredentialsTab';

interface AutomacaoConfigViewProps {
  card: DocCard;
  onBackToAutomacao: () => void;
  onBackToCentral: () => void;
}

export default function AutomacaoConfigView({ card, onBackToAutomacao, onBackToCentral }: AutomacaoConfigViewProps) {
  // --- REAL BACKEND FLOW STATES ---
  const [dbConfig, setDbConfig] = useState<any>({
    viteGdiEnv: 'production',
    viteGdiPublicBaseUrl: '',
    vitePortalBossBaseUrl: 'https://api.portalboss.com.br',
    viteGoogleClientId: '',
    viteGoogleApiKey: '',
    gdiGoogleServiceAccountEmail: '',
    gdiGoogleProjectId: '',
    gdiGoogleDocsScopes: 'https://www.googleapis.com/auth/documents',
    gdiGoogleDriveScopes: 'https://www.googleapis.com/auth/drive.file',
    gdiPortalBossWebhookUrl: 'https://api.portalboss.com.br/gdi/webhook',
    hasClientSecret: false,
    hasServiceAccountPrivateKey: false,
    hasCallbackSecret: false,
    hasIntegrationKey: false,
    maskIntegrationKey: ''
  });

  const [activeTemplate, setActiveTemplate] = useState<any>({
    templateName: `Modelo Oficial de ${card.title}`,
    templateGoogleDocsUrl: card.id === 'procuracao-pf' ? "https://docs.google.com/document/d/16k_n_BTdf8wTCG8CK4T2TyAT93o5qrmZqjbROtrBqzk/edit" : `https://docs.google.com/document/d/1fT22Z7M9K6hX8yPsN3w_GDI_DOC_ID_${card.id.toUpperCase()}/edit`,
    templateGoogleDocsId: card.id === 'procuracao-pf' ? "16k_n_BTdf8wTCG8CK4T2TyAT93o5qrmZqjbROtrBqzk" : `1fT22Z7M9K6hX8yPsN3w_GDI_DOC_ID_${card.id.toUpperCase()}`,
    templatePdfReferenceUrl: card.id === 'procuracao-pf' ? "https://drive.google.com/drive/u/0/folders/1fhMk2RMwEM7RlDCEOlKl5CsEjujX5zMJ" : "",
    templateStatus: "configurado",
    updatedAt: new Date().toISOString(),
    updatedBy: "GDI_SYSTEM_LOAD"
  });

  const [jobsQueue, setJobsQueue] = useState<any[]>([]);
  const [googleAuthStatus, setGoogleAuthStatus] = useState<string>('não_configurado');
  const [isLoadingBackend, setIsLoadingBackend] = useState<boolean>(true);
  const [isSavingTemplate, setIsSavingTemplate] = useState<boolean>(false);
  const [isSavingCreds, setIsSavingCreds] = useState<boolean>(false);

  // Editable configurations state
  const [isEditingCredsForm, setIsEditingCredsForm] = useState<boolean>(false);
  const [credsForm, setCredsForm] = useState<any>({});

  // Credentials editing secret placeholder markers
  const [clientSecretInput, setClientSecretInput] = useState<string>('');
  const [privateKeyInput, setPrivateKeyInput] = useState<string>('');
  const [callbackSecretInput, setCallbackSecretInput] = useState<string>('');
  const [integrationKeyInput, setIntegrationKeyInput] = useState<string>('');

  // States of configuration
  const [templateId, setTemplateId] = useState<string>(activeTemplate.templateGoogleDocsId || '1fT22Z7M9K6hX8yPsN3w_GDI_DOC_ID_' + card.id.toUpperCase());

  // API Google Docs State
  const [googleDocsStatus, setGoogleDocsStatus] = useState<string>('não_configurado');

  // API Google Drive State
  const [googleDriveStatus, setGoogleDriveStatus] = useState<string>('não_configurado');

  // Manual interactive action logs
  const [userActionLogs, setUserActionLogs] = useState<Array<GdiLogEntry>>([]);

  const addActionLog = (step: string, status: 'success' | 'failed', message: string, details?: string) => {
    const newLog: GdiLogEntry = {
      timestamp: getFormattedNow(),
      step,
      status,
      message,
      details
    };
    setUserActionLogs(prev => [newLog, ...prev]);
  };
  const [templateStatus, setTemplateStatus] = useState<'não_configurado' | 'configurado' | 'validado' | 'erro_template'>('validado');
  const [templateError, setTemplateError] = useState<string>('');
  
  // Fetch everything on mount
  const fetchBackendData = async () => {
    try {
      setIsLoadingBackend(true);
      // 1. Fetch credentials
      const configRes = await fetch('/api/config');
      if (configRes.ok) {
        const configData = await configRes.json();
        setDbConfig(configData);
        setCredsForm(configData);
        if (configData.gdiGoogleClientSecret) setClientSecretInput(configData.gdiGoogleClientSecret);
        if (configData.gdiGoogleServiceAccountPrivateKey) setPrivateKeyInput(configData.gdiGoogleServiceAccountPrivateKey);
        if (configData.gdiPortalBossCallbackSecret) setCallbackSecretInput(configData.gdiPortalBossCallbackSecret);
        if (configData.gdiIntegrationKey) setIntegrationKeyInput(configData.gdiIntegrationKey);
        if (configData.googleAuthStatus) setGoogleAuthStatus(configData.googleAuthStatus);
        if (configData.googleDocsStatus) setGoogleDocsStatus(configData.googleDocsStatus);
        if (configData.googleDriveStatus) setGoogleDriveStatus(configData.googleDriveStatus);
      }

      // 2. Fetch templates mapping
      const templatesRes = await fetch('/api/templates');
      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        if (templatesData[card.id]) {
          const t = templatesData[card.id];
          setActiveTemplate(t);
          setTemplateId(t.templateGoogleDocsId);
          setTemplateStatus(t.templateStatus === 'validado' ? 'validado' : t.templateStatus);
        }
      }

      // 3. Fetch Job Database status
      await reloadJobsList();
    } catch (e) {
      console.error("Erro ao carregar dados do servidor robusto:", e);
    } finally {
      setIsLoadingBackend(false);
    }
  };

  const reloadJobsList = async () => {
    try {
      const jobsRes = await fetch('/api/jobs');
      if (jobsRes.ok) {
        const j = await jobsRes.json();
        setJobsQueue(j);
      }
    } catch (e) {
      console.error("Erro ao recarregar fila de Jobs:", e);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, [card.id]);

  // Saving template mapping function
  const handleSaveActiveTemplate = async (updatedFields: Partial<typeof activeTemplate>) => {
    try {
      setIsSavingTemplate(true);
      const payload = {
        cardId: card.id,
        ...activeTemplate,
        ...updatedFields,
        updatedBy: "INTEGRADOR_PORTAL_BOSS"
      };

      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const result = await res.json();
        setActiveTemplate(result.template);
        if (result.template.templateGoogleDocsId) {
          setTemplateId(result.template.templateGoogleDocsId);
        }
        setTemplateStatus(result.template.templateStatus);
        addActionLog('GDI_TEMPLATE_SAVED_SECURELY', 'success', 'Template mestre de assinatura salvo e consolidado com sucesso na base real.', `Google Docs ID de barramento: ${result.template.templateGoogleDocsId}`);
      } else {
        alert('Falha ao enviar alterações do template para a base.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Saving Google Credentials parameters function
  const handleSaveGoogleCredentials = async () => {
    try {
      setIsSavingCreds(true);
      const updatesPayload: any = { ...credsForm };
      
      // Strict frontend validation for gdiGoogleRedirectUri
      const redirectUriPath = (updatesPayload.gdiGoogleRedirectUri || '').trim();
      if (redirectUriPath) {
        const val = redirectUriPath.toLowerCase();
        if (val.includes("secret") || val.includes("key") || val.includes("token")) {
          alert("GDI ERRO CRÍTICO: Chave secreta ou token detectado incorretamente no campo de Redirect URI! Operação cancelada.");
          addActionLog('GDI_OAUTH_SECRET_MISUSED_AS_REDIRECT_URI', 'failed', `Configurações de rede GDI bloqueadas: O valor "${redirectUriPath}" contém prefixos ou termos reservados de secrets e NÃO pode ser usado como redirecionamento de OAuth.`);
          setIsSavingCreds(false);
          return;
        }
        if (!val.startsWith("http://") && !val.startsWith("https://")) {
          alert("GDI ERRO: O Redirect URI deve ser uma URL válida e começar com http:// ou https://");
          addActionLog('GDI_OAUTH_REDIRECT_URI_INVALID', 'failed', `Configurações de rede GDI bloqueadas: O URI de redirecionamento "${redirectUriPath}" não é válido.`);
          setIsSavingCreds(false);
          return;
        }
      }

      // Inject secrets only if entered manually
      if (clientSecretInput) updatesPayload.gdiGoogleClientSecret = clientSecretInput;
      if (privateKeyInput) updatesPayload.gdiGoogleServiceAccountPrivateKey = privateKeyInput;
      if (callbackSecretInput) updatesPayload.gdiPortalBossCallbackSecret = callbackSecretInput;
      if (integrationKeyInput) updatesPayload.gdiIntegrationKey = integrationKeyInput;

      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatesPayload)
      });

      if (res.ok) {
        const result = await res.json();
        // Clear secrets fields
        setClientSecretInput('');
        setPrivateKeyInput('');
        setCallbackSecretInput('');
        setIntegrationKeyInput('');
        setIsEditingCredsForm(false);
        // Refresh base settings
        const configRes = await fetch('/api/config');
        if (configRes.ok) {
          const configData = await configRes.json();
          setDbConfig(configData);
          setCredsForm(configData);
        }
        addActionLog('GDI_CREDENTIALS_UPDATED', 'success', 'Parâmetros de credenciais autenticadoras do Google e Canal BOSS persistidos com segurança.');
        if (redirectUriPath) {
          addActionLog('GDI_OAUTH_REDIRECT_URI_RESOLVED', 'success', `OAuth Redirect URI salvo e validado com sucesso: "${redirectUriPath}"`);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.message || 'Erro ao persistir credenciais corporativas.';
        alert(errMsg);
        if (errData.error) {
          addActionLog(errData.error, 'failed', errMsg);
        }
      }
    } catch (e: any) {
      console.error(e);
      alert('Falha mecânica ao sincronizar credenciais: ' + e.message);
    } finally {
      setIsSavingCreds(false);
    }
  };

  // Triggering authenticaton connection diagnosticts run
  const triggerGoogleAuthDiagnostics = async () => {
    try {
      addActionLog('GDI_GOOGLE_AUTH_STARTED', 'success', 'Processo síncrono de handshake real iniciado.');
      const res = await fetch('/api/google/auth/test', { method: 'POST' });
      if (res.ok) {
        const r = await res.json();
        setGoogleAuthStatus(r.status);
        if (r.logs && r.logs.length > 0) {
          // Append output logs chronologically
          setUserActionLogs(prev => [...r.logs.reverse(), ...prev]);
        }
        if (r.success) {
          alert('Conexão Google autenticada com sucesso!');
        } else {
          alert('Falha de login nas APIs Google reais! Verifique as credenciais.');
        }
      }
    } catch(err) {
      console.error(err);
    }
  };

  // Triggering Docs connection check
  const triggerGoogleDocsDiagnostics = async () => {
    try {
      addActionLog('GDI_DOCS_API_CHECK_STARTED', 'success', 'Solicitando teste de barramento real à API Google Docs...');
      const res = await fetch('/api/google/docs/test', { method: 'POST' });
      if (res.ok) {
        const r = await res.json();
        setGoogleDocsStatus(r.status);
        if (r.logs && r.logs.length > 0) {
          setUserActionLogs(prev => [...r.logs.reverse(), ...prev]);
        }
        if (r.success) {
          alert('Sincronização Docs API: Conexão e teste operacional executados com sucesso!');
        } else {
          alert('Erro de Conexão na API Google Docs real!');
        }
      }
    } catch(err) {
      console.error(err);
    }
  };

  // Triggering Drive mapping review
  const triggerGoogleDriveDiagnostics = async () => {
    try {
      addActionLog('GDI_DRIVE_API_CHECK_STARTED', 'success', 'Solicitando auditoria de integridade à API de arquivos Google Drive...');
      const res = await fetch('/api/google/drive/test', { method: 'POST' });
      if (res.ok) {
        const r = await res.json();
        setGoogleDriveStatus(r.status);
        if (r.logs && r.logs.length > 0) {
          setUserActionLogs(prev => [...r.logs.reverse(), ...prev]);
        }
        if (r.success) {
          alert('Drive API: Metadados, gravação e expulgos testados com SUCESSO!');
        } else {
          alert('Erro de gravação / permissão na API Google Drive real!');
        }
      }
    } catch(err) {
      console.error(err);
    }
  };

  // Webhook received Job Real Trigger
  const triggerTechnicalJob = async () => {
    try {
      addActionLog('GDI_TECHNICAL_JOB_TRIGGERED', 'success', 'Enviando payload síncrono real ao barramento webhook receptor de rascunhos.');
      const currentPayload = JSON.parse(rawPayloadText);
      const res = await fetch('/api/jobs/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPayload)
      });
      if (res.ok) {
        const r = await res.json();
        await reloadJobsList();
        if (r.success) {
          // Sync raw checklist log representation matching this new job output
          if (r.job && r.job.logs) {
            setUserActionLogs(prev => [...r.job.logs.reverse(), ...prev]);
          }
          alert('Log de transação operada: Payload técnico recebido e processado pelo barramento com sucesso.');
        }
      }
    } catch (e: any) {
      alert(`Falha de processamento no Webhook: ${e.message}`);
    }
  };

  // Clear Job Database
  const triggerClearJobsQueue = async () => {
    if (confirm('Tem certeza de que deseja expurgar permanentemente o log histórico de Jobs recebidos de Portal BOSS?')) {
      try {
        const res = await fetch('/api/jobs/clear', { method: 'POST' });
        if (res.ok) {
          setJobsQueue([]);
          addActionLog('GDI_JOBS_QUEUE_CLEARED', 'success', 'Base temporária de jobs redefinida com sucesso.');
          alert('Histórico de jobs limpo com sucesso.');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Custom GDI raw Payload state
  const [rawPayloadText, setRawPayloadText] = useState<string>("");

  // Sync rawPayloadText with the last matching real job received from jobsQueue if rawPayloadText is currently empty
  useEffect(() => {
    if (!rawPayloadText && jobsQueue && jobsQueue.length > 0) {
      const matchingJob = [...jobsQueue].reverse().find((j: any) => {
        if (!j) return false;
        const docType = j.documentType || (j.payload && j.payload.documentType) || '';
        const canonicalJobType = docType.toLowerCase().replace(/_/g, '-');
        const canonicalCardId = card.id.toLowerCase().replace(/_/g, '-');
        return canonicalJobType === canonicalCardId;
      });

      if (matchingJob && matchingJob.payload) {
        setRawPayloadText(JSON.stringify(matchingJob.payload, null, 2));
      }
    }
  }, [jobsQueue, card.id, rawPayloadText]);

  // Dynamic calculated parameters based on Portal BOSS Mapper
  let parsedPayload: PortalBossPayload = {};
  let parseError: string | null = null;
  try {
    parsedPayload = JSON.parse(rawPayloadText);
  } catch (err: any) {
    parseError = err.message;
  }

  const mapperResult = normalizePortalBossPayload(parsedPayload);
  const normalizedData = mapperResult.normalized;
  const isPayloadValid = !parseError && mapperResult.validation.isValid;

  // Active module tab
  const [activeSuiteTab, setActiveSuiteTab] = useState<'painel' | 'placeholders' | 'credentials'>('painel');
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  const triggerCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage(label);
    setTimeout(() => setCopiedMessage(null), 2000);
  };

  // Helper friendly names mapping for standard document title outputs
  const getDocFriendlyName = () => {
    switch (card.id) {
      case 'procuracao-pf': return 'Procuração Pessoa Física';
      case 'procuracao-pj': return 'Procuração Pessoa Jurídica';
      case 'declaracao-pobreza-pf': return 'Declaração de Pobreza Pessoa Física';
      case 'declaracao-pobreza-pj': return 'Declaração de Pobreza Pessoa Jurídica';
      case 'contrato-honorarios-pf': return 'Contrato de Honorários Pessoa Física';
      case 'contrato-honorarios-pj': return 'Contrato de Honorários Pessoa Jurídica';
      case 'primeiro-atendimento-pf': return '1º Atendimento Pessoa Física';
      case 'primeiro-atendimento-pj': return '1º Atendimento Pessoa Jurídica';
      default: return card.title;
    }
  };

  // 4. Placeholders mappings according to current selected card.id
  const getMappedPlaceholders = () => {
    const currentPlaceholders = getPlaceholdersForDoc(card.documentType, normalizedData);
    return Object.entries(currentPlaceholders).map(([key, val]) => {
      let pathStr = 'payload.clientRawData';
      let isMandatory = 'Não';
      
      const isPF = card.category.toUpperCase() === 'PF';
      if (isPF) {
        // Find matching field rule
        const rule = PF_FIELD_RULES.find(r => r.key === key.toLowerCase().replace('{{outorgante_', 'pf_').replace('}}', ''));
        if (rule) {
          pathStr = `payload.clientRawData.pfData.${rule.key}`;
          if (PF_MANDATORY_FIELDS.includes(rule.key)) {
            isMandatory = 'Sim';
          }
        } else {
          // Check falling fallback declarante
          const declRule = PF_FIELD_RULES.find(r => r.key === key.toLowerCase().replace('{{declarante_', 'pf_').replace('}}', ''));
          if (declRule) {
            pathStr = `payload.clientRawData.pfData.${declRule.key}`;
            if (PF_MANDATORY_FIELDS.includes(declRule.key)) {
              isMandatory = 'Sim';
            }
          }
        }
      } else {
        // PJ rules
        const pjRule = PJ_FIELD_RULES.find(r => r.key === key.toLowerCase().replace('{{empresa_', 'pj_').replace('}}', ''));
        const socioRule = SOCIO_FIELD_RULES.find(r => r.key === key.toLowerCase().replace('{{representante_', 'socio_').replace('}}', ''));
        if (pjRule) {
          pathStr = `payload.clientRawData.pjDadosEmpresa.${pjRule.key}`;
          if (PJ_MANDATORY_FIELDS.includes(pjRule.key)) {
            isMandatory = 'Sim';
          }
        } else if (socioRule) {
          pathStr = `payload.clientRawData.socioDadosPessoais.${socioRule.key}`;
          if (PJ_MANDATORY_FIELDS.includes(socioRule.key)) {
            isMandatory = 'Sim';
          }
        }
      }

      // Office checks
      if (key === '{{LOCAL_ASSINATURA}}' || key === '{{DATA_ASSINATURA}}' || key === '{{ADVOGADO_NOME}}' || key === '{{ADVOGADO_OAB}}') {
        pathStr = `payload.officeData.${key.toLowerCase().replace('{{', '').replace('}}', '').replace('advogado_', 'advogado')}`;
        isMandatory = 'Sim';
      }

      // Case checks
      if (key === '{{NATUREZA_ACAO}}' || key === '{{VALOR_HONORARIOS}}' || key === '{{FORMA_PAGAMENTO}}' || key === '{{VARA_COMPETENTE}}' || key === '{{FORO_COMARCA}}' || key === '{{RELATO_FATOS}}' || key === '{{VALOR_CAUSA_ESTIMADO}}') {
        pathStr = `payload.caseData.${key.toLowerCase().replace('{{', '').replace('}}', '').replace('_estimado', '')}`;
        if (key !== '{{VALOR_CAUSA_ESTIMADO}}') {
          isMandatory = 'Sim';
        }
      }

      return {
        placeholder: key,
        payloadField: pathStr,
        mandatory: isMandatory,
        example: val || '(vazio)',
        status: val ? 'Localizado' : 'Não Informado'
      };
    });
  };

  const getPayloadContractJson = () => {
    const defaultM = getTechnicalPayloadForDoc(card.documentType, (card.category || 'PF').toUpperCase() as 'PF' | 'PJ');
    return JSON.stringify(defaultM, null, 2);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-16">
      
      {/* 4. UPPER LAYOUT HEADER & STICKY ACTION PANEL */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Configuração da automação {getDocFriendlyName()}
            </h1>
            <span className="bg-blue-50 text-blue-700 border border-blue-100 font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full">
              documentType: {card.documentType}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            Painel de preparação operacional para integração direta entre o Portal BOSS Clientes e o GDI (Google Docs Integrations).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={onBackToAutomacao}
            className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-slate-600 hover:text-blue-600 transition bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar para Automação</span>
          </button>
          
          <button 
            onClick={onBackToCentral}
            className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-slate-650 hover:text-blue-600 transition bg-slate-100 hover:bg-slate-200 border border-slate-200/65 px-3 py-2 rounded-lg cursor-pointer"
          >
            <span>Central GDI</span>
          </button>


          <button 
            onClick={() => triggerCopy(getPayloadContractJson(), 'payload')}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-[11px] px-3 py-2 rounded-lg transition active:scale-95 inline-flex items-center space-x-1.5 cursor-pointer"
          >
            <FileJson className="h-3.5 w-3.5" />
            <span>Copiar Contrato</span>
          </button>
        </div>
      </div>

      {copiedMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg z-50 animate-bounce">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>Contrato de dados copiado para a área de transferência!</span>
        </div>
      )}

      {/* Subtitle Alert Row */}
      <div className="bg-slate-900 text-slate-100 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">STATUS DA INTEGRADO</span>
              <span className="text-xs font-mono font-bold text-emerald-400">Preparado para integração real (GDI Cloud Active)</span>
            </div>
          </div>
          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block"></div>
          <div>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">ID DO REGISTRO TÉCNICO</span>
            <span className="text-xs font-mono font-bold text-slate-200">GDI_CLOUD_ACTIVE_2026</span>
          </div>
        </div>
        <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-right flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-[10px] font-mono text-slate-300">Aguardando payload disparado via Portal BOSS</span>
        </div>
      </div>

      {/* TAB NAVIGATOR */}
      <div className="flex flex-wrap border-b border-slate-200 gap-1 bg-slate-50/50 p-1.5 rounded-xl border">
        <button
          onClick={() => setActiveSuiteTab('painel')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition rounded-lg cursor-pointer ${
            activeSuiteTab === 'painel'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Painel Principal e Fila</span>
        </button>
        <button
          onClick={() => setActiveSuiteTab('placeholders')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition rounded-lg cursor-pointer ${
            activeSuiteTab === 'placeholders'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Brackets className="h-4 w-4" />
          <span>Campos e Dicionário</span>
        </button>
        <button
          onClick={() => setActiveSuiteTab('credentials')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition rounded-lg cursor-pointer ${
            activeSuiteTab === 'credentials'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Chaves e Credenciais</span>
        </button>
      </div>

      {/* TWO COLUMN GRID LAYOUT */}
      <div className="mt-6">
        {activeSuiteTab === 'painel' && (
          <GdiPainelTab
            card={card as GoogleDocsCard}
            templateId={templateId}
            setTemplateId={setTemplateId}
            templateStatus={templateStatus}
            setTemplateStatus={setTemplateStatus}
            templateError={templateError}
            setTemplateError={setTemplateError}
            googleDocsStatus={googleDocsStatus}
            setGoogleDocsStatus={setGoogleDocsStatus}
            googleDriveStatus={googleDriveStatus}
            setGoogleDriveStatus={setGoogleDriveStatus}
            googleAuthStatus={googleAuthStatus}
            dbConfig={dbConfig}
            jobsQueue={jobsQueue}
            userActionLogs={userActionLogs}
            triggerGoogleAuthDiagnostics={triggerGoogleAuthDiagnostics}
            triggerGoogleDocsDiagnostics={triggerGoogleDocsDiagnostics}
            triggerGoogleDriveDiagnostics={triggerGoogleDriveDiagnostics}
            triggerClearJobsQueue={triggerClearJobsQueue}
            reloadJobsList={reloadJobsList}
            onSaveTemplate={handleSaveActiveTemplate}
            isSavingTemplate={isSavingTemplate}
            getDocFriendlyName={getDocFriendlyName}
            rawPayloadText={rawPayloadText}
            setRawPayloadText={setRawPayloadText}
            isPayloadValid={isPayloadValid}
            parseError={parseError}
            normalizedData={normalizedData}
            triggerTechnicalJob={triggerTechnicalJob}
          />
        )}

        {activeSuiteTab === 'placeholders' && (
          <GdiPlaceholdersTab
            card={card as GoogleDocsCard}
            normalizedData={normalizedData}
            getMappedPlaceholders={getMappedPlaceholders}
            getPayloadContractJson={getPayloadContractJson}
            triggerCopy={triggerCopy}
            isPayloadValid={isPayloadValid}
          />
        )}

        {activeSuiteTab === 'credentials' && (
          <GdiCredentialsTab
            credsForm={credsForm}
            setCredsForm={setCredsForm}
            clientSecretInput={clientSecretInput}
            setClientSecretInput={setClientSecretInput}
            privateKeyInput={privateKeyInput}
            setPrivateKeyInput={setPrivateKeyInput}
            callbackSecretInput={callbackSecretInput}
            setCallbackSecretInput={setCallbackSecretInput}
            integrationKeyInput={integrationKeyInput}
            setIntegrationKeyInput={setIntegrationKeyInput}
            isEditingCredsForm={isEditingCredsForm}
            setIsEditingCredsForm={setIsEditingCredsForm}
            isSavingCreds={isSavingCreds}
            handleSaveGoogleCredentials={handleSaveGoogleCredentials}
            dbConfig={dbConfig}
            googleAuthStatus={googleAuthStatus}
            setGoogleAuthStatus={setGoogleAuthStatus}
            googleDocsStatus={googleDocsStatus}
            setGoogleDocsStatus={setGoogleDocsStatus}
            googleDriveStatus={googleDriveStatus}
            setGoogleDriveStatus={setGoogleDriveStatus}
            userActionLogs={userActionLogs}
            setUserActionLogs={setUserActionLogs}
            triggerGoogleAuthDiagnostics={triggerGoogleAuthDiagnostics}
            triggerGoogleDocsDiagnostics={triggerGoogleDocsDiagnostics}
            triggerGoogleDriveDiagnostics={triggerGoogleDriveDiagnostics}
            addActionLog={addActionLog}
          />
        )}
      </div>

    </div>
  );
}
