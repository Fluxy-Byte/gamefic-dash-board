export function formatarDataBR(dataString: string): string {
    if (!dataString) return ""
    const data = new Date(dataString.replace(" ", "T"))

    if (isNaN(data.getTime())) return ""

    const dia = String(data.getDate()).padStart(2, "0")
    const mes = String(data.getMonth() + 1).padStart(2, "0")
    const ano = data.getFullYear()

    const hora = String(data.getHours()).padStart(2, "0")
    const minuto = String(data.getMinutes()).padStart(2, "0")
    const segundo = String(data.getSeconds()).padStart(2, "0")

    return `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`
}