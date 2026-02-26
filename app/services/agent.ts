import axios from "axios"
import type { Agent } from "@/lib/database.interface";

interface Result {
    status: boolean,
    agent: Agent[]
    message: string
}

interface ResultSimple {
    status: boolean,
    agent: Agent | null
    message: string
}

export async function getAgents(organization_id: string): Promise<Result> {
    try {
        const url = process.env.NEXT_API_URL_BACKEND ?? "https://fluxe-orquestrador.egnehl.easypanel.host";

        const { data } = await axios.get(
            `${url}/api/v1/agent?organization_id=${organization_id}`
        )

        return data;
    } catch (e: any) {
        console.error(e);
        return {
            status: false,
            agent: [],
            message: "Erro inesperado na consulta de wabas"
        }
    }
}

export async function createAgent(name: string, urlAgente: string, idOrganization: string): Promise<ResultSimple> {
    console.log(name, urlAgente, idOrganization)
    try {
        const url = process.env.NEXT_API_URL_BACKEND ?? "https://fluxe-orquestrador.egnehl.easypanel.host";

        const { data } = await axios.post(
            `${url}/api/v1/agent`,
            {
                "name": name,
                "url": urlAgente,
                "organizationId": idOrganization
            }
        )

        return data;
    } catch (e: any) {
        console.error(e);
        return {
            status: false,
            agent: null,
            message: "Erro inesperado na criação do wabas"
        }
    }
}

export async function updateAgent(name: string, urlAgente: string, mensagem: string, idOrganization: string, idAgente: string): Promise<ResultSimple> {
    try {
        const url = process.env.NEXT_API_URL_BACKEND ?? "https://fluxe-orquestrador.egnehl.easypanel.host";

        const { data } = await axios.put(
            `${url}/api/v1/agent?id_agent=${idAgente}`,
            {
                "name": name,
                "url": urlAgente,
                "mensagem": mensagem,
                "organizationId": idOrganization
            }
        )

        return data;
    } catch (e: any) {
        console.error(e);
        return {
            status: false,
            agent: null,
            message: "Erro inesperado na atualização do agente"
        }
    }
}