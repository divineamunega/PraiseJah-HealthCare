import { Role } from "@prisma/client"
export const RoleCreationMap: Record<Role, Role[]> = {
  SUPER_ADMIN: [Role.ADMIN, Role.SECRETARY, Role.NURSE],
  ADMIN: [Role.ADMIN, Role.SECRETARY, Role.NURSE],
  DOCTOR: [Role.NURSE],
  NURSE: [],
  SECRETARY: []
}