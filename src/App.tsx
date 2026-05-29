import { useState } from 'react';
import Header from './components/Header';
import CentralView from './components/CentralView';
import DocDetailView from './components/DocDetailView';
import NovaIntegracaoModal from './components/NovaIntegracaoModal';
import { Page, DocCard } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('central');
  const [selectedCard, setSelectedCard] = useState<DocCard | null>(null);
  const [isNovaIntegracaoOpen, setIsNovaIntegracaoOpen] = useState(false);

  const handleOpenDetail = (card: DocCard) => {
    setSelectedCard(card);
    setCurrentPage('detail');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Header component */}
      <Header 
        currentPage={currentPage} 
        onBackToCentral={() => {
          setCurrentPage('central');
          setSelectedCard(null);
        }} 
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {currentPage === 'central' ? (
          <CentralView 
            onOpenDetail={handleOpenDetail} 
            onOpenNovaIntegracao={() => setIsNovaIntegracaoOpen(true)}
          />
        ) : (
          selectedCard && (
            <DocDetailView 
              card={selectedCard}
              onBack={() => {
                setCurrentPage('central');
                setSelectedCard(null);
              }} 
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <p className="font-semibold text-slate-500 font-sans">
              Plataforma BOSS — Giffoni Connect
            </p>
            <p className="mt-0.5">Motor Documental Auxiliar • Design & Validation Sandbox</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Modo Convidado Ativo
            </span>
            <span>Estável (2026)</span>
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
