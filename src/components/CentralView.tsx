import { useState } from 'react';
import { 
  FileText, 
  Building2, 
  Scale, 
  Users, 
  Search, 
  Plus, 
  ChevronRight, 
  BookOpen,
  Sparkles,
  User,
  SlidersHorizontal,
  FolderLock
} from 'lucide-react';
import { DocCard } from '../types';

interface CentralViewProps {
  onOpenDetail: (card: DocCard) => void;
  onOpenNovaIntegracao: () => void;
}

export default function CentralView({ onOpenDetail, onOpenNovaIntegracao }: CentralViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'development'>('all');

  const cards: DocCard[] = [
    // --- PESSOA FÍSICA ---
    {
      id: 'procuracao-pf',
      category: 'pf',
      title: 'Procuração PF',
      badge: 'PROCURAÇÃO_PF',
      description: 'Automação futura de procurações para pessoas físicas.',
      status: 'active',
      icon: 'FileText',
      route: '/boss-giffoni-clientes/configuracoes/integracoes-google-docs/procuracao-pf'
    },
    {
      id: 'declaracao-pobreza-pf',
      category: 'pf',
      title: 'Declaração de Pobreza PF',
      badge: 'DECLARACAO_POBREZA_PF',
      description: 'Automação futura de declarações de hipossuficiência para pessoa física.',
      status: 'development',
      icon: 'Scale',
      route: '/boss-giffoni-clientes/configuracoes/integracoes-google-docs/declaracao-pobreza-pf'
    },
    {
      id: 'contrato-honorarios-pf',
      category: 'pf',
      title: 'Contrato de Honorários PF',
      badge: 'CONTRATO_HONORARIOS_PF',
      description: 'Automação futura de contratos de prestação de serviços advocatícios PF.',
      status: 'development',
      icon: 'Scale',
      route: '/boss-giffoni-clientes/configuracoes/integracoes-google-docs/contrato-honorarios-pf'
    },
    {
      id: 'primeiro-atendimento-pf',
      category: 'pf',
      title: '1º Atendimento PF',
      badge: 'PRIMEIRO_ATENDIMENTO_PF',
      description: 'Automação futura da ficha de entrevista e 1º atendimento PF.',
      status: 'development',
      icon: 'Users',
      route: '/boss-giffoni-clientes/configuracoes/integracoes-google-docs/primeiro-atendimento-pf'
    },

    // --- PESSOA JURÍDICA ---
    {
      id: 'procuracao-pj',
      category: 'pj',
      title: 'Procuração PJ',
      badge: 'PROCURAÇÃO_PJ',
      description: 'Automação futura de procurações para pessoas jurídicas.',
      status: 'development',
      icon: 'Building2',
      route: '/boss-giffoni-clientes/configuracoes/integracoes-google-docs/procuracao-pj'
    },
    {
      id: 'declaracao-pobreza-pj',
      category: 'pj',
      title: 'Declaração de Pobreza PJ',
      badge: 'DECLARACAO_POBREZA_PJ',
      description: 'Automação futura de declarações de hipossuficiência para pessoa jurídica.',
      status: 'development',
      icon: 'Scale',
      route: '/boss-giffoni-clientes/configuracoes/integracoes-google-docs/declaracao-pobreza-pj'
    },
    {
      id: 'contrato-honorarios-pj',
      category: 'pj',
      title: 'Contrato de Honorários PJ',
      badge: 'CONTRATO_HONORARIOS_PJ',
      description: 'Automação futura de contratos de prestação de serviços advocatícios PJ.',
      status: 'development',
      icon: 'Scale',
      route: '/boss-giffoni-clientes/configuracoes/integracoes-google-docs/contrato-honorarios-pj'
    },
    {
      id: 'primeiro-atendimento-pj',
      category: 'pj',
      title: '1º Atendimento PJ',
      badge: 'PRIMEIRO_ATENDIMENTO_PJ',
      description: 'Automação futura do documento de primeiro atendimento corporativo PJ.',
      status: 'development',
      icon: 'Users',
      route: '/boss-giffoni-clientes/configuracoes/integracoes-google-docs/primeiro-atendimento-pj'
    }
  ];

  // Filter cards based on search & state filter
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          card.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : card.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pfCards = filteredCards.filter(c => c.category === 'pf');
  const pjCards = filteredCards.filter(c => c.category === 'pj');

  const getIcon = (iconName: string, isActive: boolean) => {
    const strokeWidth = 2;
    const colorClass = isActive ? 'text-blue-600' : 'text-slate-500';
    switch (iconName) {
      case 'FileText': return <FileText className={`h-5 w-5 ${colorClass}`} strokeWidth={strokeWidth} />;
      case 'Building2': return <Building2 className={`h-5 w-5 ${colorClass}`} strokeWidth={strokeWidth} />;
      case 'Scale': return <Scale className={`h-5 w-5 ${colorClass}`} strokeWidth={strokeWidth} />;
      case 'Users': return <Users className={`h-5 w-5 ${colorClass}`} strokeWidth={strokeWidth} />;
      default: return <FileText className={`h-5 w-5 ${colorClass}`} strokeWidth={strokeWidth} />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Jumbotron Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-slate-705 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-5">
          <BookOpen className="h-64 w-64 text-white" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase font-mono">
                Módulo Auxiliar (Portal BOSS Clientes)
              </span>
              <span className="bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-mono">Build 2026</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-slate-50">
              Google Docs Integrations
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed font-sans font-normal">
              Motor documental auxiliar do Portal BOSS Clientes para gerenciamento futuro de templates, placeholders e documentos automatizados.
            </p>
          </div>

          <div className="shrink-0">
            <button 
              onClick={onOpenNovaIntegracao}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-750 active:scale-95 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg transition-all border border-blue-500 hover:shadow-cyan-500/10 cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Nova Integração</span>
            </button>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-700/50 max-w-lg">
          <div>
            <p className="text-[10px] text-slate-400 font-mono uppercase">Total de Modelos</p>
            <p className="text-xl font-bold font-mono text-slate-100">{cards.length}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono uppercase">Modelos em Dev</p>
            <p className="text-xl font-bold font-mono text-amber-400">{cards.filter(c => c.status === 'development').length}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono uppercase">Integração Google</p>
            <p className="text-xs font-bold font-mono text-slate-400 mt-1 flex items-center gap-1.5">
              Estática (Sandbox) <span className="h-2 w-2 rounded-full bg-slate-400"></span>
            </p>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-800">Motor de Automação de Documentos</span>
            <span className="bg-slate-150 text-slate-600 font-mono text-xs px-2 py-0.5 rounded-md font-bold">
              {filteredCards.length} {filteredCards.length === 1 ? 'template' : 'templates'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por nome ou slug..."
                className="w-full sm:w-60 pl-9 pr-4 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Status filters */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 self-start sm:self-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${statusFilter === 'all' ? 'bg-white shadow-xs text-slate-800 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${statusFilter === 'active' ? 'bg-white shadow-xs text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Ativas
              </button>
              <button
                onClick={() => setStatusFilter('development')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${statusFilter === 'development' ? 'bg-white shadow-xs text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Em Dev
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Sections (Categories Container) */}
      <div className="space-y-10">
        
        {/* SECTION 1: AUTOMAÇÕES PESSOA FÍSICA */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 pb-2 border-b border-slate-200">
            <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <User className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Automações Pessoa Física (PF)</h2>
              <p className="text-xs text-slate-500">Mapeadores de templates e variáveis direcionados a clientes individuais da BOSS.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pfCards.length > 0 ? (
              pfCards.map((card) => {
                const isActive = card.status === 'active';
                return (
                  <div 
                    key={card.id}
                    className={`group relative flex flex-col justify-between bg-white rounded-xl border p-4 transition-all duration-200 shadow-xs hover:shadow-md ${
                      isActive 
                        ? 'border-slate-200 hover:border-blue-400' 
                        : 'border-slate-150 bg-slate-50/20 opacity-85 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Card Header: Icon & Badge */}
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2.5 rounded-lg ${isActive ? 'bg-blue-50 border border-blue-100' : 'bg-slate-100 border border-slate-200/50'}`}>
                          {getIcon(card.icon, isActive)}
                        </div>
                        <div>
                          {isActive ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="h-1.5 w-1.5 mr-1 rounded-full bg-emerald-500"></span>
                              Ativa
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/55 font-mono">
                              Em Dev
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          <h3 className="font-sans font-bold text-slate-800 text-xs tracking-tight group-hover:text-blue-600 transition-colors">
                            {card.title}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-55 px-1 py-0.2 rounded-sm select-none">
                        PF
                      </span>
                      <button
                        onClick={() => onOpenDetail(card)}
                        className={`inline-flex items-center space-x-1 text-[11px] font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 border border-slate-200/50'
                        }`}
                      >
                        <span>Abrir</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-8 text-center text-xs text-slate-400 bg-slate-50/20 rounded-xl border border-dashed border-slate-200">
                Nenhum template de Pessoa Física atende aos filtros atuais.
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: AUTOMAÇÕES PESSOA JURÍDICA */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 pb-2 border-b border-slate-200">
            <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Building2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Automações Pessoa Jurídica (PJ)</h2>
              <p className="text-xs text-slate-500">Mapeadores de templates e fluxos documentais para empresas, sócios e holdings corporativas.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pjCards.length > 0 ? (
              pjCards.map((card) => {
                const isActive = card.status === 'active';
                return (
                  <div 
                    key={card.id}
                    className={`group relative flex flex-col justify-between bg-white rounded-xl border p-4 transition-all duration-200 shadow-xs hover:shadow-md ${
                      isActive 
                        ? 'border-slate-200 hover:border-blue-400' 
                        : 'border-slate-150 bg-slate-50/20 opacity-85 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Card Header: Icon & Badge */}
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2.5 rounded-lg ${isActive ? 'bg-blue-50 border border-blue-100' : 'bg-slate-100 border border-slate-200/50'}`}>
                          {getIcon(card.icon, isActive)}
                        </div>
                        <div>
                          {isActive ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="h-1.5 w-1.5 mr-1 rounded-full bg-emerald-500"></span>
                              Ativa
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/55 font-mono">
                              Em Dev
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          <h3 className="font-sans font-bold text-slate-800 text-xs tracking-tight group-hover:text-blue-600 transition-colors">
                            {card.title}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                          {card.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-55 px-1 py-0.2 rounded-sm select-none">
                        PJ
                      </span>
                      <button
                        onClick={() => onOpenDetail(card)}
                        className={`inline-flex items-center space-x-1 text-[11px] font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 border border-slate-200/50'
                        }`}
                      >
                        <span>Abrir</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-8 text-center text-xs text-slate-400 bg-slate-50/20 rounded-xl border border-dashed border-slate-200">
                Nenhum template de Pessoa Jurídica atende aos filtros atuais.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Info Static Notice */}
      <div className="rounded-xl border border-slate-200 bg-amber-50/25 p-4.5">
        <div className="flex space-x-3">
          <FolderLock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Visualização de Segurança & Diagnóstico</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
              O motor documental auxiliar <strong>Google Docs Integrations</strong> oferece suporte estático completo a rotas com URLs amigáveis. Todas as telas de mapeamento foram otimizadas de forma 100% isolada, com integridade certificada para o Portal BOSS Clientes da Giffoni Connect.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
