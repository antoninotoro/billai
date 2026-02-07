
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <i className="fas fa-bolt text-white text-xl"></i>
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">BillAI <span className="text-blue-600">Pro</span></span>
        </div>
        <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-500">
          <a href="#" className="hover:text-blue-600 transition-colors">Analizzatore</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Storico</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Confronto Tariffe</a>
        </nav>
        <button className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-all">
          Accedi
        </button>
      </div>
    </header>
  );
};

export default Header;
