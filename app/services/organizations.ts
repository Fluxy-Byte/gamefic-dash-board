import axios from "axios"
import type { Organization } from "@/lib/organization.interface";

export interface Result {
    status: boolean,
    organizations: Organization[]
    message: string
}

export interface ResultFilter {
    status: boolean,
    organization: Organization | null
    message: string
}

export async function getOrganizations(): Promise<Result> {
    try {
        const url = process.env.NEXT_PUBLIC_API_URL ?? "https://fluxy.egnehl.easypanel.host";

        const { data } = await axios.get(
            `${url}/api/organization`,
            {
                withCredentials: true,
            }
        )

        return data;
    } catch (e: any) {
        console.error(e);
        return {
            status: false,
            organizations: [],
            message: "Erro inesperado na consulta de organizações"
        }
    }
}

export async function getOrganizationsFilterWithId(id: string): Promise<ResultFilter> {
    try {
        const url = process.env.NEXT_PUBLIC_API_URL ?? "https://fluxy.egnehl.easypanel.host";

        const { data } = await axios.get(
            `${url}/api/organization/${id}`,
            {
                withCredentials: true,
            }
        )

        return data;
    } catch (e: any) {
        console.error(e);
        return {
            status: false,
            organization: null,
            message: "Erro inesperado na consulta de organizações"
        }
    }
}

export async function createOrganizations(name: string, slug: string, logo: string): Promise<ResultFilter> {
    try {
        const url = process.env.NEXT_PUBLIC_API_URL ?? "https://fluxy.egnehl.easypanel.host";

        const { data } = await axios.post(
            `${url}/api/organization`,
            {
                name,
                slug,
                logo
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
            organization: null,
            message: "Erro inesperado no cadastro da organização"
        }
    }
}

export async function updateOrganizations(name: string, slug: string, idOrganization: string, logo: string): Promise<ResultFilter> {
    try {
        const url = process.env.NEXT_PUBLIC_API_URL ?? "https://fluxy.egnehl.easypanel.host";

        const { data } = await axios.put(
            `${url}/api/organization`,
            {
                name,
                slug,
                idOrganization,
                logo
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
            organization: null,
            message: "Erro inesperado no update da organização"
        }
    }
}