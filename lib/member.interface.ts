import type { User } from "@/lib/user.interface"
import type { Organization } from "@/lib/organization.interface"


export interface Member {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;

  organization?: Organization;
  user?: User;
}

