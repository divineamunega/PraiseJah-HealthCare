import { ShieldCheck, Users, UserMinus, Activity, AlertCircle } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';

const AdminOverview = () => {
  const { getMetrics, patients } = useAdminStore();
  const metrics = getMetrics();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL STAFF', value: metrics.totalStaff, icon: Users, color: 'text-clinical-blue' },
          { label: 'ACTIVE USERS', value: metrics.activeUsers, icon: ShieldCheck, color: 'text-green-400' },
          { label: 'SUSPENDED', value: metrics.suspendedUsers, icon: UserMinus, color: 'text-red-400' },
          { label: 'CRITICAL PATIENTS', value: metrics.criticalPatients, icon: Activity, color: 'text-orange-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-low p-6 space-y-2 border-none">
            <div className="flex items-center gap-2">
              <stat.icon size={14} className={stat.color} />
              <span className="mono-label text-on-surface-variant">{stat.label}</span>
            </div>
            <p className="text-4xl font-bold text-white data-value">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-container-low p-6 border-l-2 border-orange-500/50">
          <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
            <AlertCircle size={16} className="text-orange-400" />
            SYSTEM ALERTS
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-background/50 border border-white/5 hover:border-orange-500/30 transition-colors cursor-pointer group">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider group-hover:text-white">Critical Patient Count</span>
              <span className="data-value text-orange-400 font-bold">{metrics.criticalPatients}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background/50 border border-white/5 hover:border-red-500/30 transition-colors cursor-pointer group">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider group-hover:text-white">Suspended Staff Accounts</span>
              <span className="data-value text-red-400 font-bold">{metrics.suspendedUsers}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low p-6">
          <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
            <Activity size={16} className="text-clinical-blue" />
            PATIENT SNAPSHOT
          </h2>
          <div className="divide-y divide-white/5">
            {patients.slice(0, 4).map(p => (
              <div key={p.id} className="py-3 flex items-center justify-between group cursor-pointer hover:bg-surface-bright/5 transition-all px-2">
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-clinical-blue transition-colors">{p.name}</p>
                  <p className="data-value text-[9px] text-on-surface-variant uppercase">{p.id}</p>
                </div>
                <span className={`data-value text-[8px] px-2 py-0.5 border ${
                  p.status === 'CRITICAL' ? 'border-red-500/30 text-red-400' : 'border-green-500/30 text-green-400'
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
