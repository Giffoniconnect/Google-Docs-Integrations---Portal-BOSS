import React, { useState, useEffect } from 'react';
import { Lock, Save, RefreshCw, Key, Info, HelpCircle, Eye, EyeOff, ShieldCheck, Globe, Database, Trash2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface GdiCredentialsTabProps {
  credsForm: any;
  setCredsForm: React.Dispatch<React.SetStateAction<any>>;
  clientSecretInput: string;
  setClientSecretInput: (val: string) => void;
  privateKeyInput: string;
  setPrivateKeyInput: (val: string) => void;
  callbackSecretInput: string;
  setCallbackSecretInput: (val: string) => void;
  integrationKeyInput: string;
  setIntegrationKeyInput: (val: string) => void;
  isEditingCredsForm: boolean;
  setIsEditingCredsForm: (val: boolean) => void;
  isSavingCreds: boolean;
  handleSaveGoogleCredentials: () => Promise<void>;
  dbConfig: any;
  
  // Real Connection Status Props
  googleAuthStatus: string;
  setGoogleAuthStatus: (val: string) => void;
  googleDocsStatus: string;
  setGoogleDocsStatus: (val: string) => void;
  googleDriveStatus: string;
  setGoogleDriveStatus: (val: string) => void;
  userActionLogs: any[];
  setUserActionLogs: React.Dispatch<React.SetStateAction<any[]>>;
  triggerGoogleAuthDiagnostics: () => Promise<void>;
  triggerGoogleDocsDiagnostics: () => Promise<void>;
  triggerGoogleDriveDiagnostics: () => Promise<void>;
  addActionLog: (step: string, status: 'success' | 'failed', message: string, details?: string) => void;
}

export const GdiCredentialsTab: React.FC<GdiCredentialsTabProps> = ({
  credsForm,
  setCredsForm,
  clientSecretInput,
  setClientSecretInput,
  privateKeyInput,
  setPrivateKeyInput,
  callbackSecretInput,
  setCallbackSecretInput,
  integrationKeyInput,
  setIntegrationKeyInput,
  isEditingCredsForm,
  setIsEditingCredsForm,
  isSavingCreds,
  handleSaveGoogleCredentials,
  dbConfig,
  googleAuthStatus,
  setGoogleAuthStatus,
  googleDocsStatus,
  setGoogleDocsStatus,
  googleDriveStatus,
  setGoogleDriveStatus,
  userActionLogs,
  setUserActionLogs,
  triggerGoogleAuthDiagnostics,
  triggerGoogleDocsDiagnostics,
  triggerGoogleDriveDiagnostics,
  addActionLog
}) => {
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showCallbackSecret, setShowCallbackSecret] = useState(false);
  const [showIntegrationKey, setShowIntegrationKey] = useState(false);

  // Verification process states
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'none' | 'success' | 'partial' | 'failed';
    message: string;
  }>({ status: 'none', message: '' });

  // Autoteste process states & methods
  const [isSelfTesting, setIsSelfTesting] = useState(false);
  const [selfTestResult, setSelfTestResult] = useState<{
    ran: boolean;
    success: boolean;
    serviceAccountConfigured: boolean;
    serviceAccountConfiguredHint?: string;
    serviceAccountTokenOk: boolean;
    serviceAccountTokenOkHint?: string;
    templateReadable: boolean;
    templateReadableHint?: string;
    templateReadableTitle?: string;
    integrationKeyConfigured: boolean;
    integrationKeyConfiguredHint?: string;
  } | null>(null);

  const handleRunSelfTest = async () => {
    setIsSelfTesting(true);
    setSelfTestResult(null);
    addActionLog('GDI_SELFTEST_STARTED', 'success', 'Operador iniciou o autoteste completo de pré-requisitos síncronos.');
    
    try {
      const activeKey = integrationKeyInput || dbConfig?.gdiIntegrationKey || '';
      const url = `/api/selftest?key=${encodeURIComponent(activeKey)}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok) {
        setSelfTestResult({
          ran: true,
          success: data.serviceAccountConfigured && data.serviceAccountTokenOk && data.templateReadable && data.integrationKeyConfigured,
          ...data
        });
        addActionLog('GDI_SELFTEST_COMPLETED', 'success', 'Autoteste síncrono GDI verificado com sucesso.');
      } else {
        setSelfTestResult({
          ran: true,
          success: false,
          serviceAccountConfigured: false,
          serviceAccountTokenOk: false,
          templateReadable: false,
          integrationKeyConfigured: false,
          serviceAccountConfiguredHint: data.errorMessage || "Falha ao validar chave de integração para executar o autoteste."
        });
        addActionLog('GDI_SELFTEST_FAILED', 'failed', `Falha ao executar autoteste: ${data.errorMessage || 'Não autorizado'}`);
      }
    } catch (e: any) {
      console.error(e);
      setSelfTestResult({
        ran: true,
        success: false,
        serviceAccountConfigured: false,
        serviceAccountTokenOk: false,
        templateReadable: false,
        integrationKeyConfigured: false,
        serviceAccountConfiguredHint: `Erro de conexão: ${e.message}`
      });
      addActionLog('GDI_SELFTEST_ERROR', 'failed', `Erro de rede: ${e.message}`);
    } finally {
      setIsSelfTesting(false);
    }
  };

  // Handle cross-window communication for real Popup OAuth success/fail events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: verify origin if needed, but in standard local development sandboxes we allow wildcard
      if (event.data && event.data.type === 'OAUTH_AUTH_SUCCESS') {
        setGoogleAuthStatus('autenticado');
        if (event.data.log) {
          setUserActionLogs(prev => [event.data.log, ...prev]);
        }
        setVerificationResult({
          status: 'success',
          message: 'Google Workspace autenticado via OAuth com sucesso! Token de sessão carregado.'
        });
      } else if (event.data && event.data.type === 'OAUTH_AUTH_FAILED') {
        setGoogleAuthStatus('erro_autenticacao');
        if (event.data.log) {
          setUserActionLogs(prev => [event.data.log, ...prev]);
        }
        setVerificationResult({
          status: 'failed',
          message: event.data.log?.message || 'Falha na autenticação via consentimento do Google.'
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [setGoogleAuthStatus, setUserActionLogs]);

  // Button Action: "Conectar Google"
  const handleConnectGoogle = async () => {
    try {
      addActionLog('GDI_GOOGLE_CONNECT_CLICKED', 'success', 'Operador solicitou conexão síncrona com Google Workspace.');
      
      const res = await fetch('/api/google/auth/start');
      if (res.ok) {
        const data = await res.json();
        
        // Append initial logs returned from backend
        if (data.logs && data.logs.length > 0) {
          setUserActionLogs(prev => [...data.logs.slice().reverse(), ...prev]);
        }

        if (data.type === 'service_account' && data.success) {
          setGoogleAuthStatus(data.status);
          setVerificationResult({
            status: 'success',
            message: 'Service Account validada com acesso ao Google Docs e Google Drive.'
          });
        } else if (data.type === 'oauth' && data.success && data.url) {
          setGoogleAuthStatus('aguardando_consentimento');
          // Open OAuth consent window popup
          const width = 600;
          const height = 650;
          const left = window.screen.width / 2 - width / 2;
          const top = window.screen.height / 2 - height / 2;
          
          window.open(
            data.url, 
            'gdi_google_oauth', 
            `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes,scrollbars=yes`
          );
        } else if (!data.success) {
          setGoogleAuthStatus(data.status || 'erro_autenticacao');
          setVerificationResult({
            status: 'failed',
            message: data.message || 'Falha ao iniciar processo de conexão Google.'
          });
        }
      } else {
        setGoogleAuthStatus('erro_autenticacao');
        setVerificationResult({
          status: 'failed',
          message: 'Erro na chamada de início de autenticação do backend.'
        });
      }
    } catch (e: any) {
      console.error(e);
      setGoogleAuthStatus('erro_autenticacao');
      addActionLog('GDI_GOOGLE_AUTH_FAILED', 'failed', `Falha de requisição: ${e.message}`);
    }
  };

  // Button Action: "Verificar conexão"
  const handleVerifyConnection = async () => {
    setIsVerifying(true);
    setVerificationResult({ status: 'none', message: '' });
    addActionLog('GDI_GOOGLE_CONNECTION_VERIFY_STARTED', 'success', 'Varredura e auditoria diagnóstica das conexões Google iniciada.');

    try {
      // 1. Run Auth handshakes
      const authRes = await fetch('/api/google/auth/test', { method: 'POST' });
      let authOk = false;
      let authState = 'não_autenticado';
      
      if (authRes.ok) {
        const authData = await authRes.json();
        setGoogleAuthStatus(authData.status);
        authState = authData.status;
        if (authData.logs) {
          setUserActionLogs(prev => [...authData.logs.slice().reverse(), ...prev]);
        }
        authOk = authData.success;
      }

      // 2. Run Docs handshakes
      const docsRes = await fetch('/api/google/docs/test', { method: 'POST' });
      let docsOk = false;
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setGoogleDocsStatus(docsData.status);
        if (docsData.logs) {
          setUserActionLogs(prev => [...docsData.logs.slice().reverse(), ...prev]);
        }
        docsOk = docsData.success;
      }

      // 3. Run Drive scans
      const driveRes = await fetch('/api/google/drive/test', { method: 'POST' });
      let driveOk = false;
      if (driveRes.ok) {
        const driveData = await driveRes.json();
        setGoogleDriveStatus(driveData.status);
        if (driveData.logs) {
          setUserActionLogs(prev => [...driveData.logs.slice().reverse(), ...prev]);
        }
        driveOk = driveData.success;
      }

      // Consolidate status metrics
      const isAuthed = (authState === 'autenticado' || authState === 'service_account_validada');

      if (isAuthed && docsOk && driveOk) {
        setVerificationResult({
          status: 'success',
          message: 'Google Workspace conectado e validado.'
        });
        addActionLog('GDI_GOOGLE_DOCS_CONNECTION_OK', 'success', 'Canal do Google Docs respondendo com autenticidade.');
        addActionLog('GDI_GOOGLE_DRIVE_CONNECTION_OK', 'success', 'Canal do Google Drive respondendo com autenticidade.');
      } else if (isAuthed) {
        // Partial state
        let failPart = '';
        if (!docsOk && !driveOk) {
          failPart = 'Google Docs e Google Drive falharam';
        } else if (!docsOk) {
          failPart = 'Google Docs falhou';
        } else {
          failPart = 'Google Drive falhou';
        }
        setVerificationResult({
          status: 'partial',
          message: `Autenticação válida, mas ${failPart}.`
        });
        addActionLog('GDI_GOOGLE_CONNECTION_PARTIAL', 'failed', `Conexão parcial: ${failPart}.`);
      } else {
        setVerificationResult({
          status: 'failed',
          message: 'Google Workspace não conectado.'
        });
        addActionLog('GDI_GOOGLE_CONNECTION_FAILED', 'failed', 'Diagnósticos concluídos com barramentos falhos.');
      }

    } catch (e: any) {
      console.error(e);
      setVerificationResult({
        status: 'failed',
        message: `Falha mecânica durante testes: ${e.message}`
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Button Action: "Revogar conexão"
  const handleRevokeConnection = async () => {
    try {
      const res = await fetch('/api/google/auth/revoke', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setGoogleAuthStatus(data.status);
        setGoogleDocsStatus(data.status);
        setGoogleDriveStatus(data.status);
        if (data.logs) {
          setUserActionLogs(prev => [...data.logs.slice().reverse(), ...prev]);
        }
        setVerificationResult({
          status: 'none',
          message: 'Sessão Google revogada. Tokens expurgados com êxito.'
        });
      }
    } catch (e: any) {
      console.error(e);
      addActionLog('GDI_GOOGLE_CONNECTION_REVOKED', 'failed', `Falha ao expurgar tokens: ${e.message}`);
    }
  };

  // Webhook formatting helpers
  const getFullWebhookUrl = () => {
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}/api/webhook/gdi-job`;
  };

  // Render Status Badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'não_configurado':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-500 border border-slate-200">Não Configurado</span>;
      case 'não_autenticado':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-600 border border-amber-200 animate-pulse">Pendente de Autenticação</span>;
      case 'aguardando_consentimento':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-yellow-50 text-yellow-600 border border-yellow-250 animate-pulse">Aguardando Consentimento...</span>;
      case 'autenticando':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-600 border border-blue-200 animate-pulse">Autenticando...</span>;
      case 'autenticado':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">Autenticado via OAuth 2.0</span>;
      case 'service_account_validada':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-50 text-teal-600 border border-teal-200">Service Account Validada</span>;
      case 'erro_autenticacao':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-50 text-red-650 border border-red-200">Erro de Autenticação</span>;
      case 'erro_docs':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-50 text-red-650 border border-red-200">Erro de Docs API</span>;
      case 'erro_drive':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-50 text-red-650 border border-red-200">Erro de Drive API</span>;
      case 'conectado':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">Conectado e Ativo</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-500 border border-slate-200">{status}</span>;
    }
  };

  return (
    <div id="gdi-credentials-container" className="space-y-6">
      
      {/* 1. CARD — MODO DE CONEXÃO: SERVICE ACCOUNT */}
      <div id="gdi-connect-workspace-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Modo de conexão: Service Account</h3>
              <p className="text-[10px] text-slate-400">Integração servidor-servidor GDI ativa e automatizada</p>
            </div>
          </div>
          <div>
            {renderStatusBadge(googleAuthStatus)}
          </div>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs text-slate-600 leading-relaxed font-semibold">
            O GDI opera exclusivamente através de uma conta de serviço (Service Account) dedicada. Para que a automação tenha êxito de escrita e leitura, siga a regra de privilégio abaixo:
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
            <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              <span>Instrução de Compartilhamento Obrigatória:</span>
            </p>
            <p className="text-xs text-slate-650 leading-relaxed">
              Compartilhe os templates Google Docs e as pastas Google Drive com a Service Account abaixo.
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              <div className="bg-white px-3 py-2 rounded border border-slate-300 font-mono text-xs text-slate-750 select-all flex-1 select-all font-semibold overflow-x-auto whitespace-nowrap scrollbar-thin">
                firebase-adminsdk-fbsvc@planar-granite-495814-r8.iam.gserviceaccount.com
              </div>
              <button
                type="button"
                id="btn-copy-sa-email"
                onClick={() => {
                  navigator.clipboard.writeText('firebase-adminsdk-fbsvc@planar-granite-495814-r8.iam.gserviceaccount.com');
                  addActionLog('GDI_SA_EMAIL_COPIED', 'success', 'E-mail da Service Account copiado para compartilhamento no Docs/Drive.');
                  alert('E-mail da Service Account copiado para a área de transferência!');
                }}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded cursor-pointer transition flex items-center gap-1 shrink-0"
                title="Copiar e-mail para compartilhar seus templates ou pastas"
              >
                <span>Copiar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action controls flex box */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
          <button
            type="button"
            id="btn-google-auth-verify"
            onClick={handleVerifyConnection}
            disabled={isVerifying}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-300 text-xs font-semibold rounded-lg font-mono transition flex items-center gap-1.5 cursor-pointer"
          >
            {isVerifying ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" />
            )}
            <span>Verificar conexão</span>
          </button>
        </div>

        {/* Dynamic validation result banner */}
        {verificationResult.status !== 'none' && (
          <div className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
            verificationResult.status === 'success' 
              ? 'bg-emerald-50 border-emerald-150 text-emerald-800' 
              : verificationResult.status === 'partial'
                ? 'bg-amber-50 border-amber-150 text-amber-800'
                : 'bg-red-50 border-red-150 text-red-850'
          }`}>
            {verificationResult.status === 'success' && <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />}
            {verificationResult.status === 'partial' && <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />}
            {verificationResult.status === 'failed' && <XCircle className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />}
            
            <div className="space-y-0.5">
              <p className="font-bold">Resultado da Verificação:</p>
              <p className="font-mono text-[11px] leading-relaxed">{verificationResult.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* CARD — DIAGNÓSTICO DE PRÉ-REQUISITOS SÍNCRONOS */}
      <div id="gdi-selftest-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="h-4.5 w-4.5 shadow-2xs" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Diagnóstico de Pré-requisitos Síncronos</h3>
              <p className="text-[10px] text-slate-400">Verificação automática em tempo real para "Gerar Procuração"</p>
            </div>
          </div>
          <div>
            <button
              type="button"
              id="btn-run-selftest"
              onClick={handleRunSelfTest}
              disabled={isSelfTesting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-300 text-xs font-bold rounded-lg font-mono transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
            >
              {isSelfTesting ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5" />
              )}
              <span>Rodar Autoteste GDI</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-normal">
          Este processo verifica as credenciais cadastradas, gera o token de autenticação e testa o privilégio de leitura sobre o documento mestre Google Docs. Nenhum arquivo duplicado ou alteração de dados real é gerado durante o autoteste síncrono.
        </p>

        {selfTestResult && selfTestResult.ran && (
          <div className="space-y-3.5 border border-slate-150 rounded-xl p-4 bg-slate-50 shadow-2xs animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-700">Status Geral do GDI:</span>
              {selfTestResult.success ? (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-mono font-bold rounded-full border border-emerald-300">
                  TOTALMENTE PRONTO (100%)
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-mono font-bold rounded-full border border-red-300 animate-pulse">
                  REQUER ENGENHARIA / CORREÇÃO
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Item 1 */}
              <div className="bg-white p-3 rounded-lg border border-slate-150 space-y-1.5 shadow-3xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">1. Cadastro da Service Account</span>
                  {selfTestResult.serviceAccountConfigured ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="h-4.5 w-4.5 text-red-650 shrink-0" />
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  {selfTestResult.serviceAccountConfigured 
                    ? "Service Account configurada corretamente no GDI." 
                    : "E-mail ou chave privada ausente."}
                </p>
                {selfTestResult.serviceAccountConfiguredHint && (
                  <p className="text-[10px] text-red-650 bg-red-50 p-1.5 rounded leading-normal border border-red-100">
                    💡 {selfTestResult.serviceAccountConfiguredHint}
                  </p>
                )}
              </div>

              {/* Item 2 */}
              <div className="bg-white p-3 rounded-lg border border-slate-150 space-y-1.5 shadow-3xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">2. Validade do Token IAM</span>
                  {selfTestResult.serviceAccountTokenOk ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="h-4.5 w-4.5 text-red-650 shrink-0" />
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  {selfTestResult.serviceAccountTokenOk 
                    ? "Handshake com Google OAuth realizado com sucesso." 
                    : "Falha de credencial do Google ou chave inválida."}
                </p>
                {selfTestResult.serviceAccountTokenOkHint && (
                  <p className="text-[10px] text-red-650 bg-red-50 p-1.5 rounded leading-normal border border-red-100 font-mono break-all font-semibold">
                    💡 {selfTestResult.serviceAccountTokenOkHint}
                  </p>
                )}
              </div>

              {/* Item 3 */}
              <div className="bg-white p-3 rounded-lg border border-slate-150 space-y-1.5 shadow-3xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">3. Leitura do Template Mestre</span>
                  {selfTestResult.templateReadable ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="h-4.5 w-4.5 text-red-650 shrink-0" />
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  {selfTestResult.templateReadable 
                    ? `Template lido: "${selfTestResult.templateReadableTitle}"` 
                    : "Template inacessível para a Service Account."}
                </p>
                {selfTestResult.templateReadableHint && (
                  <p className="text-[10px] text-red-655 text-red-700 bg-red-50 p-1.5 rounded leading-normal border border-red-100 italic">
                    💡 {selfTestResult.templateReadableHint}
                  </p>
                )}
              </div>

              {/* Item 4 */}
              <div className="bg-white p-3 rounded-lg border border-slate-150 space-y-1.5 shadow-3xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">4. Chave de Integração GDI</span>
                  {selfTestResult.integrationKeyConfigured ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="h-4.5 w-4.5 text-red-650 shrink-0" />
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  {selfTestResult.integrationKeyConfigured 
                    ? "Auditoria de chave segura 'gdiIntegrationKey' validada." 
                    : "Chave de integração inativa/vazia."}
                </p>
                {selfTestResult.integrationKeyConfiguredHint && (
                  <p className="text-[10px] text-red-650 bg-red-50 p-1.5 rounded leading-normal border border-red-100">
                    💡 {selfTestResult.integrationKeyConfiguredHint}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. CARD — PARÂMETROS DE CONEXÃO SEGURA */}
      <div id="credentials-form-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Lock className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Parâmetros de Conexão Segura</h3>
              <p className="text-[10px] text-slate-400">Credenciais IAM Google integradas aos segredos da api GDI</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditingCredsForm ? (
              <button
                type="button"
                id="btn-edit-credentials"
                onClick={() => setIsEditingCredsForm(true)}
                className="px-3.5 py-1.5 bg-slate-900 text-slate-100 border border-slate-800 text-[11px] font-bold rounded-lg cursor-pointer hover:bg-slate-800"
              >
                Editar Parâmetros
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id="btn-cancel-edit-credentials"
                  onClick={() => setIsEditingCredsForm(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold rounded-lg cursor-pointer hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  id="btn-save-credentials"
                  onClick={handleSaveGoogleCredentials}
                  disabled={isSavingCreds}
                  className="px-4 py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded-lg cursor-pointer hover:bg-blue-700 disabled:bg-slate-300 flex items-center gap-1"
                >
                  {isSavingCreds ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  <span>Gravar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50/50 border border-blue-150 p-4 rounded-xl text-xs text-blue-800 leading-normal gap-2.5 flex items-start">
          <Info className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Segurança e Mascaramento de Secrets:</p>
            <p>
              As senhas, chaves privadas e segredos de token são armazenados e expurgados do barramento JSON do cliente para fins de sigilo. No preenchimento, se você deixar os campos de secrets em branco, os valores salvos anteriormente no arquivo seguro <code className="font-mono bg-blue-100 px-0.5">config.json</code> ou chaves no <code className="font-mono bg-blue-100 px-0.5">.env</code> permanecerão intactos para processamento.
            </p>
          </div>
        </div>

        {/* Form fields layout */}
        <div id="credentials-form-grid" className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          
          {/* Col Esquerda - Infos do Google Service Account */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1.5">Google Service Account (Controle IAM)</h4>
            
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">E-mail da Service Account (Google Service Account Email)</label>
              <input 
                type="text"
                disabled={!isEditingCredsForm}
                value={credsForm.gdiGoogleServiceAccountEmail || ''}
                onChange={(e) => setCredsForm({ ...credsForm, gdiGoogleServiceAccountEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-mono disabled:cursor-not-allowed text-[11px]"
                placeholder="Ex: firebase-adminsdk-fbsvc@planar-granite-495814-r8.iam.gserviceaccount.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Chave Privada da Service Account (Private Key)</label>
              <div className="relative">
                <textarea 
                  rows={4}
                  disabled={!isEditingCredsForm}
                  value={isEditingCredsForm ? privateKeyInput : '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDg4\n•••••••••••••••••••••••••••••••••••••••••••••••••••••\n-----END PRIVATE KEY-----'}
                  onChange={(e) => setPrivateKeyInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-mono disabled:cursor-not-allowed text-[11px] select-text"
                  placeholder={isEditingCredsForm ? "Cole a chave privada JSON do seu Service Account..." : "Mascarado por segurança física do repositório."}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Google Cloud Project ID</label>
              <input 
                type="text"
                disabled={!isEditingCredsForm}
                value={credsForm.gdiGoogleProjectId || ''}
                onChange={(e) => setCredsForm({ ...credsForm, gdiGoogleProjectId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-mono disabled:cursor-not-allowed text-[11px]"
                placeholder="Ex: planar-granite-495814-r8"
              />
            </div>
          </div>

          {/* Col Direita - API Key e Config Canal BOSS */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1.5">Segurança do Portal BOSS e Tokens</h4>
            
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Google Developer API Key (Opcional)</label>
              <input 
                type="text"
                disabled={!isEditingCredsForm}
                value={credsForm.gdiGoogleApiKey || ''}
                onChange={(e) => setCredsForm({ ...credsForm, gdiGoogleApiKey: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-mono disabled:cursor-not-allowed text-[11px]"
                placeholder="Ex: AIzaSyD92_jZba_xyz2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">BOSS Callback Secret Link Token</label>
              <div className="relative">
                <input 
                  type={showCallbackSecret ? 'text' : 'password'}
                  disabled={!isEditingCredsForm}
                  value={isEditingCredsForm ? callbackSecretInput : '••••••••••••••••••••••••••••••••'}
                  onChange={(e) => setCallbackSecretInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-mono disabled:cursor-not-allowed text-[11px] pr-10"
                  placeholder={isEditingCredsForm ? "Secret para validar segurança de callback..." : "Símbolo ocultado"}
                />
                {!isEditingCredsForm ? null : (
                  <button
                    type="button"
                    onClick={() => setShowCallbackSecret(!showCallbackSecret)}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showCallbackSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Chave de Auditoria GDI (X-BOSS-Google-Docs-Integration-Key)</label>
              <div className="relative">
                <input 
                  type={showIntegrationKey ? 'text' : 'password'}
                  disabled={!isEditingCredsForm}
                  value={isEditingCredsForm ? integrationKeyInput : '••••••••••••••••••••••••••••••••'}
                  onChange={(e) => setIntegrationKeyInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-mono disabled:cursor-not-allowed text-[11px] pr-10"
                  placeholder={isEditingCredsForm ? "Token para cabeçalho do webhook..." : "Símbolo ocultado"}
                />
                {!isEditingCredsForm ? null : (
                  <button
                    type="button"
                    onClick={() => setShowIntegrationKey(!showIntegrationKey)}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showIntegrationKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 3. CARD — API GOOGLE DOCS STATUS */}
      <div id="gdi-docs-api-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">API Google Docs</h3>
              <p className="text-[10px] text-slate-400">Canal de geração, clonagem e substituição de templates síncronos</p>
            </div>
          </div>
          <div>
            {renderStatusBadge(googleDocsStatus)}
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-normal">
          Testa a permissão direta à API Google Docs estruturada. Essa validação simula o preenchimento de placeholders com um cabeçalho fictício para verificar integridade da escrita.
        </p>

        <div className="pt-1.5">
          <button
            type="button"
            id="btn-trigger-docs-diagnostics"
            onClick={triggerGoogleDocsDiagnostics}
            className="px-3.5 py-1.5 border border-slate-250 text-slate-700 bg-slate-50 hover:bg-slate-100 text-xs font-semibold rounded-lg font-mono flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Testar Escrita Google Docs</span>
          </button>
        </div>
      </div>

      {/* 4. CARD — API GOOGLE DRIVE STATUS */}
      <div id="gdi-drive-api-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">API Google Drive</h3>
              <p className="text-[10px] text-slate-400">Canal de clonagem de pastas corporativas e gravação de arquivos</p>
            </div>
          </div>
          <div>
            {renderStatusBadge(googleDriveStatus)}
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-normal">
          Testa a permissão e hierarquia de criação de arquivos nas pastas compartilhadas do Google Drive especificadas.
        </p>

        <div className="pt-1.5">
          <button
            type="button"
            id="btn-trigger-drive-diagnostics"
            onClick={triggerGoogleDriveDiagnostics}
            className="px-3.5 py-1.5 border border-slate-250 text-slate-700 bg-slate-50 hover:bg-slate-100 text-xs font-semibold rounded-lg font-mono flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Testar Escrita Google Drive</span>
          </button>
        </div>
      </div>

      {/* 5. CARD — PORTAL BOSS / WEBHOOK */}
      <div id="portal-boss-webhook-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Globe className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider font-mono">Portal BOSS / Webhook</h3>
              <p className="text-[10px] text-indigo-400">Canal direto de webhook para recebimento de preenchimento do Portal BOSS</p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <label className="text-[11px] font-bold text-indigo-700 block uppercase">Canal de Endpoint GDI Webhook Ativo</label>
          <p className="text-xs text-slate-500 pb-1 font-sans leading-relaxed">
            Configure o Portal BOSS para enviar os payloads JSON de automação de procuração ou contrato direto para esta URL receptora:
          </p>
          <div className="bg-slate-950 text-emerald-400 p-2.5 px-3.5 rounded-lg border border-slate-900 font-mono text-xs break-all select-all shadow-inner">
            {getFullWebhookUrl()}
          </div>
        </div>
      </div>

      {/* 6. CARD — LOGS DE ATIVIDADE */}
      <div id="user-activity-logs-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-slate-55 bg-slate-100 text-slate-700 flex items-center justify-center">
              <Database className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Log de Atividades do Operador GDI</h3>
              <p className="text-[10px] text-slate-400">Rastreabilidade cronológica síncrona dos handshakes reais Google Workspace</p>
            </div>
          </div>
        </div>

        <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-lg bg-slate-50 p-2.5 text-[10.5px] font-mono space-y-2">
          {userActionLogs.length === 0 ? (
            <p className="text-slate-400 italic text-center py-6">Aguardando interações ou testes de diagnósticos reais...</p>
          ) : (
            userActionLogs.map((log, idx) => (
              <div 
                key={idx} 
                className={`p-2 border rounded-md leading-relaxed ${
                  log.status === 'success' 
                    ? 'bg-white border-green-150 text-slate-700' 
                    : 'bg-red-50/50 border-red-100 text-red-750'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className={log.status === 'success' ? 'text-green-700' : 'text-red-700'}>
                    [{log.step}]
                  </span>
                  <span className="text-slate-400 font-mono text-[9px]">
                    {log.timestamp}
                  </span>
                </div>
                <p className="text-slate-600">{log.message}</p>
                {log.details && (
                  <p className="text-[9px] text-slate-400 mt-1 select-all">Detalhes: {log.details}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
