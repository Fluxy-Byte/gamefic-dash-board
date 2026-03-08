import axios from "axios"
import type { Member } from "@/lib/member.interface";

export interface Result {
    status: boolean,
    members: Member[]
    message: string
}

export interface ResultFilter {
    status: boolean,
    member: Member | null
    message: string
}

export async function getMembers(idOrganization: string): Promise<Result> {
    try {
        const url = process.env.NEXT_PUBLIC_API_URL ?? "https://gamefic.egnehl.easypanel.host";

        const { data } = await axios.get(
            `${url}/api/member/${idOrganization}`,
            {
                withCredentials: true,
            }
        )

        return data;
    } catch (e: any) {
        console.error(e);
        return {
            status: false,
            members: [],
            message: "Erro inesperado na consulta de organizações"
        }
    }
}


export async function createMember(email: string, role: string, idOrganization: string): Promise<ResultFilter> {
    try {
        const url = process.env.NEXT_PUBLIC_API_URL ?? "https://gamefic.egnehl.easypanel.host";

        const { data } = await axios.post(
            `${url}/api/member`,
            {
                email, idOrganization, role
            },
            {
                withCredentials: true,
            }
        )

        return data;
    } catch (e: any) {
        console.error(e);
        return {
            status: false,
            member: null,
            message: "Erro inesperado no cadastro da organização"
        }
    }
}

export async function updateMember(role: string, idOrganization: string, idMember: string): Promise<ResultFilter> {
    try {
        const url = process.env.NEXT_PUBLIC_API_URL ?? "https://gamefic.egnehl.easypanel.host";

        const { data } = await axios.put(
            `${url}/api/member`,
            {
                role,
                idOrganization,
                idMember
            },
            {
                withCredentials: true,
            }
        )

        return data;
    } catch (e: any) {
        console.error(e);
        return {
            status: false,
            member: null,
            message: "Erro inesperado no update da organização"
        }
    }
}