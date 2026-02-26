"use client"

import { useEffect, useState } from "react"
import { z } from "zod"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item"
import { TriangleAlert } from "lucide-react"

import WabaComponent from "@/app/dashboard/configurations/components/wabas"
import AgentsComponent from "@/app/dashboard/configurations/components/agentes"

import { getOrganizationsFilterWithId } from "@/app/services/organizations"
import type { Organization } from "@/lib/organization.interface"

import { getWabas, createWaba } from "@/app/services/waba";
import type { Waba } from "@/lib/database.interface"

import { getAgents, createAgent } from "@/app/services/agent"
import type { Agent } from "@/lib/database.interface"

const createWabaSchema = z.object({
    phoneNumberId: z.string().min(1, "O ID do numero cadastrado precisa ser preenchido!"),
    displayPhoneNumber: z.string().min(1, "O numero do telefone precisa ser preenchido!"),
    idAgente: z.coerce.number().min(1, "É necessario selecionar um agente")
})

const createAgentSchema = z.object({
    name: z.string().min(1, "O nome do agente é obrigatório"),
    urlAgent: z.string().min(5, "A URL do agente é obrigatório"),
})

export default function Details({ id }: { id: string }) {
    const [organization, setOrganization] = useState<Organization | null>(null)
    const [wabas, setWabas] = useState<Waba[]>([])
    const [agents, setAgents] = useState<Agent[]>([])

    const [name, setName] = useState("");
    const [urlAgent, setUrlAgent] = useState("");

    const [phoneNumberId, setPhoneNumberId] = useState("");
    const [displayPhoneNumber, setDisplayPhoneNumber] = useState("");
    const [idAgente, setIdAgente] = useState<number>();


    const [loading, setLoading] = useState(false);


    async function handleValidateAndSubmitCreateWaba() {
        const validation = createWabaSchema.safeParse({
            phoneNumberId,
            displayPhoneNumber,
            idAgente
        })

        if (!validation.success) {
            const errorMessage = validation.error.errors[0]?.message
            toast.error(errorMessage || "Erro de validação")
            return
        }

        try {
            setLoading(true)

            const body = {
                phoneNumberId: validation.data.phoneNumberId,
                displayPhoneNumber: validation.data.displayPhoneNumber,
                idAgente: validation.data.idAgente,
                idOrganization: id
            }

            const result = await createWaba(body.phoneNumberId, body.displayPhoneNumber, body.idOrganization, body.idAgente);

            if (result.waba) {
                toast.info("Waba criado com sucesso!")
            } else {
                toast.info("Houve um erro durante a criação do seu waba")
            }

            setName("");
            setUrlAgent("");
        } catch (e: any) {
            toast.error("Erro ao tentar criar agente.");
        } finally {
            setLoading(false);
        }
    }

    async function handleValidateAndSubmitCreateAgent() {
        const validation = createAgentSchema.safeParse({
            name,
            urlAgent,
        })

        if (!validation.success) {
            const errorMessage = validation.error.errors[0]?.message
            toast.error(errorMessage || "Erro de validação")
            return
        }

        try {
            setLoading(true)

            const body = {
                name: validation.data.name,
                url: validation.data.urlAgent,
                idOrganization: id
            }

            const result = await createAgent(body.name, body.url, body.idOrganization)

            if (result.agent) {
                toast.info("Agente criado com sucesso!")
            } else {
                toast.info("Houve um erro durante a criação do seu agente")
            }

            setName("");
            setUrlAgent("");
        } catch (e: any) {
            toast.error("Erro ao tentar criar agente.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (id) {
            async function loadOrganization() {
                try {
                    const result = await getOrganizationsFilterWithId(id)
                    if (result.organization) {
                        setOrganization(result.organization)
                    }
                } catch (e) {
                    console.error(e)
                }
            }
            loadOrganization()
        }

    }, [id])

    useEffect(() => {
        if (organization) {
            async function loadDados() {
                try {
                    const resultWabas = await getWabas(id)
                    if (resultWabas.wabas) {
                        setWabas(resultWabas.wabas)
                    }

                    const resultAgents = await getAgents(id);
                    if (resultAgents.agent) {
                        console.log(resultAgents.agent)
                        setAgents(resultAgents.agent)
                    }
                } catch (e) {
                    console.error(e)
                }
            }
            loadDados()
        }

    }, [organization])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Gerenciando {organization?.name ?? "uma organização"}
                    </h1>
                    <p className="text-muted-foreground">
                        Gerencie suas configurações de Waba e agentes de IA
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between">

                        <div className="flex flex-col gap-2">
                            <CardTitle>Seus números ativos 📱</CardTitle>
                            <CardDescription>
                                Configure seus numeros e waba de atendimento
                            </CardDescription>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button>Criar waba</Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Criar nova waba
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Preencha os dados abaixo para criar sua waba.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <div className="flex flex-col gap-3">
                                    {
                                        agents.length == 0 && (
                                            <Item variant="muted">
                                                <ItemMedia variant="icon">
                                                    <TriangleAlert color="#ff0000" />
                                                </ItemMedia>
                                                <ItemContent>
                                                    <ItemTitle>Atenção</ItemTitle>
                                                    <ItemDescription>
                                                        Necessário criar um agente para criar um waba.
                                                    </ItemDescription>
                                                </ItemContent>
                                            </Item>
                                        )
                                    }

                                    <Input
                                        placeholder="ID do numero cadastrado na Meta"
                                        value={phoneNumberId}
                                        onChange={(e) => setPhoneNumberId(e.target.value)}
                                    />

                                    <Input
                                        placeholder="Numero do telefone do agente"
                                        value={displayPhoneNumber}
                                        onChange={(e) => setDisplayPhoneNumber(e.target.value)}
                                    />

                                    <Select onValueChange={(a) => setIdAgente(Number(a))}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecione um agente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Agentes</SelectLabel>
                                                {
                                                    agents.map((a) => (
                                                        <SelectItem key={String(a.id)} value={String(a.id)}>{a.name}</SelectItem>
                                                    ))
                                                }
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>

                                </div>

                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={loading}>
                                        Cancelar
                                    </AlertDialogCancel>

                                    <AlertDialogAction
                                        onClick={handleValidateAndSubmitCreateWaba}
                                        disabled={loading || agents.length == 0}
                                    >
                                        {loading ? "Criando..." : "Criar waba"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>

                <CardContent>
                    <WabaComponent agents={agents} organizationId={id} wabas={wabas} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between">

                        <div className="flex flex-col gap-2">
                            <CardTitle>Seus agentes 🤖</CardTitle>
                            <CardDescription>
                                Configure seus agentes para definir qual waba ele vai atender
                            </CardDescription>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button>Criar agente</Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Criar novo agente
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Preencha os dados abaixo para criar seu agente.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <div className="flex flex-col gap-3">
                                    <Input
                                        placeholder="Nome do agente"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />

                                    <Input
                                        placeholder="URL do agente"
                                        value={urlAgent}
                                        onChange={(e) => setUrlAgent(e.target.value)}
                                    />
                                </div>

                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={loading}>
                                        Cancelar
                                    </AlertDialogCancel>

                                    <AlertDialogAction
                                        onClick={handleValidateAndSubmitCreateAgent}
                                        disabled={loading}
                                    >
                                        {loading ? "Criando..." : "Criar agente"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>

                <CardContent>
                    <AgentsComponent agents={agents} organizationId={id} />
                </CardContent>
            </Card>
        </div>
    )
}