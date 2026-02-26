import axios from "axios"

export interface Result {
    status: boolean,
    historico: Message[]
    message: string
}

export interface Message {
    id_user: String
    id_agent: String
    type_message: String
    question_message: String
    answer_message: String
    date_recept_message: Date
    date_send_message: Date,
    status_message: String
}

export async function getMessage(idUser: string, idAgente: string): Promise<Result> {
    try {
        // const url = process.env.NEXT_API_URL_BACKEND ?? "https://fluxe-orquestrador.egnehl.easypanel.host";
        const url = process.env.NEXT_PUBLIC_API_URL ?? "https://fluxy.egnehl.easypanel.host";
        const urlTeste = `${url}/api/historico?user=${idUser}&agent=${idAgente}`
        console.log(urlTeste)
        const { data } = await axios.get(
            urlTeste
        )

        return data;
    } catch (e: any) {
        console.error(e);
        return {
            status: false,
            historico: [],
            message: "Erro inesperado na consulta de mensagens"
        }
    }
}