import axios from "axios"
import type { Waba } from "@/lib/database.interface";

interface Result {
    status: boolean,
    wabas: Waba[]
    message: string
}

interface ResultSimple {
    status: boolean,
    waba: Waba | null
    message: string
}

export async function getWabas(id: string): Promise<Result> {
    try {
        const url = process.env.NEXT_API_URL_BACKEND ?? "https://gamefic-orquestrador.egnehl.easypanel.host";

        const { data } = await axios.get(
            `${url}/api/v1/list-wabas?organization_id=${id}`
        )
        console.log(data)
        return data;
    } catch (e: any) {
        console.error(e);
        return {
            status: false,
            wabas: [],
            message: "Erro inesperado na consulta de wabas"
        }
    }
}

export async function createWaba(phone_number_id: string, display_phone_number: string, idOrganization: string, idAgente: number): Promise<ResultSimple> {
    try {
        const url = process.env.NEXT_API_URL_BACKEND ?? "https://gamefic-orquestrador.egnehl.easypanel.host";

        const { data } = await axios.post(
            `${url}/api/v1/waba`,
            {
                "phone_number_id": phone_number_id,
                "display_phone_number": display_phone_number,
                "idOrganization": idOrganization,
                "idAgente": idAgente
            }
        )

        return data;
    } catch (e: any) {
        console.error(e);
        return {
            status: false,
            waba: null,
            message: "Erro inesperado na criação do wabas"
        }
    }
}

export async function updateWaba(phone_number_id: string, display_phone_number: string, idOrganization: string, idAgente: number): Promise<ResultSimple> {
    try {
        const url = process.env.NEXT_API_URL_BACKEND ?? "https://gamefic-orquestrador.egnehl.easypanel.host";

        const { data } = await axios.put(
            `${url}/api/v1/waba?phone_number_id=${phone_number_id}`,
            {
                "displayPhoneNumber": display_phone_number,
                "organizationId": idOrganization,
                "agentId": idAgente
            }
        )

        return data;
    } catch (e: any) {
        console.error(e);
        return {
            status: false,
            waba: null,
            message: "Erro inesperado na atualização do waba"
        }
    }
}