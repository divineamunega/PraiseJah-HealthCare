import React, { useState } from 'react';
import { Database, UserPlus } from 'lucide-react';
import { useAdminStore, type UserRole } from '../../store/adminStore';
import { motion } from 'framer-motion';

const StaffManagement = () => {
  const { users, addUser, toggleUserStatus } = useAdminStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', role: 'DOCTOR' as UserRole });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) return;
    addUser(formData);
    setFormData({ firstName: '', lastName: '', email: '', role: 'DOCTOR' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Database size={18} className="text-clinical-blue" />
          STAFF DIRECTORY
        </h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-clinical-blue px-6 py-2 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-all flex items-center gap-2"
        >
          {showForm ? 'CANCEL' : <><UserPlus size={14} /> PROVISION NEW USER</>}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-surface-container-low p-6 border-2 border-clinical-blue/30 overflow-hidden mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input placeholder="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="bg-background border border-white/5 p-2 text-sm text-white focus:border-clinical-blue outline-none" />
            <input placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="bg-background border border-white/5 p-2 text-sm text-white focus:border-clinical-blue outline-none" />
            <input placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-background border border-white/5 p-2 text-sm text-white focus:border-clinical-blue outline-none" />
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="bg-background border border-white/5 p-2 text-sm text-white focus:border-clinical-blue outline-none">
              <option value="DOCTOR">Doctor</option>
              <option value="NURSE">Nurse</option>
              <option value="ADMIN">Admin</option>
              <option value="SECRETARY">Secretary</option>
            </select>
            <div className="md:col-span-4 flex justify-end">
              <button type="submit" className="bg-clinical-blue px-8 py-2 text-xs font-bold text-white">AUTHORIZE PROVISIONING</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-surface-container-low overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-4 mono-label text-on-surface-variant">STAFF MEMBER</th>
              <th className="px-6 py-4 mono-label text-on-surface-variant">ROLE</th>
              <th className="px-6 py-4 mono-label text-on-surface-variant">STATUS</th>
              <th className="px-6 py-4 mono-label text-on-surface-variant text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-surface-bright/5 transition-colors group">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-background border border-white/5 flex items-center justify-center font-bold text-clinical-blue text-xs uppercase">{user.firstName[0]}{user.lastName[0]}</div>
                  <div><p className="text-sm font-semibold text-white">{user.firstName} {user.lastName}</p><p className="text-[10px] text-on-surface-variant lowercase data-value">{user.email}</p></div>
                </td>
                <td className="px-6 py-4"><span className="mono-label text-[10px] text-on-surface-variant">{user.role}</span></td>
                <td className="px-6 py-4"><div className={`w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`} /></td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => toggleUserStatus(user.id)} className={`text-[10px] font-bold px-3 py-1 border transition-all ${user.status === 'ACTIVE' ? 'border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white' : 'border-green-500/30 text-green-400 hover:bg-green-500 hover:text-white'}`}>
                    {user.status === 'ACTIVE' ? 'SUSPEND' : 'ACTIVATE'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffManagement;
