import React from 'react';
import { Home, BarChart2, Plus, Wallet, Settings } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavigationProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onNavigate }) => {
  // Helper to determine if a tab is active
  const isActive = (view: ViewState) => currentView === view;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-charcoal border-t border-gray-200 dark:border-gray-800 px-6 py-2 z-50">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Home */}
        <button 
          onClick={() => onNavigate(ViewState.PORTFOLIO)}
          className={`flex flex-col items-center justify-center w-10 h-10 transition-colors ${
            isActive(ViewState.PORTFOLIO) ? 'text-primary' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Home className="w-6 h-6" strokeWidth={isActive(ViewState.PORTFOLIO) ? 2.5 : 2} />
        </button>

        {/* Strategy / Candlesticks */}
        <button 
          onClick={() => onNavigate(ViewState.STRATEGY_DETAILS)}
          className={`flex flex-col items-center justify-center w-10 h-10 transition-colors ${
            isActive(ViewState.STRATEGY_DETAILS) ? 'text-primary' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <BarChart2 className="w-6 h-6" strokeWidth={isActive(ViewState.STRATEGY_DETAILS) ? 2.5 : 2} />
        </button>

        {/* Add / Deploy (Center) */}
        <button 
          onClick={() => onNavigate(ViewState.CONFIGURATION)}
          className=""
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(13,89,242,0.5)] transition-transform active:scale-95 ${
            isActive(ViewState.CONFIGURATION) 
              ? 'bg-primary text-white' 
              : 'bg-primary text-white hover:bg-blue-600'
          }`}>
            <Plus className="w-6 h-6" strokeWidth={3} />
          </div>
        </button>

        {/* Wallet (Placeholder) */}
        <button 
          className="flex flex-col items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <Wallet className="w-6 h-6" strokeWidth={2} />
        </button>

        {/* Settings (Placeholder) */}
        <button 
          className="flex flex-col items-center justify-center w-10 h-10 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <Settings className="w-6 h-6" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;
