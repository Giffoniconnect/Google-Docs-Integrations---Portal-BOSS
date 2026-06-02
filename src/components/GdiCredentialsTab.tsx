import React, { useState } from 'react';
import { Lock, Save, RefreshCw, Key, Info, HelpCircle, Eye, EyeOff } from 'lucide-react';

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
  dbConfig
}) => {
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showCallbackSecret, setShowCallbackSecret] = useState(false);
  const [showIntegrationKey, setShowIntegrationKey] = useState(false);

  // Webhook relative calculation
  const getFullWebhookUrl = () => {
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}/api/webhook/gdi-job`;
  };

  return (
    <div className="space-y-6">
      
      {/* CARD — CREDENCIAIS DO GDI E CANAL BOSS */}
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
                onClick={() => setIsEditingCredsForm(true)}
                className="px-3.5 py-1.5 bg-slate-900 text-slate-105 border border-slate-800 text-[11px] font-bold rounded-lg cursor-pointer hover:bg-slate-850"
              >
                Editar Parâmetros
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditingCredsForm(false)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-650 border border-slate-200 text-[11px] font-bold rounded-lg cursor-pointer hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveGoogleCredentials}
                  disabled={isSavingCreds}
                  className="px-4 py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded-lg cursor-pointer hover:bg-blue-700 disabled:bg-slate-350 flex items-center gap-1"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          
          {/* Col Esquerda - Infos do Google IAM */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1.5">Google Web Authentication (IAM)</h4>
            
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Client ID (OAuth 2.0)</label>
              <input 
                type="text"
                disabled={!isEditingCredsForm}
                value={credsForm.gdiGoogleClientId || ''}
                onChange={(e) => setCredsForm({ ...credsForm, gdiGoogleClientId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-mono disabled:cursor-not-allowed disabled:bg-slate-50/50 text-[11px]"
                placeholder="Ex: 893122-google-clientid-xyz.apps.googleusercontent.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Client Secret (OAuth 2.0)</label>
              <div className="relative">
                <input 
                  type={showClientSecret ? 'text' : 'password'}
                  disabled={!isEditingCredsForm}
                  value={isEditingCredsForm ? clientSecretInput : '••••••••••••••••••••••••••••••••'}
                  onChange={(e) => setClientSecretInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-750 font-mono disabled:cursor-not-allowed disabled:bg-slate-50/50 text-[11px] pr-10"
                  placeholder={isEditingCredsForm ? "Insira uma nova chave secreta OAuth..." : "Símbolo ocultado"}
                />
                {!isEditingCredsForm ? null : (
                  <button
                    type="button"
                    onClick={() => setShowClientSecret(!showClientSecret)}
                    className="absolute right-2 top-2 text-slate-405 hover:text-slate-650"
                  >
                    {showClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Redirect URI do OAuth</label>
              <input 
                type="text"
                disabled={!isEditingCredsForm}
                value={credsForm.gdiGoogleRedirectUri || ''}
                onChange={(e) => setCredsForm({ ...credsForm, gdiGoogleRedirectUri: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-705 font-mono disabled:cursor-not-allowed text-[11px]"
                placeholder="Ex: http://localhost:3000/api/google/callback"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Conta de Serviço (E-mail IAM)</label>
              <input 
                type="text"
                disabled={!isEditingCredsForm}
                value={credsForm.gdiGoogleServiceAccountEmail || ''}
                onChange={(e) => setCredsForm({ ...credsForm, gdiGoogleServiceAccountEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-755 font-mono disabled:cursor-not-allowed text-[11px]"
                placeholder="Ex: gdocs-sa@empresa-projeto.iam.gserviceaccount.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Chave Privada Conta Serviço (Service Account Private Key)</label>
              <div className="relative">
                <textarea 
                  rows={3}
                  disabled={!isEditingCredsForm}
                  value={isEditingCredsForm ? privateKeyInput : '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDg4\n•••••••••••••••••••••••••••••••••••••••••••••••••••••\n-----END PRIVATE KEY-----'}
                  onChange={(e) => setPrivateKeyInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-755 font-mono disabled:cursor-not-allowed text-[11px] select-text"
                  placeholder={isEditingCredsForm ? "Cole aqui a chave privada JSON do seu Service Account..." : "Mascarado por segurança física do repositório."}
                />
              </div>
            </div>
          </div>

          {/* Col Direita - API Key e Config Canal BOSS */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1.5">Conexões Portal BOSS e Tokens</h4>
            
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Chave Geral Conexão (Google Developer API Key)</label>
              <input 
                type="text"
                disabled={!isEditingCredsForm}
                value={credsForm.gdiGoogleApiKey || ''}
                onChange={(e) => setCredsForm({ ...credsForm, gdiGoogleApiKey: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-755 font-mono disabled:cursor-not-allowed text-[11px]"
                placeholder="Ex: AIzaSyD92_jZba_xyz2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">Google Cloud Project ID</label>
              <input 
                type="text"
                disabled={!isEditingCredsForm}
                value={credsForm.gdiGoogleProjectId || ''}
                onChange={(e) => setCredsForm({ ...credsForm, gdiGoogleProjectId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-755 font-mono disabled:cursor-not-allowed text-[11px]"
                placeholder="Ex: portal-boss-cloud-2026"
              />
            </div>

            <div className="space-y-1 bg-slate-50/50 p-3 rounded-lg border border-slate-100 mt-2">
              <label className="text-[10.5px] font-bold text-indigo-700 block mb-1">ROTA DESTINO RECEPTORA DE JOBS (BOSS WEBHOOK)</label>
              <p className="text-[11px] text-slate-500 mb-1.5 font-sans leading-relaxed">
                As requisições externas de preenchimento documental devem apontar para este endereço sob as cabeças REST autorizadas:
              </p>
              <div className="bg-slate-900 text-slate-205 p-2 px-3 rounded-lg border border-slate-800 font-mono text-[10.5px] break-all select-all">
                {getFullWebhookUrl()}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 block uppercase">BOSS Callback Secret Link Token</label>
              <div className="relative">
                <input 
                  type={showCallbackSecret ? 'text' : 'password'}
                  disabled={!isEditingCredsForm}
                  value={isEditingCredsForm ? callbackSecretInput : '••••••••••••••••••••••••••••••••'}
                  onChange={(e) => setCallbackSecretInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-755 font-mono disabled:cursor-not-allowed text-[11px] pr-10"
                  placeholder={isEditingCredsForm ? "Secret para validar segurança de callback..." : "Símbolo ocultado"}
                />
                {!isEditingCredsForm ? null : (
                  <button
                    type="button"
                    onClick={() => setShowCallbackSecret(!showCallbackSecret)}
                    className="absolute right-2 top-2 text-slate-405 hover:text-slate-650"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-750 font-mono disabled:cursor-not-allowed text-[11px] pr-10"
                  placeholder={isEditingCredsForm ? "Token para cabeçalho do webhook..." : "Símbolo ocultado"}
                />
                {!isEditingCredsForm ? null : (
                  <button
                    type="button"
                    onClick={() => setShowIntegrationKey(!showIntegrationKey)}
                    className="absolute right-2 top-2 text-slate-405 hover:text-slate-650"
                  >
                    {showIntegrationKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
