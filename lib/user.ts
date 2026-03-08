import { prisma } from "@/lib/prisma";

export async function getUserWithEmail(email: string) {
    return await prisma.user.findFirst({
        where: {
            email
        }
    })
}

export async function updateRoleUser(idUSer: string, role: string) {
    return await prisma.user.update({
        where: {
            id: idUSer
        },
        data: {
            role
        }
    })
}