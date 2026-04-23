import React, { useState } from "react";
import { UserPlus, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useCreatePatient } from "../hooks/usePatients";
import { type Sex } from "../api/patients.api";

interface RegisterPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterPatientModal = ({
  isOpen,
  onClose,
}: RegisterPatientModalProps) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    sex: "MALE" as Sex,
    phone: "",
    address: "",
  });

  const createPatient = useCreatePatient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPatient.mutateAsync(formData, {
      onSuccess: () => {
        onClose();
        setFormData({
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          sex: "MALE",
          phone: "",
          address: "",
        });
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-surface-container-low border border-white/5 p-8 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-white uppercase tracking-tighter flex items-center gap-2">
            <UserPlus size={20} className="text-clinical-blue" />
            Patient Registration
          </h2>
          <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">
            Surgical Governance Protocol v4.2
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="mono-label text-[10px] text-on-surface-variant">
                First Name
              </label>
              <input
                required
                className="w-full bg-background border border-white/5 p-3 text-sm text-white focus:border-clinical-blue outline-none transition-colors"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, firstName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="mono-label text-[10px] text-on-surface-variant">
                Last Name
              </label>
              <input
                required
                className="w-full bg-background border border-white/5 p-3 text-sm text-white focus:border-clinical-blue outline-none transition-colors"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, lastName: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="mono-label text-[10px] text-on-surface-variant">
                Date of Birth
              </label>
              <input
                required
                type="date"
                className="w-full bg-background border border-white/5 p-3 text-sm text-white focus:border-clinical-blue outline-none transition-colors [color-scheme:dark]"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, dateOfBirth: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <label className="mono-label text-[10px] text-on-surface-variant">
                Sex
              </label>
              <select
                required
                className="w-full bg-background border border-white/5 p-3 text-sm text-white focus:border-clinical-blue outline-none transition-colors"
                value={formData.sex}
                onChange={(e) =>
                  setFormData((d) => ({ ...d, sex: e.target.value as Sex }))
                }
              >
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="mono-label text-[10px] text-on-surface-variant">
              Phone Number (Optional)
            </label>
            <input
              className="w-full bg-background border border-white/5 p-3 text-sm text-white focus:border-clinical-blue outline-none transition-colors"
              placeholder="+234..."
              value={formData.phone}
              onChange={(e) =>
                setFormData((d) => ({ ...d, phone: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1">
            <label className="mono-label text-[10px] text-on-surface-variant">
              Residential Address (Optional)
            </label>
            <textarea
              className="w-full bg-background border border-white/5 p-3 text-sm text-white focus:border-clinical-blue outline-none transition-colors min-h-[80px]"
              value={formData.address}
              onChange={(e) =>
                setFormData((d) => ({ ...d, address: e.target.value }))
              }
            />
          </div>

          <button
            type="submit"
            disabled={createPatient.isPending}
            className="w-full bg-clinical-blue py-4 text-xs font-bold text-white hover:bg-clinical-blue/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {createPatient.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                REGISTERING...
              </>
            ) : (
              "AUTHORIZE REGISTRATION"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterPatientModal;
