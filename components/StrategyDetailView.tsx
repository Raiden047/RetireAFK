import React, { useState, useRef, useEffect, useMemo  } from 'react';
import { 
  ArrowLeft, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Cell, Tooltip, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import Skeleton from 'react-loading-skeleton';
import { PortfolioChartDataPoint } from '../types';

interface StrategyDetailViewProps {
  onBack: () => void;
  onNavigateConfig: () => void;
  chartData: PortfolioChartDataPoint[];
}

const positions = [
  {
    name: 'Solana',
    amount: '342.5 SOL',
    price: '$145.20',
    change: 2.4,
    icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFvXL8MVT8oug3kezrs6fTPEmIqeK-O3Fi-tstYPgGV6BneqwCx3Ff6W2VfGwmrwy54CG5OH4LDNm-kx1186cJDaBEjslOdgO5atWY9jWBMWn_IHF50NEuAj6Lu0__c0jQIdOAc5-Uj7CzZ9w0RTit_HSgrG9C_WzU-pAMDAXOT7AZByVWDHNdJ23Fh1bqCg08gi_6Q7oRPzul-1DHN3FOFuBnaRvT4pLfSChPPm0APRIDHH_BT3ssvC9cEbOfB6kuHl5ru4LFvn8'
  },
  {
    name: 'Ethereum',
    amount: '12.4 ETH',
    price: '$3,450.00',
    change: -0.5,
    icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYVNLNtLudw4UOzIZeCtFHuds18vH-OUaBWfl5rGrXViBVZwxj_fJ1YQUV3u_McSokKPzoVnOFtc9n2g1iApLXNr98WNfUjILeIrVtNqzlPKZyuipjPh5tH2wMZ8T0T5czREur1cdDiA8XDZ1OtWmAixNILCcsghDdJIDNEh8eSpweUh3kiXPKCBzmc2jrkEcIdHd4heamoUw8oPUZmfvEWSqHEu4GCwLkwuSVINe7WAlgDOu4Py9rJalilGYdepvLTGjuKrc1jLU'
  },
  {
    name: 'Bitcoin',
    amount: '0.85 BTC',
    price: '$64,230.00',
    change: 1.2,
    icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoTLqz3Gp7sKszlXhRJcCyJOa_TqpC6rDyORqRcTPzstjT9kx4EpcJy8HN5zp8BNZOXUZJV_qiMihBU2IiTtb2zyIWhUoNtAY1n6XTcI9IbWXP2jszBdp1Zgyt2OydihcUa2est00ttzPDx9U98G5tu9ibiEhIihkIP5dPVkNtB_rfDa_02dGV3lgfU8Skq_HPmcxp6b2vKi7qHKmghC-RqgIxEWBkOQ2J23o9AUCPtF5KQqSCj7DYYe5B3VCIeEhZMnzj7HTsnj8'
  }
];

const renderCustomLabel = (props: any) => {
  const { x, y, width, value } = props;
  const isPositive = value >= 0;
  // Adjust position based on positive/negative to ensure label doesn't overlap bar
  const yPos = isPositive ? y - 12 : y + 20;
  
  return (
    <text 
      x={x + width / 2} 
      y={yPos} 
      fill="#cbd5e1" 
      textAnchor="middle" 
      dominantBaseline="middle"
      className="text-[10px] font-bold"
    >
      {value >= 0 ? '+' : ''}{value}
    </text>
  );
};

const StrategyDetailView: React.FC<StrategyDetailViewProps> = ({ onBack, onNavigateConfig, chartData }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Transform chartData (Balance History) into Weeks Data (Daily PnL)
  const weeksData = useMemo(() => {
    if (!chartData || chartData.length < 2) return [];

    const pnlData = [];
    // chartData is sorted oldest to newest.
    // Calculate PnL: balance[i] - balance[i-1]
    for (let i = 1; i < chartData.length; i++) {
        const pnl = chartData[i].balance - chartData[i-1].balance;
        pnlData.push({
            name: new Date(chartData[i].timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
            value: Number(pnl.toFixed(2)),
            id: `d-${chartData[i].timestamp}`
        });
    }

    // We want the last 28 days (4 weeks * 7 days).
    const sliced = pnlData.slice(-28);
    
    // Group into weeks
    const weeks = [];
    for (let i = 0; i < sliced.length; i += 7) {
        weeks.push(sliced.slice(i, i + 7));
    }
    
    return weeks;
  }, [chartData]);

  const [currentWeekIndex, setCurrentWeekIndex] = useState(Math.max(0, weeksData.length - 1));

  // Sync index if data changes
  useEffect(() => {
    if (weeksData.length > 0) {
       setCurrentWeekIndex(weeksData.length - 1);
    }
  }, [weeksData.length]);

  // Calculate total profit for the currently visible week
  const currentWeekTotal = useMemo(() => {
    if (!weeksData[currentWeekIndex]) return 0;
    return weeksData[currentWeekIndex].reduce((sum, item) => sum + item.value, 0);
  }, [weeksData, currentWeekIndex]);

  // Format currency
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(currentWeekTotal));

  // Calculate Stats (24h PnL and APY) based on Chart Data
  const { pnl24h, apy } = useMemo(() => {
    if (!chartData || chartData.length < 2) {
      return { pnl24h: 0, apy: 0 };
    }
    
    // 24h PnL: Difference between last two data points
    // Assumes daily data points provided in chartData
    const latest = chartData[chartData.length - 1];
    const previous = chartData[chartData.length - 2];
    const pnl = latest.balance - previous.balance;

    // APY Calculation: Simple annualization of the period return
    const start = chartData[0];
    const durationDays = (latest.timestamp - start.timestamp) / (1000 * 3600 * 24);
    
    if (durationDays < 1) return { pnl24h: pnl, apy: 0 };
    
    const totalReturn = (latest.balance - start.balance) / start.balance;
    const annualizedReturn = (totalReturn / durationDays) * 365 * 100;

    return { pnl24h: pnl, apy: annualizedReturn };
  }, [chartData]);

  // Scroll to end on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [weeksData]); // Re-scroll when data is ready

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Increased slightly to show off skeleton
    return () => clearTimeout(timer);
  }, []);

  // Handle scroll to determine active week
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    // Calculate which page index is most visible
    const index = Math.round(scrollLeft / clientWidth);
    
    // Clamp and update
    if (index >= 0 && index < weeksData.length && index !== currentWeekIndex) {
      setCurrentWeekIndex(index);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-charcoal transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold">Correlation Alpha</h2>
        <button onClick={onNavigateConfig} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-charcoal transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 px-4 py-2 pb-24">
        {/* Timeframe Toggles */}
        <div className="bg-slate-200 dark:bg-slate-800/50 rounded-full p-1 mb-6 flex">
          {['1D', '1W', '1M', '3M', '1Y'].map((tf) => (
            <button 
              key={tf} 
              className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-colors ${
                tf === '1W' 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart Card */}
        <div className="bg-white dark:bg-[#151a26] rounded-[24px] p-6 mb-6 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
          {isLoading ? (
             <div className="flex flex-col h-full">
                <div className="mb-4">
                  <Skeleton width={80} height={12} baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)" className="mb-2" />
                  <Skeleton width={180} height={40} baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)" borderRadius="0.5rem" />
                </div>
                <div className="h-56 flex items-end justify-between gap-3 px-2">
                   {[...Array(7)].map((_, i) => (
                      <div key={i} className="w-full h-full flex items-end">
                         <Skeleton 
                            height={`${[40, 75, 50, 85, 60, 95, 55][i]}%`} 
                            width="100%" 
                            borderRadius="0.5rem"
                            baseColor="var(--skeleton-base)" 
                            highlightColor="var(--skeleton-highlight)"
                            containerClassName="w-full flex-1"
                         />
                      </div>
                   ))}
                </div>
             </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500 font-extrabold block mb-1">TOTAL PROFIT</span>
                        <span className={`text-4xl font-extrabold tracking-tight ${currentWeekTotal >= 0 ? 'text-slate-900 dark:text-white' : 'text-danger'}`}>
                          {currentWeekTotal >= 0 ? '+' : '-'}{formattedTotal}
                        </span>
                    </div>
                    <div className="flex gap-1 mb-2">
                        {weeksData.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentWeekIndex ? 'bg-primary w-3' : 'bg-slate-300 dark:bg-slate-700'}`}
                            />
                        ))}
                    </div>
                </div>
              </div>
              
              <div className="h-56 -mx-6">
                <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {weeksData.map((week, weekIndex) => (
                        <div key={weekIndex} className="min-w-full h-full snap-start px-6">
                             <ResponsiveContainer width="100%" height="100%">
                               <BarChart 
                                 data={week} 
                                 margin={{ top: 25, right: 10, left: 10, bottom: 20 }}
                                 barSize={32}
                               >
                                 <CartesianGrid vertical={false} strokeDasharray="0" stroke="rgba(51, 65, 85, 0.3)" />
                                 <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                                    dy={10}
                                 />
                                 <YAxis hide />
                                 <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                                   <LabelList dataKey="value" content={renderCustomLabel} />
                                   {week.map((entry, index) => (
                                     <Cell 
                                       key={`cell-${index}`} 
                                       fill={entry.value >= 0 ? "#0d59f2" : "#ef4444"} 
                                       className="hover:opacity-80 transition-opacity cursor-pointer shadow-[0_0_15px_rgba(13,89,242,0.3)]" 
                                     />
                                   ))}
                                 </Bar>
                               </BarChart>
                             </ResponsiveContainer>
                        </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Philosophy */}
        <div className="mb-6 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">Philosophy</span>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton count={4} height={14} baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)" />
            </div>
          ) : (
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              Capitalizing on short-term divergences between major layer-1 assets to capture alpha while maintaining beta exposure. The strategy actively rebalances based on 4-hour correlation coefficients.
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white dark:bg-[#1a2230] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">24h PnL</p>
            {isLoading ? (
               <Skeleton width={100} height={28} baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)" />
            ) : (
              <p className={`text-xl font-bold ${pnl24h >= 0 ? 'text-green-500' : 'text-danger'}`}>
                {pnl24h >= 0 ? '+' : ''}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(pnl24h)}
              </p>
            )}
          </div>
          <div className="bg-white dark:bg-[#1a2230] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">APY</p>
            {isLoading ? (
              <Skeleton width={80} height={28} baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)" />
            ) : (
              <p className="text-primary text-xl font-bold">
                {new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(apy)}%
              </p>
            )}
          </div>
        </div>

        {/* Current Positions */}
        <h3 className="text-lg font-bold mb-3 px-1">Current Positions</h3>
        <div className="space-y-3 mb-8">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between bg-white dark:bg-[#1a2230] p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Skeleton circle width={40} height={40} baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)" />
                  <div>
                    <Skeleton width={80} height={16} baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)" className="mb-1" />
                    <Skeleton width={50} height={12} baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)" />
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <Skeleton width={70} height={16} baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)" className="mb-1" />
                  <Skeleton width={40} height={12} baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)" />
                </div>
              </div>
            ))
          ) : (
            positions.map((pos) => (
              <div key={pos.name} className="flex items-center justify-between bg-white dark:bg-[#1a2230] p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner flex-shrink-0">
                      <img src={pos.icon} alt={pos.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{pos.name}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">{pos.amount}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{pos.price}</p>
                  <div className={`flex items-center justify-end gap-0.5 text-xs font-medium ${pos.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {pos.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{pos.change >= 0 ? '+' : ''}{pos.change}%</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Action Buttons */}
        <div className="mt-8 mb-4">
          {isLoading ? (
            <div className="w-full mb-3">
              <Skeleton 
                height={56} 
                borderRadius="0.75rem" 
                baseColor="var(--skeleton-base)" 
                highlightColor="var(--skeleton-highlight)" 
              />
            </div>
          ) : (
            <>
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className={`w-full py-4 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.98] ${
                  isPaused 
                    ? 'bg-green-600/10 border-green-600/50 text-green-500 hover:bg-green-600/20' 
                    : 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20'
                }`}
              >
                {isPaused ? <PlayCircle size={20} className="stroke-[2.5]" /> : <PauseCircle size={20} className="stroke-[2.5]" />}
                <span className="leading-none pt-0.5">{isPaused ? 'Resume Bot' : 'Pause Bot Safety Stop'}</span>
              </button>
              <p className="text-center text-zinc-600 dark:text-zinc-500 text-[10px] mt-3 font-medium">
                Pausing will close all active positions immediately to USDT.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StrategyDetailView;