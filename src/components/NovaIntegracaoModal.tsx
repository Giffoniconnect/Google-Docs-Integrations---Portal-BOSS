import { X, Sparkles, AlertCircle, FilePlus, ChevronRight } from 'lucide-react';

interface NovaIntegracaoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NovaIntegracaoModal({ isOpen, onClose }: NovaIntegracaoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-100">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <FilePlus className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Nova Integração de Template</h3>
            </div>
            <button 
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="mt-4 space-y-4">
            <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-4">
              <div className="flex space-x-3">
                <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Motor de Automação de Documentos</h4>
                  <p className="mt-1 text-xs text-blue-700 leading-relaxed">
                    Esta funcionalidade permitirá anexar novos documentos do Google Docs e configurar mapeamento de placeholders diretamente do painel administrativo.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium px-1">Selecione o tipo de template para a nova integração:</p>

            <div className="space-y-2">
              {[
                { name: "Contrato Social / PJ Especial", desc: "Integração direcionada para empresas parceiras" },
                { name: "Petição Inicial Simplificada", desc: "Fluxo automatizado de petições recursais" },
                { name: "Ficha Cadastral do Cliente", desc: "Importação direta de dados cadastrais para o Docs" }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer transition"
                  onClick={() => {
                    alert('Esta é uma demonstração visual do Portal BOSS. Este template estará disponível no lançamento.');
                  }}
                >
                  <div>
                    <h5 className="text-xs font-semibold text-slate-800">{item.name}</h5>
                    <p className="text-[10px] text-slate-400">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 rounded-lg p-3 border border-amber-100 mt-2">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span className="text-[10px] font-medium leading-normal">
                Modo de Visualização: Modificações e salvamentos estão desativados nesta etapa de validação.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end space-x-2 border-t border-slate-50 pt-4">
            <button
              onClick={onClose}
              className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 transition"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                alert('Nova integração visual criada! Os parâmetros de configuração serão inseridos aqui futuramente.');
                onClose();
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 shadow-sm transition"
            >
              Criar Rascunho
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
