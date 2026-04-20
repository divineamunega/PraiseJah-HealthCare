import { Activity, Clock, FileText, FlaskConical, UserPlus } from 'lucide-react';

const DoctorDashboard = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <p className="mono-label text-clinical-blue mb-1 uppercase">Clinical Cockpit</p>
          <h1 className="text-3xl font-bold text-white tracking-tighter">Dr. Sarah Johnson</h1>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-low px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-white border border-white/5 transition-colors">HISTORY</button>
          <button className="bg-clinical-blue px-6 py-2 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-colors flex items-center gap-2">
            <UserPlus size={14} />
            NEXT PATIENT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            MY ACTIVE ENCOUNTERS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Jonathan Harker', id: 'PX-2042', time: '10:30 AM', status: 'In Progress', wait: '12m' },
              { name: 'Mina Murray', id: 'PX-2043', time: '11:15 AM', status: 'Ready', wait: '05m' }
            ].map((p, i) => (
              <div key={i} className="bg-surface-container-low p-5 hover:bg-surface-bright/10 transition-all cursor-pointer group border border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="data-value text-clinical-blue text-[10px] mb-1">{p.id}</p>
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 border ${i === 0 ? 'border-clinical-blue text-clinical-blue bg-clinical-blue/10' : 'border-green-500 text-green-400 bg-green-500/10'}`}>
                    {p.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-6 border-t border-white/5 pt-4 mt-2">
                  <div className="flex items-center gap-2 text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">
                    <Clock size={12} className="text-clinical-blue" />
                    <span>{p.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">
                    <Activity size={12} className="text-clinical-blue" />
                    <span>WAIT: {p.wait}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container-low p-6 border-l-2 border-clinical-blue shadow-lg shadow-black/20">
            <p className="mono-label text-on-surface-variant mb-6 uppercase tracking-[0.2em] text-[9px] font-bold">PENDING_TASKS</p>
            <div className="space-y-6">
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-on-surface-variant group-hover:text-clinical-blue transition-colors" />
                  <span className="text-xs text-white font-medium uppercase tracking-wider">Unsigned Notes</span>
                </div>
                <span className="data-value text-clinical-blue text-[10px] font-bold">04</span>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <FlaskConical size={16} className="text-on-surface-variant group-hover:text-yellow-400 transition-colors" />
                  <span className="text-xs text-white font-medium uppercase tracking-wider">Lab Results</span>
                </div>
                <span className="data-value text-yellow-400 text-[10px] font-bold">02</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
