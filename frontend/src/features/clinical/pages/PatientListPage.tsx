import { useState, useCallback, useEffect } from "react";
import {
  Search,
  UserPlus,
  Users,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Filter,
  ChevronUp,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { differenceInYears, differenceInMonths, differenceInDays } from "date-fns";
import { usePatients } from "../hooks/usePatients";
import RegisterPatientModal from "../components/RegisterPatientModal";

const PatientListPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState({
    gender: "",
    phone: "",
  });

  const calculateAge = (dob: string): string => {
    const birth = new Date(dob);
    const today = new Date();

    const years = differenceInYears(today, birth);
    if (years > 0) return `${years} year${years !== 1 ? "s" : ""}`;

    const months = differenceInMonths(today, birth);
    if (months > 0) return `${months} month${months !== 1 ? "s" : ""}`;

    const days = differenceInDays(today, birth);
    return `${days} day${days !== 1 ? "s" : ""}`;
  };

  const { data, isLoading, isFetching } = usePatients({
    name: debouncedSearchTerm || undefined,
    phone: filters.phone || undefined,
    sex: filters.gender || undefined,
    page,
    limit: 10,
    sortBy,
    sortOrder,
  });

  const patients = data?.data || [];
  const meta = data?.meta;
  const isBackgroundLoading = isFetching && !isLoading;

  const handleSort = useCallback(
    (column: string) => {
      if (sortBy === column) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortBy(column);
        setSortOrder("asc");
      }
      setPage(1);
    },
    [sortBy, sortOrder],
  );

  const clearFilters = useCallback(() => {
    setFilters({ gender: "", phone: "" });
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setPage(1);
  }, []);

  const hasActiveFilters =
    debouncedSearchTerm || filters.gender || filters.phone;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="mono-label text-clinical-blue mb-1 uppercase tracking-widest">
              Medical Records
            </p>
            <h1 className="text-3xl font-bold text-white tracking-tighter">
              Patient Registry
            </h1>
          </div>
          {isBackgroundLoading && (
            <Loader2 size={16} className="text-clinical-blue animate-spin" />
          )}
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 border border-white/5 group focus-within:border-clinical-blue transition-all">
            <Search
              size={14}
              className={`text-on-surface-variant group-focus-within:text-clinical-blue transition-colors ${isBackgroundLoading && searchTerm ? "animate-pulse text-clinical-blue" : ""}`}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SEARCH BY NAME..."
              className="bg-transparent border-none outline-none text-[10px] font-bold text-white placeholder:text-on-surface-variant/50 w-64"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              disabled={isBackgroundLoading}
              className={`bg-surface-container-low border px-4 py-2 transition-colors flex items-center gap-2 disabled:opacity-50 ${
                hasActiveFilters
                  ? "border-clinical-blue text-clinical-blue"
                  : "border-white/5 text-on-surface-variant hover:text-white"
              }`}
            >
              <Filter size={16} />
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-clinical-blue rounded-full" />
              )}
            </button>
            <AnimatePresence>
              {isFilterOpen && (
                <div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-surface-container-low border border-white/5 shadow-xl z-50 p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white uppercase tracking-widest">
                      Filters
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-[10px] text-clinical-blue hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">
                      Gender
                    </label>
                    <select
                      value={filters.gender}
                      onChange={(e) => {
                        setFilters({ ...filters, gender: e.target.value });
                        setPage(1);
                      }}
                      className="w-full bg-background border border-white/5 px-3 py-2 text-[10px] text-white outline-none focus:border-clinical-blue transition-colors"
                    >
                      <option value="">All</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-on-surface-variant uppercase font-bold">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={filters.phone}
                      onChange={(e) => {
                        setFilters({ ...filters, phone: e.target.value });
                        setPage(1);
                      }}
                      placeholder="Search by phone..."
                      className="w-full bg-background border border-white/5 px-3 py-2 text-[10px] text-white outline-none focus:border-clinical-blue transition-colors"
                    />
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-clinical-blue px-6 py-2 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-colors flex items-center gap-2"
          >
            <UserPlus size={14} />
            REGISTER NEW
          </button>
        </div>
      </div>

      <div className="bg-surface-container-low border border-white/5 relative min-h-[500px]">
        {isBackgroundLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-clinical-blue to-transparent animate-pulse z-10" />
        )}
        <div
          className="overflow-x-auto transition-opacity duration-200"
          style={{ opacity: isBackgroundLoading ? 0.7 : 1 }}
        >
          <table className="w-full text-left">
            <colgroup>
              <col style={{ width: "30%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "10%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "23%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-white/5">
                <th
                  onClick={() =>
                    !isBackgroundLoading && handleSort("firstName")
                  }
                  className={`px-6 py-4 h-14 mono-label text-[10px] text-on-surface-variant cursor-pointer hover:text-white hover:bg-white/5 transition-colors select-none ${isBackgroundLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    Patient Profile
                    <ChevronUp
                      size={10}
                      className={`opacity-30 ${sortBy === "firstName" && sortOrder === "asc" ? "opacity-100 text-clinical-blue" : ""}`}
                    />
                    <ChevronDown
                      size={10}
                      className={`opacity-30 ${sortBy === "firstName" && sortOrder === "desc" ? "opacity-100 text-clinical-blue" : ""}`}
                    />
                  </div>
                </th>
                <th
                  onClick={() => !isBackgroundLoading && handleSort("id")}
                  className={`px-6 py-4 h-14 mono-label text-[10px] text-on-surface-variant cursor-pointer hover:text-white hover:bg-white/5 transition-colors select-none ${isBackgroundLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    ID Number
                    <ChevronUp
                      size={10}
                      className={`opacity-30 ${sortBy === "id" && sortOrder === "asc" ? "opacity-100 text-clinical-blue" : ""}`}
                    />
                    <ChevronDown
                      size={10}
                      className={`opacity-30 ${sortBy === "id" && sortOrder === "desc" ? "opacity-100 text-clinical-blue" : ""}`}
                    />
                  </div>
                </th>
                <th
                  onClick={() => !isBackgroundLoading && handleSort("sex")}
                  className={`px-6 py-4 h-14 mono-label text-[10px] text-on-surface-variant cursor-pointer hover:text-white hover:bg-white/5 transition-colors select-none ${isBackgroundLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    Gender
                    <ChevronUp
                      size={10}
                      className={`opacity-30 ${sortBy === "sex" && sortOrder === "asc" ? "opacity-100 text-clinical-blue" : ""}`}
                    />
                    <ChevronDown
                      size={10}
                      className={`opacity-30 ${sortBy === "sex" && sortOrder === "desc" ? "opacity-100 text-clinical-blue" : ""}`}
                    />
                  </div>
                </th>
                <th
                  onClick={() =>
                    !isBackgroundLoading && handleSort("dateOfBirth")
                  }
                  className={`px-6 py-4 h-14 mono-label text-[10px] text-on-surface-variant cursor-pointer hover:text-white hover:bg-white/5 transition-colors select-none ${isBackgroundLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    Age
                    <ChevronUp
                      size={10}
                      className={`opacity-30 ${sortBy === "dateOfBirth" && sortOrder === "asc" ? "opacity-100 text-clinical-blue" : ""}`}
                    />
                    <ChevronDown
                      size={10}
                      className={`opacity-30 ${sortBy === "dateOfBirth" && sortOrder === "desc" ? "opacity-100 text-clinical-blue" : ""}`}
                    />
                  </div>
                </th>
                <th
                  onClick={() => !isBackgroundLoading && handleSort("phone")}
                  className={`px-6 py-4 h-14 mono-label text-[10px] text-on-surface-variant cursor-pointer hover:text-white hover:bg-white/5 transition-colors select-none ${isBackgroundLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    Contact
                    <ChevronUp
                      size={10}
                      className={`opacity-30 ${sortBy === "phone" && sortOrder === "asc" ? "opacity-100 text-clinical-blue" : ""}`}
                    />
                    <ChevronDown
                      size={10}
                      className={`opacity-30 ${sortBy === "phone" && sortOrder === "desc" ? "opacity-100 text-clinical-blue" : ""}`}
                    />
                  </div>
                </th>
                <th className="px-6 py-4 h-14 mono-label text-[10px] text-on-surface-variant text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 h-16">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/5 rounded shrink-0" />
                        <div className="h-4 bg-white/5 w-32 rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-4 h-16">
                      <div className="h-4 bg-white/5 w-20 rounded" />
                    </td>
                    <td className="px-6 py-4 h-16">
                      <div className="h-4 bg-white/5 w-16 rounded" />
                    </td>
                    <td className="px-6 py-4 h-16">
                      <div className="h-4 bg-white/5 w-24 rounded" />
                    </td>
                    <td className="px-6 py-4 h-16">
                      <div className="h-4 bg-white/5 w-28 rounded" />
                    </td>
                    <td className="px-6 py-4 h-16 text-right">
                      <div className="h-4 bg-white/5 w-8 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : patients.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {patients.map((patient, index) => (
                    <tr
                      key={patient.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="hover:bg-surface-bright/5 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4 h-16">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-background border border-white/5 flex items-center justify-center font-bold text-clinical-blue text-[10px] uppercase shrink-0">
                            {patient.firstName[0]}
                            {patient.lastName[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white group-hover:text-clinical-blue transition-colors truncate">
                              {patient.firstName} {patient.lastName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 h-16">
                        <span className="data-value text-[10px] text-on-surface-variant uppercase">
                          PX-{patient.id.slice(-4)}
                        </span>
                      </td>
                      <td className="px-6 py-4 h-16">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                          {patient.sex}
                        </span>
                      </td>
                      <td className="px-6 py-4 h-16">
                        <span className="data-value text-[10px] text-on-surface-variant">
                          {calculateAge(patient.dateOfBirth)}
                        </span>
                      </td>
                      <td className="px-6 py-4 h-16">
                        <span className="text-[10px] text-on-surface-variant">
                          {patient.phone || "---"}
                        </span>
                      </td>
                      <td className="px-6 py-4 h-16 text-right">
                        <button className="text-on-surface-variant hover:text-white transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </AnimatePresence>
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-on-surface-variant uppercase tracking-widest text-[10px] font-bold"
                  >
                    No patients records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.lastPage > 1 && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="text-[10px] text-on-surface-variant uppercase font-bold">
                {isBackgroundLoading
                  ? "Loading..."
                  : `Showing ${patients.length} of ${meta.total} Records`}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[10px] text-clinical-blue hover:underline flex items-center gap-1"
                >
                  <X size={10} />
                  Clear Filters
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                disabled={page === 1 || isBackgroundLoading}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 bg-background border border-white/5 text-on-surface-variant hover:text-white disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page === meta.lastPage || isBackgroundLoading}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 bg-background border border-white/5 text-on-surface-variant hover:text-white disabled:opacity-30 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <RegisterPatientModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientListPage;
