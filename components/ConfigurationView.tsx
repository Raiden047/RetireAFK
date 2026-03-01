import React, { useState } from 'react';
import { 
  ArrowLeft, 
  SlidersHorizontal, 
  PieChart, 
  Shield, 
  Save, 
  Ban 
} from 'lucide-react';

interface ConfigurationViewProps {
  onBack: () => void;
}

const ConfigurationView: React.FC<ConfigurationViewProps> = ({ onBack }) => {
  const [stopLoss, setStopLoss] = useState(-5.0);
  const [takeProfit, setTakeProfit] = useState(12.5);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-background-light dark:bg-background-dark/95 backdrop-blur-sm p-4 justify-between border-b border-gray-200 dark:border-gray-800">
        <button onClick={onBack} className="flex size-10 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-charcoal transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Correlation Alpha</h2>
        <div className="flex items-center gap-2 bg-charcoal rounded-full px-2 py-1 border border-charcoal-light">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-wider ml-1">Live</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" defaultChecked />
            <div className="w-7 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-secondary"></div>
          </label>
        </div>
      </div>

      <main className="flex-1 flex flex-col w-full p-4 pb-24">
        {/* Hero Card */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center shrink-0 border border-gray-700 overflow-hidden shadow-lg">
            <div className="w-full h-full bg-cover bg-center opacity-80" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCU3wb0JGjnGu6HiQkFo0bk__go6IedWuyqO_aveQPfskQccuLdgWWzXPigH8Ou2howWOyz7V8fCx_P-rvHaUTInOnKZJwVtbIpUNWkklVEgbKXFfl4p0GRwIL6X0rfKyiB3tybhg54EpA9LC-x47nvJQL7vvMO28i5Y2ksGP1pUJXrFJQXaUxSP1AiC6R_yavBQPhISCfz_QQeycWwEJyqUCDsCEhpti_cbP1gq9HgaszgyRAyr--nHTDNWF06TpR5fOIW4TRN-lc')" }}></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Correlation Alpha</h1>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/10 text-secondary border border-secondary/20">ACTIVE</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">HIGH RISK</span>
            </div>
          </div>
        </div>

        {/* Trading Configuration */}
        <div className="bg-charcoal rounded-2xl p-5 mb-6 border border-charcoal-light shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="text-neon-blue w-5 h-5" />
            <h3 className="text-white font-bold text-base">Trading Configuration</h3>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Stop Loss</label>
                <span className="text-sm font-bold text-white">{stopLoss.toFixed(1)}%</span>
              </div>
              <input 
                type="range" 
                min="-20" 
                max="0" 
                step="0.5" 
                value={stopLoss} 
                onChange={(e) => setStopLoss(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Take Profit</label>
                <span className="text-sm font-bold text-white">+{takeProfit.toFixed(1)}%</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                step="0.5" 
                value={takeProfit}
                onChange={(e) => setTakeProfit(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                <span>Quick</span>
                <span>Long Term</span>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="bg-charcoal rounded-2xl p-5 mb-6 border border-charcoal-light shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="text-neon-blue w-5 h-5" />
            <h3 className="text-white font-bold text-base">Asset Allocation</h3>
          </div>
          <div className="space-y-4">
            <AllocationRow 
              symbol="BTC" 
              name="Bitcoin" 
              color="#F7931A" 
              percent={45} 
              textColor="text-white"
            />
            <AllocationRow 
              symbol="ETH" 
              name="Ethereum" 
              color="#627EEA" 
              percent={35} 
              textColor="text-white"
            />
            <AllocationRow 
              symbol="SOL" 
              name="Solana" 
              color="#14F195" 
              percent={20} 
              textColor="text-black"
            />
          </div>
        </div>

        {/* Risk Management */}
        <div className="bg-charcoal rounded-2xl p-5 mb-8 border border-charcoal-light shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="text-neon-blue w-5 h-5" />
            <h3 className="text-white font-bold text-base">Risk Management</h3>
          </div>
          <div className="space-y-4 divide-y divide-gray-800">
            <ToggleRow 
              title="Auto-Compound" 
              subtitle="Reinvest profits automatically" 
              defaultChecked={true}
            />
            <ToggleRow 
              title="Trailing Stop" 
              subtitle="Adjust stop loss with price increase" 
              defaultChecked={true}
              wrapperClass="pt-4"
            />
            <ToggleRow 
              title="Emergency Stop" 
              subtitle="Halt trading on high volatility" 
              defaultChecked={false}
              isDanger={true}
              wrapperClass="pt-4"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 mb-4">
          <button className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]">
            <Save className="w-5 h-5" />
            Save Changes
          </button>
          <button className="w-full py-3.5 rounded-xl bg-danger/10 border border-danger/30 text-danger font-bold text-sm hover:bg-danger/20 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]">
            <Ban className="w-5 h-5" />
            Terminate Bot
          </button>
        </div>
      </main>
    </div>
  );
};

const AllocationRow: React.FC<{ symbol: string; name: string; color: string; percent: number; textColor: string }> = ({ symbol, name, color, percent, textColor }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${textColor}`} style={{ backgroundColor: color }}>
        {symbol}
      </div>
      <span className="text-sm font-medium text-white">{name}</span>
    </div>
    <div className="flex items-center gap-3 w-1/2">
      <div className="flex-1 h-2 bg-charcoal-light rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: color }}></div>
      </div>
      <span className="text-sm font-bold text-white w-8 text-right">{percent}%</span>
    </div>
  </div>
);

const ToggleRow: React.FC<{ title: string; subtitle: string; defaultChecked: boolean; isDanger?: boolean; wrapperClass?: string }> = ({ title, subtitle, defaultChecked, isDanger, wrapperClass }) => (
  <div className={`flex items-center justify-between ${wrapperClass || ''}`}>
    <div>
      <h4 className="text-sm font-medium text-white">{title}</h4>
      <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>
    </div>
    <label className={`ios-toggle ${isDanger ? 'danger' : ''}`}>
      <input type="checkbox" defaultChecked={defaultChecked} />
      <span className="ios-slider"></span>
    </label>
  </div>
);

export default ConfigurationView;