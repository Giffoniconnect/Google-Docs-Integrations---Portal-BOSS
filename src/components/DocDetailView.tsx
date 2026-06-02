import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings, 
  Brackets, 
  FileCode, 
  FolderCheck, 
  History, 
  Settings2,
  Lock,
  Sparkles,
  Link2,
  FileCheck2,
  Terminal,
  Compass
} from 'lucide-react';
import { DocCard } from '../types';

interface DocDetailViewProps {
  card: DocCard;
  onBack: () => void;
}

type TabType = 'templates' | 'placeholders' | 'destino' | 'jobs' | 'logs' | 'diagnostico' | 'config-automacao';

export default function DocDetailView({ card, onBack }: DocDetailViewProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('templates');

  const tabs = [
    { id: 'templates', label: 'Templates', icon: FileCode },
    { id: 'placeholders', label: 'Placeholders', icon: Brackets },
    { id: 'destino', label: 'Destino', icon: FolderCheck },
    { id: 'jobs', label: 'Jobs Recebidos', icon: Terminal },
    { id: 'logs', label: 'Logs', icon: History },
    { id: 'diagnostico', label: 'Diagnóstico', icon: Settings2 },
    { id: 'config-automacao', label: 'Configurações', icon: Settings },
  ];

  // Helper mock placeholders to make it look professional
  const getMockPlaceholders = () => {
    switch (card.id) {
      case 'procuracao-pf':
        return ['{{OUTORGANTE_NOME}}', '{{OUTORGANTE_CPF}}', '{{OUTORGANTE_ESTADO_CIVIL}}', '{{OUTORGANTE_ENDERECO}}', '{{OUTORGADO_ADVOGADO}}'];
      case 'procuracao-pj':
        return ['{{EMPRESA_RAZAO_SOCIAL}}', '{{EMPRESA_CNPJ}}', '{{REPRESENTANTE_NOME}}', '{{REPRESENTANTE_CPF}}', '{{OUTORGADO_ADVOGADO}}'];
      case 'declaracao-pobreza-pf':
        return ['{{DECLARANTE_NOME}}', '{{DECLARANTE_CPF}}', '{{DECLARANTE_RG}}', '{{DECLARANTE_PROFISSAO}}', '{{REPRESENTACAO_VARA}}'];
      case 'declaracao-pobreza-pj':
        return ['{{EMPRESA_RAZAO_SOCIAL}}', '{{EMPRESA_CNPJ}}', '{{REPRESENTANTE_NOME}}', '{{REPRESENTANTE_CPF}}', '{{REPRESENTACAO_VARA}}'];
      case 'contrato-honorarios-pf':
        return ['{{CONTRATANTE_NOME}}', '{{CONTRATANTE_CPF}}', '{{VALOR_HONORARIOS}}', '{{FORMA_PAGAMENTO}}', '{{VARA_COMPETENTE}}'];
      case 'contrato-honorarios-pj':
        return ['{{EMPRESA_CONTRATANTE}}', '{{EMPRESA_CNPJ}}', '{{VALOR_CONTRATE}}', '{{CONVENIO_PARCELAMENTO}}', '{{FORO_COMARCA}}'];
      case 'primeiro-atendimento-pf':
        return ['{{CLIENTE_NOME}}', '{{CLIENTE_TELEFONE}}', '{{RELATO_FATOS}}', '{{VALOR_CAUSA_ESTIMADO}}', '{{DATA_ATENDIMENTO}}'];
      case 'primeiro-atendimento-pj':
        return ['{{REPRESENTANTE_NOME}}', '{{EMPRESA_NOME_FANTASIA}}', '{{EMPRESA_CNPJ}}', '{{HISTORICO_PJ}}', '{{VALOR_CONTRATO_PJ}}'];
      default:
        return ['{{NOME}}', '{{DOCUMENTO_ID}}', '{{DATA_REGISTRO}}'];
    }
  };

  const renderTabContent = (tabId: TabType) => {
    switch (tabId) {
      case 'templates':
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-800">Mapeador de Arquivos do Google Docs</h3>
              <p className="text-xs text-slate-400">Gerencie os arquivos de modelagem que darão origem à {card.title}.</p>
            </div>
            
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center flex flex-col items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                <FileCode className="h-6 w-6 text-blue-600/70" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Templates de Impressão ({card.category.toUpperCase()})</p>
              <p className="mt-2 text-xs text-slate-500 max-w-sm">
                Área reservada para configuração futura.
              </p>
              <div className="mt-6 flex gap-2">
                <button 
                  onClick={() => alert(`Este é um protótipo visual. A conexão de templates do Google Docs para "${card.title}" está reservada para as próximas etapas.`)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition active:scale-95"
                >
                  Selecionar da Nuvem
                </button>
              </div>
            </div>
          </div>
        );

      case 'placeholders':
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-800">Mapeamento de Variáveis e Chaves</h3>
              <p className="text-xs text-slate-400">Variáveis textuais em chaves duplas (ex: {"{{AUTO_VAR}}"}) identificadas no documento.</p>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 border border-slate-150 p-4">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5 font-mono">Dicionário de Variáveis Mapeadas (Estrutura Estática)</p>
                <div className="flex flex-wrap gap-2">
                  {getMockPlaceholders().map((placeholder, idx) => (
                    <span 
                      key={idx} 
                      className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-mono shadow-xs font-medium cursor-default"
                    >
                      {placeholder}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-55/30 p-8 text-center flex flex-col items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                  <Brackets className="h-6 w-6 text-slate-500" />
                </div>
                <p className="text-xs font-semibold text-slate-600">Configuração de Placeholder Dinâmico</p>
                <p className="mt-1 text-[11px] text-slate-400 max-w-sm">
                  Área reservada para configuração futura.
                </p>
              </div>
            </div>
          </div>
        );

      case 'destino':
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-800">Pasta Destino no Google Drive</h3>
              <p className="text-xs text-slate-400">Defina o diretório padrão onde cada {card.title} em PDF será arquivado automaticamente.</p>
            </div>

            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center flex flex-col items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                <FolderCheck className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Caminho da Pasta de Documentos</p>
              <p className="mt-2 text-xs text-slate-500 max-w-sm">
                Área reservada para configuração futura.
              </p>
              <div className="mt-6">
                <button className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50">
                  Selecionar Pasta no Google Drive
                </button>
              </div>
            </div>
          </div>
        );

      case 'logs':
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-800">Histórico de Geração e Chamadas</h3>
              <p className="text-xs text-slate-400">Rastreamento estatístico de todas as execuções deste modelo auxiliar.</p>
            </div>

            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center flex flex-col items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                <History className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Registros de Execuções</p>
              <p className="mt-2 text-xs text-slate-500 max-w-sm">
                Área reservada para configuração futura.
              </p>
            </div>
          </div>
        );

      case 'jobs':
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-800">Jobs Recebidos</h3>
              <p className="text-xs text-slate-400">Instâncias de requisição enviadas de forma assíncrona pelo Portal BOSS Clientes.</p>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center flex flex-col items-center justify-center">
                <Terminal className="h-6 w-6 text-blue-500 mb-2" />
                <p className="text-xs font-semibold text-slate-700">Fila de Recomposição de Lote</p>
                <p className="text-[11px] text-slate-500 max-w-md mt-1">
                  Aguardando sinalização de eventos (webhooks) do Portal BOSS. Rota de recebimento estática ativa.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                <div className="bg-slate-50 p-2.5 font-mono text-[10px] text-slate-400 font-bold border-b border-slate-150 flex justify-between">
                  <span>ID JOB</span>
                  <span>DATA</span>
                  <span>CLIENTE</span>
                  <span>STATUS</span>
                </div>
                <div className="p-3 font-mono text-[11px] text-slate-500 divide-y divide-slate-100 space-y-2">
                  <div className="flex justify-between items-center py-1">
                     <span className="text-blue-600 font-bold">#JOB-2026-001</span>
                     <span>02/06/2026</span>
                     <span className="text-slate-800 font-semibold">Exemplo S/A</span>
                     <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-bold">Aguardando Webhook</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                     <span className="text-blue-600 font-bold">#JOB-2026-002</span>
                     <span>02/06/2026</span>
                     <span className="text-slate-800 font-semibold">Dr. Giffoni Clientes</span>
                     <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-bold">Aguardando Webhook</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'diagnostico':
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-800">Diagnóstico da Cloud API</h3>
              <p className="text-xs text-slate-400">Verifique a integridade de rotas virtuais e segurança dos tokens.</p>
            </div>

            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center flex flex-col items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                <Settings2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Verificação de Escopos Virtuais</p>
              <p className="mt-2 text-xs text-slate-500 max-w-sm">
                Área reservada para configuração futura.
              </p>
            </div>
          </div>
        );

      case 'config-automacao': {
        const getDocFriendlyName = () => {
          switch (card.id) {
            case 'procuracao-pf':
              return 'Procuração Pessoa Física';
            case 'procuracao-pj':
              return 'Procuração Pessoa Jurídica';
            case 'declaracao-pobreza-pf':
              return 'Declaração de Pobreza Pessoa Física';
            case 'declaracao-pobreza-pj':
              return 'Declaração de Pobreza Pessoa Jurídica';
            case 'contrato-honorarios-pf':
              return 'Contrato de Honorários Pessoa Física';
            case 'contrato-honorarios-pj':
              return 'Contrato de Honorários Pessoa Jurídica';
            case 'primeiro-atendimento-pf':
              return '1º Atendimento Pessoa Física';
            case 'primeiro-atendimento-pj':
              return '1º Atendimento Pessoa Jurídica';
            default:
              return card.title;
          }
        };

        return (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-850">Configurações da automação {getDocFriendlyName()}</h3>
              <p className="text-xs text-slate-400">Customizações e parâmetros finais específicos para geração deste documento.</p>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[11px] uppercase font-mono tracking-wider px-3 py-1.5 rounded-lg">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                Configuração aguardando implementação operacional
              </div>

              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center flex flex-col items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
                  <Settings className="h-6 w-6 text-slate-500" />
                </div>
                
                <p className="text-sm font-bold text-slate-755 mb-2">Painel de Parâmetros e Regras do Documento</p>
                
                <p className="text-xs text-slate-500 max-w-lg leading-relaxed mb-4">
                  Este espaço concentrará as configurações específicas desta automação, incluindo template principal, regras de geração, validações obrigatórias, destino documental, padrão de nomenclatura e parâmetros de retorno ao Portal BOSS.
                </p>

                {/* Subroute Navigation Button */}
                <button
                  onClick={() => navigate(card.configRoute)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  <span>Abrir configurações da automação</span>
                </button>
                
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl text-left font-sans">
                  <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs opacity-60">
                    <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">Nomenclatura Padrão</span>
                    <span className="text-xs font-mono text-slate-700 font-medium">{"[NOME]_[CPF]_" + card.id.replace('-', '_').toUpperCase() + ".pdf"}</span>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs opacity-60">
                    <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">Callback do Portal BOSS</span>
                    <span className="text-xs font-mono text-slate-700 font-medium">https://api.portalboss.com.br/gdi/webhook</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      default:
        return (
          <div className="p-4 text-center text-xs text-slate-500">
            Área reservada para configuração futura.
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Route and info badge */}
      <div className="bg-slate-900 text-slate-100 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">ID DOCUMENT_TYPE TÉCNICO</span>
              <span className="text-xs font-mono font-bold text-blue-400">DOCUMENT_TYPE: {card.documentType}</span>
            </div>
          </div>
          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block"></div>
          <div>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">ID ROTA DO SISTEMA</span>
            <span className="text-xs font-mono font-bold text-slate-200">{card.route}</span>
          </div>
        </div>
        <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-right flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-[10px] font-mono text-slate-300">Rota criada — aguardando integração operacional</span>
        </div>
      </div>

      {/* Main Detail Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200 gap-4">
        
        {/* Back and Titles */}
        <div className="space-y-3">
          <button 
            onClick={onBack}
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors bg-white hover:bg-slate-55 border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar para Central GDI</span>
          </button>
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {card.title}
              </h1>
              {card.status === 'active' ? (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Ativa
                </span>
              ) : (
                <span className="bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  Em Desenvolvimento
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 max-w-xl font-sans leading-relaxed">
              Esta página será responsável por receber jobs do Portal BOSS Clientes e gerar {card.title} via Google Docs.
            </p>
          </div>
        </div>

        {/* Save button visual mock */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">Rascunho Visual</span>
          <button 
            onClick={() => alert(`Modo Visor: Esta página é uma demonstração visual de "${card.title}". Não é possível salvar alterações neste sandbox.`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-xs transition active:scale-95"
          >
            Salvar Layout
          </button>
        </div>
      </div>

      {/* Tabs and Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Sidebar Tabs Navigator */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-2 space-y-1 shadow-xs">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-3 py-2">
            Navegação de Módulos
          </p>
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full inline-flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isTabActive 
                    ? 'bg-blue-50 text-blue-700 border-l-2 border-l-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <IconComponent className={`h-4 w-4 ${isTabActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Detail panel content */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6 shadow-xs min-h-[300px] flex flex-col justify-between">
          <div>
            {renderTabContent(activeTab)}
          </div>

          {/* Alert on future development */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-slate-400 text-[10px]">
            <span className="flex items-center gap-1.5 font-sans font-medium">
              <Lock className="h-3 w-3" />
              Ambiente de arquitetura estática isolada
            </span>
            <span className="font-mono">ID: {card.id.toUpperCase()}_MOCK</span>
          </div>
        </div>

      </div>

    </div>
  );
}
