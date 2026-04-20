import { Activity, Thermometer, Plus, Search } from 'lucide-react';

const NurseDashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <p className="mono-label text-clinical-blue mb-1 uppercase tracking-widest">Triage & Vitals Station</p>
          <h1 className="text-3xl font-bold text-white tracking-tighter">Central Nursing Unit</h1>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 border border-white/5 group focus-within:border-clinical-blue transition-all">
            <Search size={14} className="text-on-surface-variant group-focus-within:text-clinical-blue" />
            <input type="text" placeholder="FIND PATIENT..." className="bg-transparent border-none outline-none text-[10px] font-bold text-white placeholder:text-on-surface-variant/50 w-32" />
          </div>
          <button className="bg-clinical-blue px-6 py-2 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-colors">CHECK-IN PATIENT</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-clinical-blue" />
              TRIAGE QUEUE (WAITING FOR VITALS)
            </h2>
            <span className="data-value text-[10px] text-clinical-blue font-bold">08 PENDING</span>
          </div>
          
          <div className="space-y-3">
            {[
              { name: 'Arthur Holmwood', id: 'PX-2044', time: '11:45 AM', priority: 'High', reason: 'Chest Pain' },
              { name: 'Quincey Morris', id: 'PX-2045', time: '12:00 PM', priority: 'Medium', reason: 'Routine Checkup' },
              { name: 'Renfield S.', id: 'PX-2046', time: '12:15 PM', priority: 'Low', reason: 'Follow-up' }
            ].map((p, i) => (
              <div key={i} className="bg-surface-container-low p-4 flex items-center justify-between group hover:bg-surface-bright/10 transition-colors cursor-pointer border border-white/5 border-l-2 hover:border-l-clinical-blue">
                <div className="flex gap-6 items-center">
                  <div className="data-value text-[10px] text-clinical-blue w-16 font-bold">{p.time}</div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-clinical-blue transition-colors">{p.name}</h3>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{p.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <span className={`text-[9px] font-bold px-2 py-0.5 border ${
                    p.priority === 'High' ? 'border-red-500/50 text-red-400 bg-red-400/5' : 'border-on-surface-variant/30 text-on-surface-variant'
                  }`}>
                    {p.priority.toUpperCase()}
                  </span>
                  <button className="text-on-surface-variant hover:text-white transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Real-Time Monitoring</h2>
          <div className="bg-surface-container-low p-6 space-y-8 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Average BPM</p>
                  <p className="data-value text-2xl text-white">72 <span className="text-xs font-normal text-on-surface-variant">BPM</span></p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <Thermometer size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Mean Temp</p>
                  <p className="data-value text-2xl text-white">36.8 <span className="text-xs font-normal text-on-surface-variant">°C</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;
