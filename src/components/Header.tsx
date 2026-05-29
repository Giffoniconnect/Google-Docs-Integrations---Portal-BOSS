import { FileText, Settings, Shield, User, ExternalLink, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onBackToCentral?: () => void;
  currentPage: string;
}

export default function Header({ onBackToCentral, currentPage }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Left: Branding & Status */}
          <div className="flex items-center space-x-4">
            <div 
              onClick={onBackToCentral}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition-transform group-hover:scale-105">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <span className="font-sans text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  BOSS <span className="text-blue-600 font-medium text-xs bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Giffoni Connect</span>
                </span>
                <p className="text-[10px] font-mono text-slate-400">BUILD: DIGITAL CLIENT ENGINE</p>
              </div>
            </div>

            <div className="hidden h-5 w-[1px] bg-slate-200 sm:block"></div>

            <div className="hidden items-center space-x-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-mono text-slate-500 font-medium">Motor Auxiliar Ativo</span>
            </div>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center space-x-4">
            <a 
              href="https://ais-pre-rhz6adgbzyburidkotjy46-599536317399.us-east1.run.app" 
              className="hidden items-center space-x-1 text-xs text-slate-500 hover:text-blue-600 transition-colors md:flex"
              target="_blank" 
              rel="noreferrer"
            >
              <span>Portal Principal</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            
            <button className="rounded-full p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
              <HelpCircle className="h-4 w-4" />
            </button>

            <button className="rounded-full p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
              <Settings className="h-4 w-4" />
            </button>

            <div className="h-4 w-[1px] bg-slate-200"></div>

            {/* Profile Menu */}
            <div className="flex items-center space-x-2.5 pl-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 ring-2 ring-slate-100">
                <User className="h-4 w-4 text-slate-600" />
              </div>
              <div className="hidden text-left md:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">Giffoni Connect</p>
                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Administrador</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
