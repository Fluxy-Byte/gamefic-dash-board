import type { Invitation } from "@/lib/invitation.interface"
import type { Member } from "@/lib/member.interface"

export interface Organization {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    metadata?: string | null;
    createdAt: Date;
    updatedAt: Date;

    invitations?: Invitation[];
    members?: Member[];
}