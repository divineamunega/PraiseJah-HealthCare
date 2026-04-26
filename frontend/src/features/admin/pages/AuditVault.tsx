import { Terminal } from "lucide-react";
import { useAdminStore } from "@/features/admin/stores/admin.store";

const AuditVault = () => {
  const { logs } = useAdminStore();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-widest">
          <Terminal size={18} className="text-clinical-blue" />
          SECURITY AUDIT VAULT
        </h2>
        <button className="bg-surface-container-low px-6 py-2 text-xs font-bold text-on-surface-variant hover:text-white border border-white/5 transition-all uppercase tracking-widest">
          EXPORT FULL AUDIT LOG (CSV)
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-white/5 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-surface-container-low/50">
              <th className="px-6 py-3 mono-label text-on-surface-variant">
                TIMESTAMP
              </th>
              <th className="px-6 py-3 mono-label text-on-surface-variant">
                ACTOR
              </th>
              <th className="px-6 py-3 mono-label text-on-surface-variant">
                ACTION
              </th>
              <th className="px-6 py-3 mono-label text-on-surface-variant">
                TARGET
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-white/5 hover:bg-surface-bright/5 transition-colors group"
              >
                <td className="px-6 py-4 data-value text-[11px] text-on-surface-variant">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-white">
                  {log.actor}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 border ${
                      log.action === "USER_CREATED"
                        ? "border-clinical-blue/40 text-clinical-blue"
                        : log.action === "USER_SUSPENDED"
                          ? "border-red-500/40 text-red-400"
                          : "border-green-500/40 text-green-400"
                    }`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">
                  {log.target}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditVault;
