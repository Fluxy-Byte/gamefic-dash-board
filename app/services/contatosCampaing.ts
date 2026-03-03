import axios from "axios"
import type { Campanha, ContatosCampanha } from "@/lib/database.interface";

interface Result {
    status: boolean,
    contatos: ContatosCampanha[]
    message: string,
    error: string | null
}

interface ResultSimple {
    status: boolean,
    waba: ContatosCampanha | null
    message: string
}

export async function getContactsCampaing(idCampaing: string): Promise<Result> {
    try {
        const url = process.env.NEXT_API_URL_BACKEND ?? "https://gamefic-orquestrador.egnehl.easypanel.host";

        const { data } = await axios.get(
            `${url}/api/v1/contacts-campaing?idCampanha=${idCampaing}`
        )

        return data;
    } catch (e: any) {
        console.error(e);
        return {
            status: false,
            contatos: [],
            message: "Erro inesperado na consulta de contatos da campanha",
            error: e.message || "Erro desconhecido"
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