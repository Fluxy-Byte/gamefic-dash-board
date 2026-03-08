import { prisma } from "@/lib/prisma";

export async function getMemberFilterUser(id: string) {
    return await prisma.member.findFirst({
        where: {
            userId: id
        },
        include: {
            user: true,
            organization: true
        }
    })
}

export async function getMembersFilterIdOrganization(id_organization: string) {
    return await prisma.member.findMany({
        where: {
            organizationId: id_organization
        },
        include: {
            user: true,
            organization: true
        }
    })

}

export async function createMember(organizationId: string, role: string, userId: string) {
    return await prisma.member.create({
        data: {
            organizationId,
            userId,
            role
        }
    })
}

export async function updateMember(role: string, idOrganization: string, idMember: string) {
    return await prisma.member.update({
        where: {
            id: idMember,
            organizationId: idOrganization
        },
        data: {
            role,
        }
    })
}