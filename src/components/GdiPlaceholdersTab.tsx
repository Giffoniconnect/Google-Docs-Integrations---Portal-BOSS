import React from 'react';
import { Brackets, Copy, FileJson, Info } from 'lucide-react';
import { GoogleDocsCard } from '../types';

interface GdiPlaceholdersTabProps {
  card: GoogleDocsCard;
  normalizedData: any;
  getMappedPlaceholders: () => any[];
  getPayloadContractJson: () => string;
  triggerCopy: (text: string, label: string) => void;
  isPayloadValid: boolean;
}

export const GdiPlaceholdersTab: React.FC<GdiPlaceholdersTabProps> = ({
  card,
  normalizedData,
  getMappedPlaceholders,
  getPayloadContractJson,
  triggerCopy,
  isPayloadValid
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* SEÇÃO DA ESQUERDA: LISTA DE VARIÁVEIS EXPOSTAS */}
      <div className="lg:col-span-8 space-y-6">
        <div id="placeholders-dictionary-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center space-x-2.5 mb-4 border-b border-slate-100 pb-3">
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Brackets className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Mapeamento e Dicionário de Variáveis (CHAVES DUPLAS)</h3>
              <p className="text-[10px] text-slate-400 font-sans">Variáveis procuradas pelo motor e substituídas no arquivo final</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-500 leading-normal font-sans">
              Insira chaves duplas como <code className="font-mono bg-slate-50 text-amber-700 px-1 border border-slate-150 py-0.5 rounded">{"{{CHAVE_EXEMPLO}}"}</code> no arquivo do Google Docs. O motor GDI varrerá automaticamente o documento durante o processamento substituindo as tags correspondentes pelos parâmetros mapeados na carga do Portal BOSS.
            </p>

            <div className="overflow-x-auto border border-slate-150 rounded-xl">
              <table className="w-full text-left text-xs text-slate-650 font-sans border-collapse">
                <thead>
                  <tr className="bg-slate-55/60 text-[10px] uppercase font-bold text-slate-450 tracking-wider font-mono border-b border-slate-150">
                    <th className="py-2.5 px-3">Marcador procurado</th>
                    <th className="py-2.5 px-3">Caminho Técnico Payload (BOSS)</th>
                    <th className="py-2.5 px-3 uppercase text-[9px]">Obrigatório</th>
                    <th className="py-2.5 px-3">Dado do Exemplo Atual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 font-mono text-[10.5px]">
                  {getMappedPlaceholders().map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition duration-100">
                      <td className="py-2 px-3 font-semibold text-slate-800">{item.placeholder}</td>
                      <td className="py-2 px-3 text-blue-600 font-medium select-all hover:underline" title="Copie para usar no mapeamento JSON">{item.payloadField}</td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase ${
                          item.mandatory === 'Sim' ? 'bg-amber-100/50 text-amber-800 border border-amber-200/40' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.mandatory}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500 truncate max-w-[200px]" title={item.example}>
                        {item.example}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO DA DIREITA: CONTRATO DE ENVIO DO PORTAL BOSS */}
      <div className="lg:col-span-4 space-y-6">
        <div id="contrato-payload-card" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileJson className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Contrato de Payload (BOSS ⇄ GDI)</h3>
                <p className="text-[10px] text-slate-400">Modelo estrutural de JSON esperado da API externa</p>
              </div>
            </div>
            <button
              onClick={() => triggerCopy(getPayloadContractJson(), 'contrato')}
              className="p-1 hover:bg-slate-100 rounded text-slate-500 transition duration-150"
              title="Copiar JSON Modelo do Contrato"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-slate-500 leading-normal">
            Este JSON espelha o corpo da requisição que o Portal BOSS envia para rechear as chaves. Use-o como rascunho de cabeçalho no Postman ou em rotas externas de teste.
          </p>

          <div className="bg-slate-900 rounded-xl overflow-hidden text-slate-350 p-3.5 font-mono text-[10px] leading-relaxed max-h-[350px] overflow-y-auto relative shadow-inner">
            <pre className="select-all">{getPayloadContractJson()}</pre>
          </div>
        </div>
      </div>

    </div>
  );
};
