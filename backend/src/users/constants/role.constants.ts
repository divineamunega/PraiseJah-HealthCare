import { Role } from '@prisma/client';
export const RoleCreationMap: Record<Role, Role[]> = {
  SUPER_ADMIN: [Role.SUPER_ADMIN, Role.ADMIN, Role.SECRETARY, Role.NURSE, Role.DOCTOR],
  ADMIN: [Role.SECRETARY, Role.NURSE, Role.DOCTOR],
  DOCTOR: [Role.NURSE],
  NURSE: [],
  SECRETARY: [],
};
