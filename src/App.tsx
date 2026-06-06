import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import CentralView from './components/CentralView';
import DocDetailView from './components/DocDetailView';
import AutomacaoConfigView from './components/AutomacaoConfigView';
import PortalBossConfigView from './components/PortalBossConfigView';
import NovaIntegracaoModal from './components/NovaIntegracaoModal';
import { DocCard } from './types';

export const CARDS: DocCard[] = [
  // --- PESSOA FÍSICA ---
  {
    id: 'procuracao-pf',
    category: 'pf',
    title: 'Procuração PF',
    badge: 'PROCURAÇÃO_PF',
    description: 'Automação futura de procurações para pessoas físicas.',
    status: 'active',
    icon: 'FileText',
    route: '/automacao-procuracao-pf',
    configRoute: '/automacao-procuracao-pf/configuracao-da-procuracao-pf',
    documentType: 'procuracao_pf'
  },
  {
    id: 'declaracao-pobreza-pf',
    category: 'pf',
    title: 'Declaração de Pobreza PF',
    badge: 'DECLARACAO_POBREZA_PF',
    description: 'Automação futura de declarações de hipossuficiência para pessoa física.',
    status: 'development',
    icon: 'Scale',
    route: '/automacao-declaracao-pobreza-pf',
    configRoute: '/automacao-declaracao-pobreza-pf/configuracao-da-declaracao-pobreza-pf',
    documentType: 'declaracao_pobreza_pf'
  },
  {
    id: 'contrato-honorarios-pf',
    category: 'pf',
    title: 'Contrato de Honorários PF',
    badge: 'CONTRATO_HONORARIOS_PF',
    description: 'Automação futura de contratos de prestação de serviços advocatícios PF.',
    status: 'development',
    icon: 'Scale',
    route: '/automacao-contrato-honorarios-pf',
    configRoute: '/automacao-contrato-honorarios-pf/configuracao-do-contrato-honorarios-pf',
    documentType: 'contrato_honorarios_pf'
  },
  {
    id: 'primeiro-atendimento-pf',
    category: 'pf',
    title: '1º Atendimento PF',
    badge: 'PRIMEIRO_ATENDIMENTO_PF',
    description: 'Automação futura da ficha de entrevista e 1º atendimento PF.',
    status: 'development',
    icon: 'Users',
    route: '/automacao-primeiro-atendimento-pf',
    configRoute: '/automacao-primeiro-atendimento-pf/configuracao-do-primeiro-atendimento-pf',
    documentType: 'primeiro_atendimento_pf'
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
    route: '/automacao-procuracao-pj',
    configRoute: '/automacao-procuracao-pj/configuracao-da-procuracao-pj',
    documentType: 'procuracao_pj'
  },
  {
    id: 'declaracao-pobreza-pj',
    category: 'pj',
    title: 'Declaração de Pobreza PJ',
    badge: 'DECLARACAO_POBREZA_PJ',
    description: 'Automação futura de declarações de hipossuficiência para pessoa jurídica.',
    status: 'development',
    icon: 'Scale',
    route: '/automacao-declaracao-pobreza-pj',
    configRoute: '/automacao-declaracao-pobreza-pj/configuracao-da-declaracao-pobreza-pj',
    documentType: 'declaracao_pobreza_pj'
  },
  {
    id: 'contrato-honorarios-pj',
    category: 'pj',
    title: 'Contrato de Honorários PJ',
    badge: 'CONTRATO_HONORARIOS_PJ',
    description: 'Automação futura de contratos de prestação de serviços advocatícios PJ.',
    status: 'development',
    icon: 'Scale',
    route: '/automacao-contrato-honorarios-pj',
    configRoute: '/automacao-contrato-honorarios-pj/configuracao-do-contrato-honorarios-pj',
    documentType: 'contrato_honorarios_pj'
  },
  {
    id: 'primeiro-atendimento-pj',
    category: 'pj',
    title: '1º Atendimento PJ',
    badge: 'PRIMEIRO_ATENDIMENTO_PJ',
    description: 'Automação futura do documento de primeiro atendimento corporativo PJ.',
    status: 'development',
    icon: 'Users',
    route: '/automacao-primeiro-atendimento-pj',
    configRoute: '/automacao-primeiro-atendimento-pj/configuracao-do-primeiro-atendimento-pj',
    documentType: 'primeiro_atendimento_pj'
  }
];

function PrimaryApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNovaIntegracaoOpen, setIsNovaIntegracaoOpen] = useState(false);

  // Determine current page state for header display
  const isCentral = location.pathname === '/';
  const currentPage = isCentral ? 'central' : 'detail';

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Header component */}
      <Header 
        currentPage={currentPage} 
        onBackToCentral={() => navigate('/')} 
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route 
            path="/" 
            element={
              <CentralView 
                onOpenDetail={(card) => navigate(card.route)} 
                onOpenNovaIntegracao={() => setIsNovaIntegracaoOpen(true)}
              />
            } 
          />

          {/* Configuration Routing per GDI Card */}
          <Route path="/automacao-procuracao-pf" element={<DocDetailView card={CARDS[0]} onBack={() => navigate('/')} />} />
          <Route path="/automacao-declaracao-pobreza-pf" element={<DocDetailView card={CARDS[1]} onBack={() => navigate('/')} />} />
          <Route path="/automacao-contrato-honorarios-pf" element={<DocDetailView card={CARDS[2]} onBack={() => navigate('/')} />} />
          <Route path="/automacao-primeiro-atendimento-pf" element={<DocDetailView card={CARDS[3]} onBack={() => navigate('/')} />} />

          <Route path="/automacao-procuracao-pj" element={<DocDetailView card={CARDS[4]} onBack={() => navigate('/')} />} />
          <Route path="/automacao-declaracao-pobreza-pj" element={<DocDetailView card={CARDS[5]} onBack={() => navigate('/')} />} />
          <Route path="/automacao-contrato-honorarios-pj" element={<DocDetailView card={CARDS[6]} onBack={() => navigate('/')} />} />
          <Route path="/automacao-primeiro-atendimento-pj" element={<DocDetailView card={CARDS[7]} onBack={() => navigate('/')} />} />

          {/* Subrotas de Configuração das Automações */}
          <Route path="/automacao-procuracao-pf/configuracao-da-procuracao-pf" element={<AutomacaoConfigView card={CARDS[0]} onBackToAutomacao={() => navigate(CARDS[0].route)} onBackToCentral={() => navigate('/')} />} />
          <Route path="/automacao-declaracao-pobreza-pf/configuracao-da-declaracao-pobreza-pf" element={<AutomacaoConfigView card={CARDS[1]} onBackToAutomacao={() => navigate(CARDS[1].route)} onBackToCentral={() => navigate('/')} />} />
          <Route path="/automacao-contrato-honorarios-pf/configuracao-do-contrato-honorarios-pf" element={<AutomacaoConfigView card={CARDS[2]} onBackToAutomacao={() => navigate(CARDS[2].route)} onBackToCentral={() => navigate('/')} />} />
          <Route path="/automacao-primeiro-atendimento-pf/configuracao-do-primeiro-atendimento-pf" element={<AutomacaoConfigView card={CARDS[3]} onBackToAutomacao={() => navigate(CARDS[3].route)} onBackToCentral={() => navigate('/')} />} />

          <Route path="/automacao-procuracao-pj/configuracao-da-procuracao-pj" element={<AutomacaoConfigView card={CARDS[4]} onBackToAutomacao={() => navigate(CARDS[4].route)} onBackToCentral={() => navigate('/')} />} />
          <Route path="/automacao-declaracao-pobreza-pj/configuracao-da-declaracao-pobreza-pj" element={<AutomacaoConfigView card={CARDS[5]} onBackToAutomacao={() => navigate(CARDS[5].route)} onBackToCentral={() => navigate('/')} />} />
          <Route path="/automacao-contrato-honorarios-pj/configuracao-do-contrato-honorarios-pj" element={<AutomacaoConfigView card={CARDS[6]} onBackToAutomacao={() => navigate(CARDS[6].route)} onBackToCentral={() => navigate('/')} />} />
          <Route path="/automacao-primeiro-atendimento-pj/configuracao-do-primeiro-atendimento-pj" element={<AutomacaoConfigView card={CARDS[7]} onBackToAutomacao={() => navigate(CARDS[7].route)} onBackToCentral={() => navigate('/')} />} />
          <Route path="/boss-giffoni-clientes/configuracoes/integracoes-google-docs" element={<PortalBossConfigView />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-sans">
          <div>
            <p className="font-semibold text-slate-500">
              Plataforma BOSS — Giffoni Connect
            </p>
            <p className="mt-0.5 font-medium">Motor Documental Auxiliar • GDocs & Google Drive Engine</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5 font-sans">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Modo Convidado Ativo
            </span>
            <span className="font-mono">Estável (2026)</span>
          </div>
        </div>
      </footer>

      {/* Auxiliary dummy modal */}
      <NovaIntegracaoModal 
        isOpen={isNovaIntegracaoOpen} 
        onClose={() => setIsNovaIntegracaoOpen(false)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PrimaryApp />
    </BrowserRouter>
  );
}
