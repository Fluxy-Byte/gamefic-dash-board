import { prisma } from "@/lib/prisma";

export async function getUserWithEmail(email: string) {
    return await prisma.user.findFirst({
        where: {
            email
        }
    })
}