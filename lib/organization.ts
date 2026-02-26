import { prisma } from "@/lib/prisma";

export async function getOrganizationWithIdUser(id: string) {
    return await prisma.organization.findMany({
        where: {
            members: {
                some: {
                    userId: id
                }
            }
        }
    })
}

export async function getOrganizationWithIdUserAndId(id: string, userId: string) {
    return await prisma.organization.findFirst({
        where: {
            id,
            members: {
                some: {
                    userId
                }
            }
        }
    })
}

export async function createNewOrganization(
    name: string,
    slug: string,
    logo?: string
) {
    return await prisma.organization.create({
        data: {
            name,
            slug,
            logo
        }
    })
}

export async function updateOrganization(name: string, slug: string, idOrganization: string, logo?: string) {
    return await prisma.organization.update({
        where: { id: idOrganization },
        data: {
            name,
            slug,
            logo
        }
    })
}