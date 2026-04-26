import { Search, Bell, Command, LogOut } from "lucide-react";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useLogout } from "@/features/auth/hooks/useAuth";
import { useNavigate } from "react-router";

const TopNav = () => {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/login");
      },
    });
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-background border-none shrink-0 border-b border-white/5">
      <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-sm w-96 group transition-all focus-within:ring-1 focus-within:ring-clinical-blue/50 border border-white/5">
        <Search
          size={16}
          className="text-on-surface-variant group-focus-within:text-clinical-blue transition-colors"
        />
        <input
          type="text"
          placeholder="Search patients, records, or commands..."
          className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-on-surface-variant/50"
        />
        <div className="flex items-center gap-1 bg-surface-bright/50 px-1.5 py-0.5 rounded-sm border border-white/5">
          <Command size={10} className="text-on-surface-variant" />
          <span className="text-[10px] font-medium text-on-surface-variant">
            K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-on-surface-variant hover:text-white transition-colors">
          <Bell size={20} />
          <div className="absolute top-0 right-0 w-2 h-2 bg-clinical-blue rounded-full border-2 border-background" />
        </button>

        <div className="flex items-center gap-4 pl-6 border-l border-surface-bright/20">
          <div className="text-right">
            <p className="text-sm font-semibold text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="mono-label text-clinical-blue uppercase text-[10px] tracking-widest">
              {user?.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-10 h-10 bg-surface-container-low rounded-sm flex items-center justify-center border border-white/5 text-on-surface-variant hover:text-red-400 hover:border-red-400/30 transition-all group"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
