import axios from "axios"
import type { Contact } from "@/lib/database.interface";

interface Result {
    status: boolean,
    contatos: Contact[]
    message: string
}

export async function getContacts(waba_id: string): Promise<Result> {
    try {
        const url = process.env.NEXT_API_URL_BACKEND ?? "https://fluxe-orquestrador.egnehl.easypanel.host";

        const { data } = await axios.get(
            `${url}/api/v1/contacts?waba_id=${waba_id}`
        )

        return data;
    } catch (e: any) {
        console.error(e);
        return {
            status: false,
            contatos: [],
            message: "Erro inesperado na consulta de wabas"
        }
    }
}
