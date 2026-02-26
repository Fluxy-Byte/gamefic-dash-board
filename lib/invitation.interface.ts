import type { Organization } from "@/lib/organization.interface"
import type { User } from "@/lib/user.interface"

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date;
  inviterId: string;
  createdAt: Date;
  updatedAt: Date;

  inviter?: User;
  organization?: Organization;
}
