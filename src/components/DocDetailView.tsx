import { useState, Fragment } from 'react';
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

type TabType = 'templates' | 'placeholders' | 'config-automacao';

interface PortalBossVar {
  origin: string;
  normalized: string;
  placeholder: string;
  status: 'aguardando' | 'configurado';
  category: 'Cadastro' | 'Dados do Caso' | 'Dados do Escritório';
}

export default function DocDetailView({ card, onBack }: DocDetailViewProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('templates');

  const tabs = [
    { id: 'templates', label: 'Templates de Impressão', icon: FileCode },
    { id: 'placeholders', label: 'Placeholders', icon: Brackets },
    { id: 'config-automacao', label: 'Configurações da Automação', icon: Settings },
  ];

  // Helper dynamic dictionary mapping Portal BOSS variables to GDI and Google Docs Placeholders
  const getPortalBossVariableDictionary = (cardId: string): PortalBossVar[] => {
    const isPj = cardId.endsWith('-pj');
    const clientVars: PortalBossVar[] = [];
    
    if (!isPj) {
      // PF variables mapping
      let prefix = '';
      if (cardId.startsWith('procuracao')) prefix = 'OUTORGANTE_';
      else if (cardId.startsWith('declaracao')) prefix = 'DECLARANTE_';
      else if (cardId.startsWith('contrato')) prefix = 'CONTRATANTE_';
      else if (cardId.startsWith('primeiro')) prefix = 'CLIENTE_';
      else prefix = 'OUTORGANTE_';

      const fields = [
        { key: 'nomeCompleto', name: 'NOME' },
        { key: 'nacionalidade', name: 'NACIONALIDADE' },
        { key: 'estadoCivil', name: 'ESTADO_CIVIL' },
        { key: 'profissao', name: 'PROFISSAO' },
        { key: 'cpf', name: 'CPF' },
        { key: 'rg', name: 'RG' },
        { key: 'orgaoEmissor', name: 'ORGAO_EMISSOR' },
        { key: 'cep', name: 'CEP' },
        { key: 'endereco', name: 'ENDERECO' },
        { key: 'numero', name: 'NUMERO' },
        { key: 'complemento', name: 'COMPLEMENTO' },
        { key: 'bairro', name: 'BAIRRO' },
        { key: 'cidade', name: 'CIDADE' },
        { key: 'estado', name: 'ESTADO' },
        { key: 'email', name: 'EMAIL' },
        { key: 'telefone', name: 'TELEFONE' },
        { key: 'whatsapp', name: 'WHATSAPP' }
      ];

      fields.forEach(f => {
        clientVars.push({
          origin: `pf_${f.key}`,
          normalized: f.key,
          placeholder: `{{${prefix}${f.name}}}`,
          status: 'aguardando',
          category: 'Cadastro'
        });
      });
    } else {
      // PJ variables mapping
      let companyPrefix = '';
      if (cardId.startsWith('procuracao')) companyPrefix = 'EMPRESA_';
      else if (cardId.startsWith('declaracao')) companyPrefix = 'EMPRESA_';
      else if (cardId.startsWith('contrato')) companyPrefix = 'EMPRESA_';
      else if (cardId.startsWith('primeiro')) companyPrefix = 'EMPRESA_';

      const getCompanyPlaceholder = (key: string) => {
        if (key === 'razaoSocial') {
          if (cardId.startsWith('contrato')) return '{{EMPRESA_CONTRATANTE}}';
          if (cardId.startsWith('primeiro')) return '{{EMPRESA_NOME_FANTASIA}}';
          return `{{${companyPrefix}RAZAO_SOCIAL}}`;
        }
        return `{{${companyPrefix}${key.toUpperCase()}}}`;
      };

      const companyFields = [
        { key: 'razaoSocial' },
        { key: 'cnpj' },
        { key: 'cep' },
        { key: 'endereco' },
        { key: 'numero' },
        { key: 'complemento' },
        { key: 'bairro' },
        { key: 'cidade' },
        { key: 'estado' }
      ];

      companyFields.forEach(f => {
        clientVars.push({
          origin: `pj_${f.key}`,
          normalized: f.key,
          placeholder: getCompanyPlaceholder(f.key),
          status: 'aguardando',
          category: 'Cadastro'
        });
      });

      // Representante/Sócio fields
      const socioFields = [
        { key: 'nomeCompleto', name: 'NOME' },
        { key: 'nacionalidade', name: 'NACIONALIDADE' },
        { key: 'estadoCivil', name: 'ESTADO_CIVIL' },
        { key: 'profissao', name: 'PROFISSAO' },
        { key: 'cpf', name: 'CPF' },
        { key: 'rg', name: 'RG' }
      ];

      socioFields.forEach(f => {
        clientVars.push({
          origin: `socio_${f.key}`,
          normalized: `socio${f.key.charAt(0).toUpperCase() + f.key.slice(1)}`,
          placeholder: `{{REPRESENTANTE_${f.name}}}`,
          status: 'aguardando',
          category: 'Cadastro'
        });
      });
    }

    const caseVars: PortalBossVar[] = [
      {
        origin: 'caseId',
        normalized: 'caseId',
        placeholder: '{{CASE_ID}}',
        status: 'aguardando',
        category: 'Dados do Caso'
      },
      {
        origin: 'clientId',
        normalized: 'clientId',
        placeholder: '{{CLIENT_ID}}',
        status: 'aguardando',
        category: 'Dados do Caso'
      },
      {
        origin: 'destinationFolderId',
        normalized: 'destinationFolderId',
        placeholder: 'sem placeholder documental',
        status: 'aguardando',
        category: 'Dados do Caso'
      },
      {
        origin: 'destinationFolderUrl',
        normalized: 'destinationFolderUrl',
        placeholder: 'sem placeholder documental',
        status: 'aguardando',
        category: 'Dados do Caso'
      }
    ];

    const officeVars: PortalBossVar[] = [
      {
        origin: 'officeData.advogadoNome',
        normalized: 'advogadoNome',
        placeholder: '{{ADVOGADO_NOME}}',
        status: 'configurado',
        category: 'Dados do Escritório'
      },
      {
        origin: 'officeData.advogadoOab',
        normalized: 'advogadoOab',
        placeholder: '{{ADVOGADO_OAB}}',
        status: 'configurado',
        category: 'Dados do Escritório'
      },
      {
        origin: 'officeData.localAssinatura',
        normalized: 'localAssinatura',
        placeholder: '{{LOCAL_ASSINATURA}}',
        status: 'configurado',
        category: 'Dados do Escritório'
      },
      {
        origin: 'officeData.dataAssinatura',
        normalized: 'dataAssinatura',
        placeholder: '{{DATA_ASSINATURA}}',
        status: 'configurado',
        category: 'Dados do Escritório'
      }
    ];

    return [...clientVars, ...caseVars, ...officeVars];
  };

  const renderTabContent = (tabId: TabType) => {
    switch (tabId) {
      case 'templates': {
        const isProcuracaoPF = card.id === 'procuracao-pf';
        const docTitle = isProcuracaoPF ? `Modelo da Procuração PF` : `Modelo de ${card.title}`;
        const docDesc = isProcuracaoPF ? `Modelo utilizado para geração da Procuração PF.` : `Modelo operacional base utilizado para a automação e geração automática de ${card.title}.`;
        
        const googleDocsUrl = isProcuracaoPF 
          ? 'https://docs.google.com/document/d/16k_n_BTdf8wTCG8CK4T2TyAT93o5qrmZqjbROtrBqzk/edit?tab=t.0'
          : 'https://docs.google.com/document/d/16k_n_BTdf8wTCG8CK4T2TyAT93o5qrmZqjbROtrBqzk/edit?tab=t.0';
        const rfsPdfUrl = 'https://drive.google.com/drive/u/0/folders/1fhMk2RMwEM7RlDCEOlKl5CsEjujX5zMJ';

        return (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-800">Templates de Impressão</h3>
              <p className="text-xs text-slate-400">Instruções regulamentares de visualização e edição de templates operacionais.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{docTitle}</h4>
                  <p className="text-xs text-slate-500 mt-1">{docDesc}</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <a
                    href={googleDocsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Abrir modelo Google Docs</span>
                  </a>
                  <a
                    href={rfsPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition border border-slate-250 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Abrir versão PDF</span>
                  </a>
                </div>
              </div>

              {/* Informative Guidance banner */}
              <div className="bg-blue-50/50 border border-blue-150 rounded-xl p-4.5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider font-mono">Regra de Operação Visual GDI</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white border border-blue-100 p-3.5 rounded-lg space-y-1">
                    <span className="font-bold text-slate-800 block">Google Docs = Modelo Operacional</span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      O GDI utiliza o Google Docs original editável como template operacional para preenchimento de variáveis e substituição síncrona de placeholders.
                    </p>
                  </div>
                  <div className="bg-white border border-blue-100 p-3.5 rounded-lg space-y-1 opacity-80">
                    <span className="font-bold text-slate-650 block">PDF = Versão de Referência</span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      A versão em PDF serve apenas para conferência visual estática e de referência de design. Não deve ser editada nem usada como fonte direta.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'placeholders':
        return (
          <div className="space-y-6">
            <div className="border-b border-slate-150 pb-4">
              <h3 className="text-sm font-bold text-slate-900">Dicionário de Variáveis Importadas do Portal BOSS</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Este dicionário mostra quais informações o GDI espera receber do Portal BOSS Clientes para preencher automaticamente este documento. As variáveis abaixo serão importadas do cadastro do cliente, dos dados do caso e dos dados fixos do escritório.
              </p>
            </div>

            {/* Visual Process Flow Diagram */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 font-sans">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block mb-3">Linha de Processamento de Dados</span>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                <span className="px-2.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md font-semibold font-mono">Portal BOSS</span>
                <span className="text-slate-300">→</span>
                <span className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md font-semibold font-mono">Payload Recebido</span>
                <span className="text-slate-300">→</span>
                <span className="px-2.5 py-1.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-md font-semibold font-mono">Variáveis Importadas</span>
                <span className="text-slate-300">→</span>
                <span className="px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-md font-semibold font-mono">Normalização GDI</span>
                <span className="text-slate-300">→</span>
                <span className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md font-semibold font-mono font-bold">Google Docs Placeholder</span>
              </div>
            </div>

            {/* Structured Dictionary Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-4 font-bold">Origem no Portal BOSS</th>
                    <th className="py-2.5 px-4 font-bold">Nome normalizado GDI</th>
                    <th className="py-2.5 px-4 font-bold">Placeholder no Google Docs</th>
                    <th className="py-2.5 px-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {(() => {
                    const variables = getPortalBossVariableDictionary(card.id);
                    let lastCategory = '';
                    return variables.map((item, idx) => {
                      const showCategoryHeader = item.category !== lastCategory;
                      lastCategory = item.category;
                      return (
                        <Fragment key={`item-group-${idx}`}>
                          {showCategoryHeader && (
                            <tr className="bg-slate-100/70 border-y border-slate-200">
                              <td colSpan={4} className="py-2 px-4 text-[10px] font-bold font-mono tracking-wider uppercase text-slate-500">
                                {item.category}
                              </td>
                            </tr>
                          )}
                          <tr className="hover:bg-slate-55/30 transition border-b border-slate-100">
                            <td className="py-3 px-4 font-mono text-slate-600 font-semibold select-all">{item.origin}</td>
                            <td className="py-3 px-4 font-mono text-slate-800 font-semibold select-all">{item.normalized}</td>
                            <td className="py-3 px-4">
                              {item.placeholder !== 'sem placeholder documental' ? (
                                <span className="font-mono text-[11px] bg-blue-50 border border-blue-100 text-blue-750 px-2 py-0.5 rounded font-bold select-all">
                                  {item.placeholder}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic font-medium">
                                  sem placeholder documental
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                item.status === 'configurado' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-150' 
                                  : 'bg-amber-50 text-amber-700 border-amber-150'
                              }`}>
                                {item.status === 'configurado' ? 'configurado' : 'aguardando payload'}
                              </span>
                            </td>
                          </tr>
                        </Fragment>
                      );
                    });
                  })()}
                </tbody>
              </table>
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
