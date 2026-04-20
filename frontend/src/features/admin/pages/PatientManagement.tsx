import { Database, Users, UserPlus, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const SUPER_ADMIN_PatientManagement = () => {
  // Mock patient data - in reality this would come from API
  const patients = [
    { id: 'PX-2042', name: 'Jonathan Harker', age: 45, sex: 'MALE', phone: '555-0123', lastVisit: '2026-04-15' },
    { id: 'PX-2044', name: 'Arthur Holmwood', age: 38, sex: 'MALE', phone: '555-0456', lastVisit: '2026-04-16' },
    { id: 'PX-2045', name: 'Quincey Morris', age: 42, sex: 'MALE', phone: '555-0789', lastVisit: '2026-04-14' },
    { id: 'PX-2048', name: 'Lucy Westenra', age: 29, sex: 'FEMALE', phone: '555-0101', lastVisit: '2026-04-17' },
    { id: 'PX-2050', name: 'Renfield S.', age: 31, sex: 'MALE', phone: '555-0202', lastVisit: '2026-04-13' },
  ];

  const statusColors = {
    STABLE: 'border-green-500/30 text-green-400',
    CRITICAL: 'border-red-500/30 text-red-400',
    WAITING: 'border-yellow-400/30 text-yellow-400',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Database size={18} className="text-clinical-blue" />
          PATIENT REGISTRY
        </h2>
        <button 
          onClick={() => {/* TODO: Open patient registration modal */}}
          className="bg-clinical-blue px-6 py-2 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-all flex items-center gap-2"
        >
          <UserPlus size={14} />
          REGISTER NEW PATIENT
        </button>
      </div>

      {/* Patient Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL PATIENTS', value: patients.length, icon: Users, color: 'text-clinical-blue' },
          { label: 'ACTIVE TODAY', value: 12, icon: Calendar, color: 'text-green-400' },
          { label: 'CRITICAL', value: patients.filter(p => p.name.includes('Lucy')).length, icon: AlertCircle, color: 'text-red-400' },
          { label: 'GROWTH (MoM)', value: '+12%', icon: TrendingUp, color: 'text-blue-400' },
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

      {/* Patients Table */}
      <div className="bg-surface-container-low overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-4 mono-label text-on-surface-variant">PATIENT</th>
              <th className="px-6 py-4 mono-label text-on-surface-variant">AGE/SEX</th>
              <th className="px-6 py-4 mono-label text-on-surface-variant">CONTACT</th>
              <th className="px-6 py-4 mono-label text-on-surface-variant">LAST VISIT</th>
              <th className="px-6 py-4 mono-label text-on-surface-variant text-right">STATUS</th>
              <th className="px-6 py-4 mono-label text-on-surface-variant text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {patients.map((patient) => {
              // Determine status (mock logic)
              const status = patient.name === 'Lucy Westenra' ? 'CRITICAL' : 
                           patient.name === 'Jonathan Harker' ? 'STABLE' : 'WAITING';
              
              return (
                <tr key={patient.id} className="hover:bg-surface-bright/5 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-background border border-white/5 flex items-center justify-center font-bold text-clinical-blue text-xs uppercase">{patient.name[0]}{patient.name.split(' ')[1]?.[0] || 'X'}</div>
                    <div><p className="text-sm font-semibold text-white">{patient.name}</p><p className="text-[10px] text-on-surface-variant lowercase data-value">PX-${patient.id.slice(-4)}</p></div>
                  </td>
                  <td className="px-6 py-4">{patient.age} • {patient.sex}</td>
                  <td className="px-6 py-4">{patient.phone}</td>
                  <td className="px-6 py-4">{patient.lastVisit}</td>
                  <td className="px-6 py-4 text-right"><span className={`data-value text-[8px] px-2 py-0.5 border ${statusColors[status]}`}>{status}</span></td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {/* TODO: View patient details */}}
                      className="text-[10px] font-bold px-3 py-1 border transition-all border-clinical-blue/30 text-clinical-blue hover:bg-clinical-blue/20"
                    >
                      VIEW
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SUPER_ADMIN_PatientManagement;
