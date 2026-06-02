import React from 'react';
import { 
  Play, Brackets, Copy, History, RefreshCw, Send, Lock, 
  Terminal, ShieldAlert, AlertTriangle, AlertCircle, Info 
} from 'lucide-react';
import { GoogleDocsCard, GdiLogEntry } from '../types';

interface GdiSimuladorTabProps {
  card: GoogleDocsCard;
  rawPayloadText: string;
  setRawPayloadText: (val: string) => void;
  parseError: string | null;
  isPayloadValid: boolean;
  normalizedData: any;
  mapperResult: any;
  simulationStatus: string;
  simulationErrorType: string;
  setSimulationErrorType: (val: string) => void;
  existingDocConflict: boolean;
  setExistingDocConflict: (val: boolean | ((p: boolean) => boolean)) => void;
  antiDuplicitySetting: 'new_version' | 'alert' | 'cancel';
  setAntiDuplicitySetting: (val: 'new_version' | 'alert' | 'cancel') => void;
  retryCount: number;
  lastRetryAt: string;
  reprocessReason: string;
  setReprocessReason: (val: string) => void;
  diagnosticSteps: {
    received: boolean;
    docTypeValid: boolean;
    templateConfigured: boolean;
    placeholdersMapped: boolean;
    destinationIdReceived: boolean;
    gdiHasPermission: boolean;
    docCreated: boolean;
    savedToFolder: boolean;
    resultPrepared: boolean;
    returnedToBoss: boolean;
  };
  performanceLogs: GdiLogEntry[];
  userActionLogs: any[];
  handleReprocess: () => void;
  handleSimulateSuccess: () => void;
  handleSimulateFailure: (errType?: string) => void;
  triggerMockJobIncomingOnBackend: () => Promise<void>;
  getCallbackSuccessJson: () => string;
  getCallbackFailureJson: (type: string, msg: string) => string;
  getErrorTypeDetail: (type: string) => any;
  triggerCopy: (text: string, label: string) => void;
}

export const GdiSimuladorTab: React.FC<GdiSimuladorTabProps> = ({
  card,
  rawPayloadText,
  setRawPayloadText,
  parseError,
  isPayloadValid,
  normalizedData,
  mapperResult,
  simulationStatus,
  simulationErrorType,
  setSimulationErrorType,
  existingDocConflict,
  setExistingDocConflict,
  antiDuplicitySetting,
  setAntiDuplicitySetting,
  retryCount,
  lastRetryAt,
  reprocessReason,
  setReprocessReason,
  diagnosticSteps,
  performanceLogs,
  userActionLogs,
  handleReprocess,
  handleSimulateSuccess,
  handleSimulateFailure,
  triggerMockJobIncomingOnBackend,
  getCallbackSuccessJson,
  getCallbackFailureJson,
  getErrorTypeDetail,
  triggerCopy
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* SEÇÃO DA ESQUERDA: EDITOR E LOGS DO SIMULADOR */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* CARD — DADOS CRUS E CONTROLES DE PAYLOAD */}
        <div id="simulated-payload-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Terminal className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Payload de Entrada e Encomenda do Rascunho (JSON)</h3>
                <p className="text-[10px] text-slate-400">Sandbox dinâmico: altere nomes e veja os placeholders reagirem</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="text-slate-400">STATUS DATA:</span>
              {isPayloadValid ? (
                <span className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Saneado
                </span>
              ) : (
                <span className="flex items-center gap-1 font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Erro / Mutado
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-normal">
            Esse simulador analisa em tempo real os nós de dados provenientes do barramento. Altere qualquer valor texto na caixa abaixo para ver a auditoria de variables e diagnose de placeholders correspondentes reagir instantaneamente.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Editor Textarea */}
            <div className="space-y-1.5 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-0.5">Editor JSON</span>
                {parseError ? (
                  <span className="text-[9px] text-rose-600 font-mono font-bold bg-rose-50 px-1 border border-rose-100 rounded">Sintaxe Inválida</span>
                ) : (
                  <span className="text-[9px] text-emerald-600 font-mono font-bold bg-emerald-50 px-1 border border-emerald-100 rounded">Sintaxe OK</span>
                )}
              </div>
              <textarea
                value={rawPayloadText}
                onChange={(e) => setRawPayloadText(e.target.value)}
                className="w-full h-80 bg-slate-900 text-slate-300 p-3 rounded-lg font-mono text-[10px] leading-relaxed border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none select-text"
                placeholder="Cole o payload JSON de teste aqui..."
              />
            </div>

            {/* Normalizador result preview */}
            <div className="space-y-1.5 flex flex-col">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-0.5">Payload GDI Normalizado</span>
              <div className="bg-slate-900 border border-slate-800 rounded-lg h-80 overflow-y-auto p-3 font-mono text-[10px] text-emerald-400 leading-relaxed shadow-inner">
                <pre>{JSON.stringify(normalizedData, null, 2)}</pre>
              </div>
            </div>

          </div>

          {/* Trigger mock button */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-2">
            <span className="text-[10.5px] text-slate-450 italic">* As alterações na caixa acima não alteram os dados do banco até disparar o webhook</span>
            <button
              type="button"
              onClick={triggerMockJobIncomingOnBackend}
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Enviar Payload ao Webhook / BD</span>
            </button>
          </div>
        </div>

        {/* CARD — CONTRATO DE RETORNO DO PORTAL BOSS */}
        <div id="callback-return-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Send className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Contrato de Saída de Callback (GDI ⇄ BOSS)</h3>
                <p className="text-[10px] text-slate-400">JSON de retorno enviado ao Portal BOSS após processamento</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => triggerCopy(simulationStatus === 'success' ? getCallbackSuccessJson() : getCallbackFailureJson(simulationErrorType, getErrorTypeDetail(simulationErrorType).message), 'callback')}
              className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 border border-slate-200 px-2 py-1 rounded hover:bg-slate-50"
            >
              <Copy className="h-3 w-3" />
              <span>Copiar JSON</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 leading-normal">
            Sempre que um webhook de job é executado, o GDI gera uma chamada de retorno informando os metadados finais. Mude o status do simulador ou erros no grid lateral para ver o formato do JSON de erro.
          </p>

          <div className="bg-slate-900 rounded-xl overflow-hidden text-slate-300 p-3.5 font-mono text-[10.5px] leading-relaxed max-h-[250px] overflow-y-auto shadow-inner relative">
            <div className="absolute top-2 right-2 text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-sans uppercase font-bold tracking-wider">
              SAÍDA: {simulationStatus.toUpperCase()}
            </div>
            <pre>
              {simulationStatus === 'success' 
                ? getCallbackSuccessJson() 
                : getCallbackFailureJson(simulationErrorType, getErrorTypeDetail(simulationErrorType).message)
              }
            </pre>
          </div>
        </div>

      </div>

      {/* SEÇÃO DA DIREITA: CHECKS E CONTROLES DO SIMULADOR */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* DIAGNÓSTICO DA INTEGRAÇÃO */}
        <div id="diagnostic-checklist-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center space-x-2.5 mb-2.5 border-b border-slate-100 pb-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <AlertCircle className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider animate-pulse">Checklist do Diagnóstico (10 Passos)</h3>
              <p className="text-[10px] text-slate-400">Aprovação lógica do motor em simulação ativa</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="grid grid-cols-2 gap-1 px-2 py-1.5 font-mono text-[9.5px] text-slate-400 uppercase tracking-wider bg-slate-50 rounded">
              <span>Etapa lógica</span>
              <span className="text-right">Aprovação</span>
            </div>

            {[
              { label: 'GDI recebeu payload?', val: diagnosticSteps.received },
              { label: 'documentType é válido?', val: diagnosticSteps.docTypeValid },
              { label: 'template está configurado?', val: diagnosticSteps.templateConfigured },
              { label: 'placeholders estão mapeados?', val: diagnosticSteps.placeholdersMapped },
              { label: 'ID da pasta recebida no payload?', val: diagnosticSteps.destinationIdReceived },
              { label: 'GDI tem autoridade na pasta?', val: diagnosticSteps.gdiHasPermission },
              { label: 'documento foi criado na API?', val: diagnosticSteps.docCreated },
              { label: 'Salvo em pasta final no Drive?', val: diagnosticSteps.savedToFolder },
              { label: 'Metadados compilados?', val: diagnosticSteps.resultPrepared },
              { label: 'Integração enviou callback ao BOSS?', val: diagnosticSteps.returnedToBoss },
            ].map((step, idx) => (
              <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-50 text-[10.5px]">
                <span className={`font-medium ${step.val ? 'text-slate-700' : 'text-slate-400 line-through'}`}>{step.label}</span>
                {step.val ? (
                  <span className="font-mono font-bold text-emerald-600"> [ OK ] </span>
                ) : (
                  <span className="font-mono font-bold text-rose-600"> [ FALHA ] </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CONTROLES DO SIMULADOR */}
        <div id="simulators-interactive-controls" className="bg-slate-900 text-white rounded-xl border border-slate-800 p-5 shadow-md space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Play className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Centro de Falhas e Colisões</h3>
              <p className="text-[10px] text-slate-400">Force cenários de pânico para validar as tratativas</p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-sans">
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Use os disparadores abaixo para simular erros nas instâncias de gravação e verificar como o GDI encapsula os dados e os envia de volta ao barramento.
            </p>

            <div className="flex gap-2.5">
              <button 
                type="button"
                onClick={handleSimulateSuccess}
                className="flex-1 py-2 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 hover:border-emerald-500 rounded-lg font-bold text-center transition cursor-pointer"
              >
                Forçar 200 OK
              </button>
              <button 
                type="button"
                onClick={() => handleSimulateFailure()}
                className="flex-1 py-2 bg-rose-600/30 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 hover:border-rose-500 rounded-lg font-bold text-center transition cursor-pointer"
              >
                Forçar Falha
              </button>
            </div>

            <div className="space-y-1 mt-1">
              <span className="text-[10px] text-slate-450 font-mono block">Causa atrelada ao fluxo de falha simulada:</span>
              <select 
                value={simulationErrorType}
                onChange={(e) => {
                  setSimulationErrorType(e.target.value);
                  if (simulationStatus === 'failed') {
                    handleSimulateFailure(e.target.value);
                  }
                }}
                className="w-full border border-slate-750 rounded px-2.5 py-1.5 bg-slate-850 text-[11px] font-mono text-slate-300 focus:outline-none"
              >
                <option value="PAYLOAD_EMPTY">PAYLOAD_EMPTY</option>
                <option value="DOCUMENT_TYPE_MISSING">DOCUMENT_TYPE_MISSING</option>
                <option value="DOCUMENT_TYPE_INVALID">DOCUMENT_TYPE_INVALID</option>
                <option value="CASE_ID_MISSING">CASE_ID_MISSING</option>
                <option value="CLIENT_ID_MISSING">CLIENT_ID_MISSING</option>
                <option value="CLIENT_DATA_MISSING">CLIENT_DATA_MISSING</option>
                <option value="DESTINATION_FOLDER_ID_MISSING">DESTINATION_FOLDER_ID_MISSING</option>
                <option value="DESTINATION_FOLDER_URL_MISSING">DESTINATION_FOLDER_URL_MISSING</option>
                <option value="DESTINATION_FOLDER_PERMISSION_DENIED">DESTINATION_FOLDER_PERMISSION_DENIED</option>
                <option value="DESTINATION_FOLDER_NOT_FOUND">DESTINATION_FOLDER_NOT_FOUND</option>
                <option value="TEMPLATE_ID_MISSING">TEMPLATE_ID_MISSING</option>
                <option value="TEMPLATE_NOT_FOUND">TEMPLATE_NOT_FOUND</option>
                <option value="TEMPLATE_PERMISSION_DENIED">TEMPLATE_PERMISSION_DENIED</option>
                <option value="TEMPLATE_PLACEHOLDERS_INVALID">TEMPLATE_PLACEHOLDERS_INVALID</option>
              </select>
            </div>

            {/* Anti-duplicidade inside simulator */}
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 space-y-2 mt-4 text-[11px] text-slate-300">
              <div className="flex justify-between items-center font-sans">
                <span>Simular colisão de arquivamento:</span>
                <span className={`font-mono font-bold uppercase ${existingDocConflict ? 'text-amber-400' : 'text-slate-500'}`}>
                  {existingDocConflict ? 'CONFLITO' : 'Sem colisão'}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-1.5 mt-1.5">
                <span className="text-[10px] text-slate-400 font-mono">Alternar Flag:</span>
                <button 
                  type="button"
                  onClick={() => setExistingDocConflict(prev => !prev)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-slate-100 font-semibold cursor-pointer"
                >
                  {existingDocConflict ? 'Limpar colisão' : 'Forçar colisão'}
                </button>
              </div>
              
              {existingDocConflict && (
                <div className="space-y-1.5 pt-2 mt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono text-slate-450 block">Ação do GDI em caso de conflito:</span>
                  <div className="grid grid-cols-1 gap-1">
                    <label className="flex items-center gap-2 cursor-pointer text-[10.5px]">
                      <input 
                        type="radio" 
                        name="antidupSim" 
                        checked={antiDuplicitySetting === 'alert'}
                        onChange={() => setAntiDuplicitySetting('alert')}
                      />
                      <span>Bloquear e Alertar (alert)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[10.5px]">
                      <input 
                        type="radio" 
                        name="antidupSim" 
                        checked={antiDuplicitySetting === 'new_version'}
                        onChange={() => setAntiDuplicitySetting('new_version')}
                      />
                      <span>Substituir com Sufixo (new_version)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[10.5px]">
                      <input 
                        type="radio" 
                        name="antidupSim" 
                        checked={antiDuplicitySetting === 'cancel'}
                        onChange={() => setAntiDuplicitySetting('cancel')}
                      />
                      <span>Cancelar mestre (cancel)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LOGS DE ERROS DETALHADOS SIMULADOS */}
        {simulationStatus === 'failed' && (
          <div id="simulated-logs-puffer" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center space-x-2.5 mb-2 border-b border-slate-100 pb-3">
              <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Histórico de Falha Simulada Ativa</h3>
                <p className="text-[10px] text-slate-400">Parâmetros catalogados na auditoria síncrona</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-xl space-y-2 text-xs font-sans">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10.5px] font-bold text-rose-900 bg-rose-100 border border-rose-200 px-1.5 py-0.5 rounded uppercase">
                  CÓDIGO: {getErrorTypeDetail(simulationErrorType).code}
                </span>
                <span className="text-[9px] font-mono text-rose-500 font-bold">{getErrorTypeDetail(simulationErrorType).step}</span>
              </div>

              <div>
                <h5 className="font-bold text-[10.5px] text-rose-900">Mensagem:</h5>
                <p className="text-[11px] text-rose-700 leading-normal font-sans mt-0.5">“{getErrorTypeDetail(simulationErrorType).message}”</p>
              </div>

              <div className="bg-rose-950 text-rose-100 font-mono text-[9px] p-2.5 rounded-lg overflow-x-auto select-all leading-normal">
                <span className="text-[8px] bg-rose-900 px-1 py-0.5 rounded text-rose-300 font-sans block w-fit mb-1 font-bold">Trace Stack</span>
                <pre>{getErrorTypeDetail(simulationErrorType).stack}</pre>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
