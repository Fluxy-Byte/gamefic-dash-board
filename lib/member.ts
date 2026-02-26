import { prisma } from "@/lib/prisma";

export async function getMemberFilterUser(id: string) {
    return await prisma.member.findFirst({
        where: {
            userId: id
        }
    })
}

export async function createMember(organizationId: string, userId: string) {
    return await prisma.member.create({
        data: {
            organizationId,
            userId
        }
    })
}