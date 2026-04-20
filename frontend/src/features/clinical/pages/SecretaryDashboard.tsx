import { useAuthStore } from "@/features/auth/stores/auth.store";

import {
  UserPlus,
  Calendar,
  Clock,
  Users,
  FileText,
  Search,
  Plus,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const Secretary_Dashboard = () => {
  useAuthStore();

  // Mock data
  const todayAppointments = [
    {
      id: "PX-2044",
      name: "Arthur Holmwood",
      time: "11:45 AM",
      type: "Follow-up",
      status: "CHECKED_IN",
    },
    {
      id: "PX-2045",
      name: "Quincey Morris",
      time: "12:00 PM",
      type: "New Patient",
      status: "WAITING",
    },
    {
      id: "PX-2046",
      name: "Renfield S.",
      time: "12:15 PM",
      type: "Consultation",
      status: "WAITING",
    },
    {
      id: "PX-2047",
      name: "Lucy Westenra",
      time: "12:30 PM",
      type: "Emergency",
      status: "IN_PROGRESS",
    },
  ];

  const recentVisits = [
    {
      id: "V-1042",
      patient: "Jonathan Harker",
      doctor: "Dr. Sarah Johnson",
      time: "10:30 AM",
      status: "COMPLETED",
    },
    {
      id: "V-1043",
      patient: "Mina Murray",
      doctor: "Dr. Sarah Johnson",
      time: "11:15 AM",
      status: "IN_PROGRESS",
    },
    {
      id: "V-1044",
      patient: "Arthur Holmwood",
      doctor: "Dr. Leo Spaceman",
      time: "11:45 AM",
      status: "CREATED",
    },
  ];

  const queueStatus = {
    waiting: 3,
    checkedIn: 1,
    inProgress: 1,
    completed: 8,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CHECKED_IN":
        return "border-green-500/30 text-green-400 bg-green-500/10";
      case "IN_PROGRESS":
        return "border-clinical-blue/30 text-clinical-blue bg-clinical-blue/10";
      case "COMPLETED":
        return "border-on-surface-variant/30 text-on-surface-variant";
      case "WAITING":
        return "border-yellow-400/30 text-yellow-400 bg-yellow-400/10";
      case "CREATED":
        return "border-blue-400/30 text-blue-400 bg-blue-400/10";
      default:
        return "border-on-surface-variant/30 text-on-surface-variant";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Emergency":
        return "text-red-400";
      case "New Patient":
        return "text-clinical-blue";
      case "Follow-up":
        return "text-green-400";
      case "Consultation":
        return "text-yellow-400";
      default:
        return "text-on-surface-variant";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <p className="mono-label text-clinical-blue mb-1 uppercase tracking-widest">
            Front Desk & Scheduling
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tighter">
            Patient Services
          </h1>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 border border-white/5 group focus-within:border-clinical-blue transition-all">
            <Search
              size={14}
              className="text-on-surface-variant group-focus-within:text-clinical-blue"
            />
            <input
              type="text"
              placeholder="FIND PATIENT..."
              className="bg-transparent border-none outline-none text-[10px] font-bold text-white placeholder:text-on-surface-variant/50 w-32"
            />
          </div>
          <button className="bg-clinical-blue px-6 py-2 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-colors flex items-center gap-2">
            <UserPlus size={14} />
            NEW PATIENT
          </button>
          <button className="bg-surface-container-low px-6 py-2 text-xs font-bold text-white hover:bg-surface-bright/10 transition-colors flex items-center gap-2 border border-white/5">
            <Calendar size={14} />
            SCHEDULE
          </button>
        </div>
      </div>

      {/* Queue Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "WAITING",
            value: queueStatus.waiting,
            icon: Clock,
            color: "text-yellow-400",
          },
          {
            label: "CHECKED IN",
            value: queueStatus.checkedIn,
            icon: CheckCircle,
            color: "text-green-400",
          },
          {
            label: "IN PROGRESS",
            value: queueStatus.inProgress,
            icon: AlertCircle,
            color: "text-clinical-blue",
          },
          {
            label: "COMPLETED",
            value: queueStatus.completed,
            icon: Users,
            color: "text-on-surface-variant",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container-low p-6 space-y-2 border-none"
          >
            <div className="flex items-center gap-2">
              <stat.icon size={14} className={stat.color} />
              <span className="mono-label text-on-surface-variant">
                {stat.label}
              </span>
            </div>
            <p className="text-4xl font-bold text-white data-value">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Appointments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-clinical-blue" />
              TODAY'S APPOINTMENTS
            </h2>
            <span className="data-value text-[10px] text-clinical-blue font-bold">
              {todayAppointments.length} TOTAL
            </span>
          </div>

          <div className="space-y-3">
            {todayAppointments.map((appt, i) => (
              <div
                key={i}
                className="bg-surface-container-low p-4 flex items-center justify-between group hover:bg-surface-bright/10 transition-colors cursor-pointer border border-white/5"
              >
                <div className="flex gap-6 items-center">
                  <div className="data-value text-[10px] text-clinical-blue w-16 font-bold">
                    {appt.time}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-clinical-blue transition-colors">
                      {appt.name}
                    </h3>
                    <p
                      className={`text-[10px] uppercase tracking-wider ${getTypeColor(appt.type)}`}
                    >
                      {appt.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 border ${getStatusColor(appt.status)}`}
                  >
                    {appt.status.replace("_", " ")}
                  </span>
                  <button className="text-on-surface-variant hover:text-white transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Visits */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              RECENT VISITS
            </h2>
            <span className="data-value text-[10px] text-green-400 font-bold">
              {recentVisits.length} TODAY
            </span>
          </div>

          <div className="space-y-3">
            {recentVisits.map((visit, i) => (
              <div
                key={i}
                className="bg-surface-container-low p-4 flex items-center justify-between group hover:bg-surface-bright/10 transition-colors cursor-pointer border border-white/5"
              >
                <div className="flex gap-6 items-center">
                  <div className="data-value text-[10px] text-green-400 w-16 font-bold">
                    {visit.time}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">
                      {visit.patient}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                      {visit.doctor}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 border ${getStatusColor(visit.status)}`}
                  >
                    {visit.status.replace("_", " ")}
                  </span>
                  <button className="text-on-surface-variant hover:text-white transition-colors">
                    <FileText size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-surface-container-low p-6 border border-white/5">
        <h3 className="text-sm font-bold text-on-surface-variant mb-4 uppercase tracking-widest">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 bg-background/50 border border-white/5 hover:border-clinical-blue/30 transition-colors text-left">
            <UserPlus size={16} className="text-clinical-blue" />
            <span className="text-xs text-white">Register Patient</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-background/50 border border-white/5 hover:border-green-500/30 transition-colors text-left">
            <Calendar size={16} className="text-green-400" />
            <span className="text-xs text-white">Schedule Appointment</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-background/50 border border-white/5 hover:border-yellow-400/30 transition-colors text-left">
            <Clock size={16} className="text-yellow-400" />
            <span className="text-xs text-white">Check-In Patient</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-background/50 border border-white/5 hover:border-blue-400/30 transition-colors text-left">
            <FileText size={16} className="text-blue-400" />
            <span className="text-xs text-white">Create Visit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Secretary_Dashboard;
