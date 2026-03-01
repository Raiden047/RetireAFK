import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Menu, 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  ArrowDown, 
  ArrowUp, 
  ArrowLeftRight, 
  ChevronRight, 
  Plus 
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, MouseHandlerDataParam } from 'recharts';
import { motion, Variants, useSpring, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { PortfolioChartDataPoint } from '../types';

interface PortfolioViewProps {
  onNavigateDetails: () => void;
  balance: number;
  chartData: PortfolioChartDataPoint[];
}

const strategies = [
  {
    id: '1',
    name: 'Correlation Alpha',
    description: 'High-frequency arbitrage bot trading BTC/ETH pairs.',
    yield: '+12.4%',
    vol: '$1.2M',
    rebalance: '14m',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCU3wb0JGjnGu6HiQkFo0bk__go6IedWuyqO_aveQPfskQccuLdgWWzXPigH8Ou2howWOyz7V8fCx_P-rvHaUTInOnKZJwVtbIpUNWkklVEgbKXFfl4p0GRwIL6X0rfKyiB3tybhg54EpA9LC-x47nvJQL7vvMO28i5Y2ksGP1pUJXrFJQXaUxSP1AiC6R_yavBQPhISCfz_QQeycWwEJyqUCDsCEhpti_cbP1gq9HgaszgyRAyr--nHTDNWF06TpR5fOIW4TRN-lc'
  },
  {
    id: '2',
    name: 'Mean Reversion',
    description: 'Statistical arbitrage on oversold SOL pairs.',
    yield: '+8.2%',
    vol: '$850k',
    rebalance: '1h',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFvXL8MVT8oug3kezrs6fTPEmIqeK-O3Fi-tstYPgGV6BneqwCx3Ff6W2VfGwmrwy54CG5OH4LDNm-kx1186cJDaBEjslOdgO5atWY9jWBMWn_IHF50NEuAj6Lu0__c0jQIdOAc5-Uj7CzZ9w0RTit_HSgrG9C_WzU-pAMDAXOT7AZByVWDHNdJ23Fh1bqCg08gi_6Q7oRPzul-1DHN3FOFuBnaRvT4pLfSChPPm0APRIDHH_BT3ssvC9cEbOfB6kuHl5ru4LFvn8'
  }
];

const AnimatedCounter: React.FC<{ target: number }> = ({ target }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const value = useMotionValue(target * 0.95);
  const springValue = useSpring(value, { 
    damping: 30, 
    stiffness: 100,
    mass: 1 
  });

  useEffect(() => {
    value.set(target);
  }, [target, value]);

  useMotionValueEvent(springValue, "change", (latest) => {
    if (ref.current) {
      ref.current.textContent = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(latest);
    }
  });

  const initialFormatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(target * 0.95);

  return <h1 ref={ref} className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">{initialFormatted}</h1>;
};

const StrategySkeleton = () => (
  <div className="bg-white dark:bg-charcoal rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-800 relative overflow-hidden">
     <div className="animate-pulse">
        <div className="flex gap-4 items-start mb-4">
           <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0"></div>
           <div className="flex-1 pt-1">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3"></div>
              <div className="flex gap-2">
                 <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                 <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
           </div>
        </div>
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
     </div>
  </div>
);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 70,
      damping: 15
    }
  }
};

const PortfolioView: React.FC<PortfolioViewProps> = ({ onNavigateDetails, balance, chartData }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredData, setHoveredData] = useState<PortfolioChartDataPoint | null>(null);

  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipIndex, setTooltipIndex] = useState(chartData.length - 1);
  const [isAnimating, setIsAnimating] = useState(true);
  const [splitOffset, setSplitOffset] = useState(1);
  const animationDuration = 1500; // Match this to your animation duration in ms

  
  // Calculate percentage change for the full chart duration (Start of month/period to now)
  // Dynamic based on hovered data
  const percentageChange = useMemo(() => {
    if (chartData.length < 2) return 0;
    const startBalance = chartData[0].balance;
    const currentBalance = hoveredData ? hoveredData.balance : chartData[chartData.length - 1].balance;
    return ((currentBalance - startBalance) / startBalance) * 100;
  }, [chartData, hoveredData]);

  const netChange = useMemo(() => {
    if (chartData.length < 2) return 0;
    const startBalance = chartData[0].balance;
    const currentBalance = hoveredData ? hoveredData.balance : chartData[chartData.length - 1].balance;
    return currentBalance - startBalance;
  }, [chartData, hoveredData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, animationDuration);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-charcoal transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold">Portfolio</h2>
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-charcoal transition-colors relative">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-background-light dark:border-background-dark"></span>
        </button>
      </header>

      <main className="flex-1 flex flex-col pt-6">
        {/* Total Balance with Animation */}
        <div className="px-6 flex flex-col items-center mb-6">
          <p className="text-gray-500 dark:text-gray-400 text-xs font-bold tracking-wide uppercase mb-2">
            {hoveredData 
              ? new Date(hoveredData.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
              : 'Total Balance'
            }
          </p>
          
          <div className={hoveredData ? 'hidden' : 'block'}>
            <AnimatedCounter target={balance} />
          </div>
          <div className={hoveredData ? 'block' : 'hidden'}>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(hoveredData ? hoveredData.balance : balance)}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold ${netChange >= 0 ? 'text-secondary' : 'text-danger'}`}>
              {netChange > 0 ? '+' : ''}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(netChange)}
            </span>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${percentageChange >= 0 ? 'bg-secondary/10' : 'bg-danger/10'}`}>
              {percentageChange >= 0 ? (
                <TrendingUp className="w-4 h-4 text-secondary" />
              ) : (
                <TrendingDown className="w-4 h-4 text-danger" />
              )}
              <span className={`text-sm font-bold ${percentageChange >= 0 ? 'text-secondary' : 'text-danger'}`}>
                {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-48 w-full mb-4 relative touch-none select-none outline-none px-1" style={{ WebkitTapHighlightColor: 'transparent' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-transparent to-transparent z-10 pointer-events-none h-full" />
          <ResponsiveContainer width="100%" height="100%" style={{ pointerEvents: isAnimating ? 'none' : 'auto', outline: 'none' }}>
            <AreaChart
              style={{outline: 'none'}} 
              data={chartData} 
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              onTouchMove={(mouseEventData: MouseHandlerDataParam) => {
                setHoveredData(chartData[mouseEventData.activeIndex]);
                if (mouseEventData.activeTooltipIndex !== undefined && mouseEventData.activeTooltipIndex !== null && chartData.length > 1) {
                  const offset = parseInt(mouseEventData.activeTooltipIndex.toString()) / (chartData.length - 1);
                  setSplitOffset(offset);
                }
              }}
              onTouchEnd={() => {
                setHoveredData(null);
                setSplitOffset(1);
              }}
              onMouseMove={(mouseEventData: MouseHandlerDataParam) => {
                setHoveredData(chartData[mouseEventData.activeIndex]);
                if (mouseEventData.activeTooltipIndex !== undefined && mouseEventData.activeTooltipIndex !== null && chartData.length > 1) {
                  const offset = parseInt(mouseEventData.activeTooltipIndex.toString()) / (chartData.length - 1);
                  setSplitOffset(offset);
                }
              }}
              onMouseLeave={() => {
                setHoveredData(null);
                setSplitOffset(1);
              }}
            >
              <defs>
                <linearGradient id="fillBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2979ff" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2979ff" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="fillGrey" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#52525b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#52525b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="splitStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset={splitOffset} stopColor="#2979ff" />
                  <stop offset={splitOffset} stopColor="#52525b" />
                </linearGradient>
                <clipPath id="leftClip" clipPathUnits="objectBoundingBox">
                  <rect x="0" y="0" width={splitOffset} height="1" />
                </clipPath>
                <clipPath id="rightClip" clipPathUnits="objectBoundingBox">
                  <rect x={splitOffset} y="0" width={1 - splitOffset} height="1" />
                </clipPath>
              </defs>
              <Area
                type="monotone" 
                dataKey="balance" 
                stroke="none" 
                fill="url(#fillBlue)" 
                fillOpacity={1}
                clipPath="url(#leftClip)"
                isAnimationActive={isAnimating}
                animationDuration={animationDuration} 
              />
              <Area
                type="monotone" 
                dataKey="balance" 
                stroke="none" 
                fill="url(#fillGrey)" 
                fillOpacity={1}
                clipPath="url(#rightClip)"
                isAnimationActive={isAnimating}
                animationDuration={animationDuration} 
              />
              <Area
                type="monotone" 
                dataKey="balance" 
                stroke="url(#splitStroke)" 
                strokeWidth={3} 
                fill="none"
                dot={false} 
                activeDot={hoveredData ? { r: 6, strokeWidth: 2, stroke: '#fff' } : false}
                isAnimationActive={true}
                animationDuration={animationDuration} 
              />
              <Tooltip
                content={() => null}
                cursor={hoveredData ? { stroke: '#2979ff', strokeWidth: 1 } : false} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Timeframe Selector */}
        <div className="px-6 mb-6 flex justify-center">
          <div className="flex w-full max-w-[320px] bg-charcoal rounded-full p-1.5 shadow-inner">
            {['Day', 'Week', 'Month', 'Year'].map((tf, i) => (
              <button 
                key={tf}
                className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-all ${
                  tf === 'Month' 
                    ? 'text-neon-blue bg-neon-blue/10 border border-neon-blue/40 shadow-[0_0_10px_rgba(41,121,255,0.15)] font-bold' 
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 px-4 mb-8">
          {[
            { icon: ArrowDown, label: 'Deposit' },
            { icon: ArrowUp, label: 'Send' },
            { icon: ArrowLeftRight, label: 'Swap' },
          ].map((action) => (
            <button key={action.label} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-full bg-charcoal border border-gray-700 flex items-center justify-center shadow-lg group-hover:border-primary transition-all">
                <action.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-medium text-gray-400">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Active Strategies */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-bold">Active Strategies</h3>
            <span className="text-primary text-sm font-medium hover:text-white cursor-pointer transition-colors">See all</span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <StrategySkeleton key={i} />
              ))}
            </div>
          ) : (
            <motion.div 
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {strategies.map((strategy) => (
                <motion.div 
                  key={strategy.id}
                  variants={itemVariants}
                  className="bg-white dark:bg-charcoal rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-800 relative overflow-hidden"
                >
                  <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                    </div>
                    <span className="text-xs font-bold text-secondary tracking-wide uppercase">Active</span>
                  </div>

                  <div className="flex gap-4 items-start relative z-0 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-800 to-black overflow-hidden border border-gray-700 shadow-md shrink-0">
                       <img src={strategy.image} alt={strategy.name} className="w-full h-full object-cover opacity-80" />
                    </div>
                    <div className="flex-1 pr-10">
                      <h4 className="font-bold text-base mb-1">{strategy.name}</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-3">
                        {strategy.description}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="bg-secondary/10 px-2 py-0.5 rounded text-xs font-bold text-secondary border border-secondary/20">
                          {strategy.yield} Yield
                        </div>
                        <span className="text-xs text-gray-500">24h Vol: {strategy.vol}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-400">Next rebalance: {strategy.rebalance}</span>
                    <button 
                      onClick={onNavigateDetails}
                      className="text-sm font-bold text-primary hover:text-blue-400 transition-colors flex items-center gap-0.5"
                    >
                      Manage <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PortfolioView;