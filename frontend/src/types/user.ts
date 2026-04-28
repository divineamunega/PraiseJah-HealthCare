export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "DOCTOR"
  | "NURSE"
  | "SECRETARY"
  | "LAB_SCIENTIST"
  | "PHARMACIST";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}
