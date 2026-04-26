import { Role } from '@prisma/client';
export const RoleCreationMap: Record<Role, Role[]> = {
  SUPER_ADMIN: [
    Role.SUPER_ADMIN,
    Role.ADMIN,
    Role.SECRETARY,
    Role.NURSE,
    Role.DOCTOR,
    Role.LAB_SCIENTIST,
  ],
  ADMIN: [Role.SECRETARY, Role.NURSE, Role.DOCTOR, Role.LAB_SCIENTIST],
  DOCTOR: [Role.NURSE],
  NURSE: [],
  SECRETARY: [],
  LAB_SCIENTIST: [],
};
