import axios from "axios";

interface Templates {
    status: boolean,
    templates: any[],
    mensagem: string
}

export async function getTemplates(phoneNumberId: string): Promise<Templates> {
    try {
        const { data } = await axios.get(`https://gamefic-orquestrador.egnehl.easypanel.host/api/v1/templates?phoneNumberId=${phoneNumberId}`);
        console.log(data)
        return data;
    } catch (e: any) {
        return {
            status: false,
            templates: [],
            mensagem: "Erro interno no servidor"
        }
    }
}