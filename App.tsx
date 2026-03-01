import React, { useState, useMemo, useEffect } from 'react';
import { ViewState, PortfolioChartDataPoint } from './types';
import PortfolioView from './components/PortfolioView';
import StrategyDetailView from './components/StrategyDetailView';
import ConfigurationView from './components/ConfigurationView';
import BottomNavigation from './components/BottomNavigation';
import LoadingScreen from './components/LoadingScreen';
import { AnimatePresence, motion } from 'framer-motion';

const generateChartData = (target: number): PortfolioChartDataPoint[] => {
  const data: PortfolioChartDataPoint[] = [];
  const days = 30;
  const now = new Date();
  const targetBalance = target;
  let currentBalance = targetBalance;

  // We generate data backwards from today to ensure the final value matches current balance exactly
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    data.push({
      timestamp: date.getTime(),
      balance: Number(currentBalance.toFixed(2))
    });

    // To go back in time, we subtract the "daily change"
    // The prompt specifies a random increment between -2 and +10 for forward movement
    // So for backward movement: prevBalance = currentBalance - change
    const dailyChange = Math.random() * (20 - (-12)) + (-5); 
    currentBalance -= dailyChange;
  }

  return data.reverse();
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.PORTFOLIO);
  const [balance, setBalance] = useState(509.81);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Memoize data to prevent regeneration on re-renders unless balance changes
  const chartData = useMemo(() => generateChartData(balance), [balance]);

  const navigateTo = (view: ViewState) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-300">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoadingScreen />
          </motion.div>
        ) : (
          <motion.div 
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto min-h-screen shadow-2xl relative overflow-hidden bg-background-light dark:bg-background-dark"
          >
            {currentView === ViewState.PORTFOLIO && (
              <PortfolioView 
                balance={balance}
                chartData={chartData}
                onNavigateDetails={() => navigateTo(ViewState.STRATEGY_DETAILS)} 
              />
            )}
            {currentView === ViewState.STRATEGY_DETAILS && (
              <StrategyDetailView 
                onBack={() => navigateTo(ViewState.PORTFOLIO)} 
                onNavigateConfig={() => navigateTo(ViewState.CONFIGURATION)}
                chartData={chartData}
              />
            )}
            {currentView === ViewState.CONFIGURATION && (
              <ConfigurationView onBack={() => navigateTo(ViewState.STRATEGY_DETAILS)} />
            )}
            
            <BottomNavigation currentView={currentView} onNavigate={navigateTo} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;