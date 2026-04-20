import { useAuthStore } from '@/features/auth/stores/auth.store';
import {
  ShieldCheck,
  Users,
  UserMinus,
  AlertCircle,
  ClipboardList,
  Stethoscope,
  FileText,
} from 'lucide-react';

const SUPER_ADMIN_AdminOverview = () => {
  const { user } = useAuthStore();

  const metrics = {
    totalStaff: 12,
    activeUsers: 10,
    suspendedUsers: 2,
    pendingActivation: 3,
  };

  const queueMetrics = {
    waitingForVitals: 5,
    readyForDoctor: 3,
    inProgress: 2,
    done: 14,
  };

  const visitMetrics = {
    created: 8,
    inProgress: 4,
    completed: 27,
  };

  const recentAuditLogs = [
    { id: '1', action: 'LOGIN_SUCCESS', actor: 'Sarah Johnson', target: 'User Session', time: '2 min ago' },
    { id: '2', action: 'USER_CREATED', actor: 'Demo Admin', target: 'Brenda King', time: '15 min ago' },
    { id: '3', action: 'VITALS_RECORDED', actor: 'Brenda King', target: 'Visit V-1042', time: '22 min ago' },
    { id: '4', action: 'PASSWORD_CHANGE_SUCCESS', actor: 'Leo Spaceman', target: 'User Account', time: '1 hr ago' },
    { id: '5', action: 'USER_SUSPENDED', actor: 'Demo Admin', target: 'Leo Spaceman', time: '1 hr ago' },
  ];

  const getActionColor = (action: string) => {
    if (action.includes('CREATED') || action.includes('SUCCESS') || action.includes('ACTIVATED'))
      return 'border-green-500/40 text-green-400';
    if (action.includes('SUSPENDED') || action.includes('FAILURE'))
      return 'border-red-500/40 text-red-400';
    return 'border-clinical-blue/40 text-clinical-blue';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <p className="mono-label text-clinical-blue mb-1 uppercase">Administrative Command Center</p>
        <h1 className="text-3xl font-bold text-white tracking-tighter">
          Welcome, {user?.firstName}
        </h1>
      </div>

      {/* Staff Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL STAFF', value: metrics.totalStaff, icon: Users, color: 'text-clinical-blue' },
          { label: 'ACTIVE USERS', value: metrics.activeUsers, icon: ShieldCheck, color: 'text-green-400' },
          { label: 'SUSPENDED', value: metrics.suspendedUsers, icon: UserMinus, color: 'text-red-400' },
          { label: 'PENDING ACTIVATION', value: metrics.pendingActivation, icon: AlertCircle, color: 'text-yellow-400' },
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
        {/* Queue Status */}
        <div className="bg-surface-container-low p-6 border-l-2 border-clinical-blue/50">
          <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
            <ClipboardList size={16} className="text-clinical-blue" />
            QUEUE STATUS
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Waiting for Vitals', value: queueMetrics.waitingForVitals, status: 'WAITING_FOR_VITALS', color: 'text-yellow-400' },
              { label: 'Ready for Doctor', value: queueMetrics.readyForDoctor, status: 'READY_FOR_DOCTOR', color: 'text-clinical-blue' },
              { label: 'In Progress', value: queueMetrics.inProgress, status: 'IN_PROGRESS', color: 'text-orange-400' },
              { label: 'Completed', value: queueMetrics.done, status: 'DONE', color: 'text-green-400' },
            ].map((q) => (
              <div key={q.status} className="flex items-center justify-between p-3 bg-background/50 border border-white/5 hover:border-clinical-blue/30 transition-colors cursor-pointer group">
                <span className="text-xs text-on-surface-variant uppercase tracking-wider group-hover:text-white">{q.label}</span>
                <span className={`data-value font-bold ${q.color}`}>{q.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visit Status */}
        <div className="bg-surface-container-low p-6 border-l-2 border-green-500/30">
          <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
            <Stethoscope size={16} className="text-green-400" />
            TODAY'S VISITS
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Created', value: visitMetrics.created, color: 'text-yellow-400' },
              { label: 'In Progress', value: visitMetrics.inProgress, color: 'text-clinical-blue' },
              { label: 'Completed', value: visitMetrics.completed, color: 'text-green-400' },
            ].map((v) => (
              <div key={v.label} className="flex items-center justify-between p-3 bg-background/50 border border-white/5 hover:border-green-500/30 transition-colors cursor-pointer group">
                <span className="text-xs text-on-surface-variant uppercase tracking-wider group-hover:text-white">{v.label}</span>
                <span className={`data-value font-bold ${v.color}`}>{v.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Audit Activity */}
      <div className="bg-surface-container-low p-6 border-l-2 border-on-surface-variant/30">
        <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
          <FileText size={16} className="text-on-surface-variant" />
          RECENT AUDIT ACTIVITY
        </h2>
        <div className="space-y-2">
          {recentAuditLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 group hover:bg-surface-bright/5 transition-all px-2">
              <div className="flex items-center gap-4">
                <span className={`text-[9px] font-bold px-2 py-0.5 border ${getActionColor(log.action)}`}>
                  {log.action}
                </span>
                <span className="text-sm text-white font-medium">{log.actor}</span>
                <span className="text-xs text-on-surface-variant">→</span>
                <span className="text-xs text-on-surface-variant">{log.target}</span>
              </div>
              <span className="data-value text-[10px] text-on-surface-variant">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SUPER_ADMIN_AdminOverview;
