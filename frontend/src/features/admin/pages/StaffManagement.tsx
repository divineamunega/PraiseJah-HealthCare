import React, { useState } from "react";
import { Database, UserPlus, Trash2, Loader2, ShieldAlert } from "lucide-react";
import { useUsers } from "@/features/admin/hooks/useUsers";
import { type UserRole, type UserStatus } from "@/types/user";
import { motion, AnimatePresence } from "framer-motion";

const StaffManagement = () => {
  const {
    users,
    isLoading,
    createUser,
    updateStatus,
    deleteUser,
    isCreating,
    isUpdatingStatus,
    isDeleting,
  } = useUsers();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "DOCTOR" as UserRole,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) return;

    try {
      await createUser(formData);
      setFormData({ firstName: "", lastName: "", email: "", role: "DOCTOR" });
      setShowForm(false);
    } catch (err) {
      // Error is handled in the hook's toast
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: UserStatus) => {
    const newStatus: UserStatus =
      currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await updateStatus({ id, status: newStatus });
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to PERMANENTLY DEACTIVATE this staff record?",
      )
    ) {
      await deleteUser(id);
    }
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
          disabled={isCreating}
        >
          {showForm ? (
            "CANCEL"
          ) : (
            <>
              <UserPlus size={14} /> PROVISION NEW USER
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-surface-container-low p-6 border-2 border-clinical-blue/30 overflow-hidden mb-8"
          >
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <input
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="bg-background border border-white/5 p-2 text-sm text-white focus:border-clinical-blue outline-none"
                required
              />
              <input
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="bg-background border border-white/5 p-2 text-sm text-white focus:border-clinical-blue outline-none"
                required
              />
              <input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="bg-background border border-white/5 p-2 text-sm text-white focus:border-clinical-blue outline-none"
                required
              />
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as UserRole })
                }
                className="bg-background border border-white/5 p-2 text-sm text-white focus:border-clinical-blue outline-none"
              >
                <option value="DOCTOR">Doctor</option>
                <option value="NURSE">Nurse</option>
                <option value="ADMIN">Admin</option>
                <option value="SECRETARY">Secretary</option>
              </select>
              <div className="md:col-span-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="bg-clinical-blue px-8 py-2 text-xs font-bold text-white flex items-center gap-2 disabled:opacity-50"
                >
                  {isCreating && <Loader2 size={14} className="animate-spin" />}
                  AUTHORIZE PROVISIONING
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-surface-container-low overflow-x-auto min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <Loader2
              className="animate-spin text-clinical-blue mb-4"
              size={32}
            />
            <p className="text-xs font-mono uppercase tracking-widest">
              Accessing Secure Records...
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 mono-label text-on-surface-variant text-[10px]">
                  STAFF MEMBER
                </th>
                <th className="px-6 py-4 mono-label text-on-surface-variant text-[10px]">
                  ROLE
                </th>
                <th className="px-6 py-4 mono-label text-on-surface-variant text-[10px]">
                  STATUS
                </th>
                <th className="px-6 py-4 mono-label text-on-surface-variant text-right text-[10px]">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-surface-bright/5 transition-colors group"
                >
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-background border border-white/5 flex items-center justify-center font-bold text-clinical-blue text-xs uppercase">
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[10px] text-on-surface-variant lowercase data-value">
                        {user.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="mono-label text-[10px] text-on-surface-variant">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          user.status === "ACTIVE"
                            ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                            : user.status === "PENDING"
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                      />
                      <span className="text-[10px] mono-label text-on-surface-variant">
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        disabled={isUpdatingStatus}
                        className={`text-[10px] font-bold px-3 py-1 border transition-all disabled:opacity-50 ${
                          user.status === "ACTIVE"
                            ? "border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white"
                            : "border-green-500/30 text-green-400 hover:bg-green-500 hover:text-white"
                        }`}
                      >
                        {user.status === "ACTIVE" ? "SUSPEND" : "ACTIVATE"}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={isDeleting}
                        className="p-1 border border-white/10 text-on-surface-variant hover:text-red-500 hover:border-red-500/50 transition-all disabled:opacity-50"
                        title="Delete User"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-20 text-center text-on-surface-variant"
                  >
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <ShieldAlert size={32} />
                      <p className="text-xs font-mono uppercase">
                        Database empty or access restricted
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;
