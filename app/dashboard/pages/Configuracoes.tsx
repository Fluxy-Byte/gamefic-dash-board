"use client"

import { useEffect, useState } from "react";
import { z } from "zod";
import { useAppContext } from "@/app/services/context";
import { formatarDataBR } from "@/app/hooks/FormatDate";
import { createMember } from "@/app/services/member"
import Members from "@/app/dashboard/components/member";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item";
import { TriangleAlert } from "lucide-react";

import WabaComponent from "@/app/dashboard/components/wabas";
import AgentsComponent from "@/app/dashboard/components/agentes";

import { getOrganizationsFilterWithId } from "@/app/services/organizations";
import type { Organization } from "@/lib/organization.interface";

import { getWabas, createWaba } from "@/app/services/waba";

import { getMembers } from "@/app/services/member";
import type { Member } from "@/lib/member.interface";

import { getAgents, createAgent } from "@/app/services/agent";
import type { Agent } from "@/lib/database.interface";

const createWabaSchema = z.object({
    phoneNumberId: z.string().min(1, "O ID do numero cadastrado precisa ser preenchido!"),
    displayPhoneNumber: z.string().min(1, "O numero do telefone precisa ser preenchido!"),
    idAgente: z.coerce.number().min(1, "É necessario selecionar um agente"),
    idWabaMeta: z.string().min(1, "E necessário um id do waba"),
})

const createAgentSchema = z.object({
    name: z.string().min(1, "O nome do agente é obrigatório"),
    urlAgent: z.string().min(5, "A URL do agente é obrigatório"),
})

const createMemberSchema = z.object({
    email: z.string().min(1, "Necessário do e-mail do membro"),
    role: z.string().min(2, "Necessário do cargo do membro"),
})

export default function Configuracao() {
    const [organization, setOrganization] = useState<Organization | null>(null);

    const [agents, setAgents] = useState<Agent[]>([]);

    const [members, setMembers] = useState<Member[]>([]);

    const [name, setName] = useState<string>("");
    const [urlAgent, setUrlAgent] = useState<string>("");

    const [email, setEmail] = useState<string>("");
    const [role, setRole] = useState<string>("");

    const [phoneNumberId, setPhoneNumberId] = useState("");
    const [displayPhoneNumber, setDisplayPhoneNumber] = useState("");
    const [idAgente, setIdAgente] = useState<number>();
    const [idWabaMeta, setIdWabaMeta] = useState("");
    const { idOrganization, wabas, setWabas } = useAppContext();

    const [loading, setLoading] = useState(false);


    async function handleValidateAndSubmitCreateWaba() {
        const validation = createWabaSchema.safeParse({
            phoneNumberId,
            displayPhoneNumber,
            idAgente,
            idWabaMeta
        })

        if (!validation.success) {
            const errorMessage = validation.error.message
            toast.error(errorMessage || "Erro de validação")
            return
        }

        try {
            setLoading(true)

            if (!idOrganization) {
                toast.info("Houve um erro durante a criação do seu waba")
                return;
            }

            const body = {
                phoneNumberId: validation.data.phoneNumberId,
                displayPhoneNumber: validation.data.displayPhoneNumber,
                idAgente: validation.data.idAgente,
                idOrganization: idOrganization,
                id_waba_meta: validation.data.idWabaMeta
            }

            const result = await createWaba(body.phoneNumberId, body.displayPhoneNumber, body.idOrganization, body.idAgente, body.id_waba_meta);

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
            const errorMessage = validation.error.message
            toast.error(errorMessage || "Erro de validação")
            return
        }

        if (!idOrganization) {
            toast.info("Houve um erro durante a criação do seu waba")
            return;
        }

        try {
            setLoading(true)

            const body = {
                name: validation.data.name,
                url: validation.data.urlAgent,
                idOrganization: idOrganization
            }

            const result = await createAgent(body.name, body.url, body.idOrganization)

            if (result.agent) {
                toast.info("Agente criado com sucesso.")
            } else {
                toast.info("Houve um erro durante a criação do seu agente.")
            }

            setName("");
            setUrlAgent("");
        } catch (e: any) {
            toast.error("Erro ao tentar criar agente.");
        } finally {
            setLoading(false);
        }
    }

    async function handleValidateAndSubmitAddMember() {
        const validation = createMemberSchema.safeParse({
            email,
            role,
        })

        if (!validation.success) {
            const errorMessage = validation.error.message
            toast.error(errorMessage || "Erro de validação.")
            return
        }

        if (!idOrganization) {
            toast.info("Houve um erro durante a solicitação de adicionar o membro a organização.")
            return;
        }

        try {
            setLoading(true)

            const result = await createMember(validation.data.email, validation.data.role, idOrganization)

            if (result.member) {
                toast.info("Membro adicionado com sucesso.")
            } else {
                toast.info("Houve um erro ao tentar adicionar o membro.")
            }

            setName("");
            setUrlAgent("");
        } catch (e: any) {
            toast.error("Houve um erro ao tentar adicionar o membro.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (idOrganization) {
            async function loadOrganization() {
                try {
                    const result = await getOrganizationsFilterWithId(idOrganization!)
                    if (result.organization) {
                        setOrganization(result.organization)
                    }
                } catch (e) {
                    console.error(e)
                }
            }
            loadOrganization()
        }

    }, [idOrganization])

    useEffect(() => {
        if (idOrganization) {
            async function loadDados() {
                try {
                    const resultWabas = await getWabas(idOrganization!)
                    if (resultWabas.wabas) {
                        setWabas(resultWabas.wabas)
                    }

                    const resultAgents = await getAgents(idOrganization!);
                    if (resultAgents.agent) {
                        console.log(resultAgents.agent)
                        setAgents(resultAgents.agent)
                    }

                    const resultMembers = await getMembers(idOrganization!);
                    if (resultMembers.members) {
                        setMembers(resultMembers.members)
                    }
                } catch (e) {
                    console.error(e)
                }
            }
            loadDados()
        }

    }, [idOrganization])

    return (
        <main>
            <div className="space-y-8 px-5">

                <Card>
                    <CardContent className="flex flex-col gap-2">
                        <h1 className="text-xl font-bold tracking-tight">
                            {organization?.name ?? "Minha organização"}
                        </h1>
                        <p className="text-sm text-neutral-400">
                            Criado em: {formatarDataBR(String(organization?.createdAt)) ?? ""}
                        </p>
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader>
                        <div className="flex justify-between">

                            <div className="flex flex-col gap-2">
                                <CardTitle>Seus números ativos</CardTitle>
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
                                            placeholder="Numero do ID do WABA"
                                            value={idWabaMeta}
                                            onChange={(e) => setIdWabaMeta(e.target.value)}
                                        />

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
                        <WabaComponent agents={agents} organizationId={idOrganization!} wabas={wabas} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between">

                            <div className="flex flex-col gap-2">
                                <CardTitle>Seus agentes</CardTitle>
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
                        <AgentsComponent agents={agents} organizationId={idOrganization!} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between">

                            <div className="flex flex-col gap-2">
                                <CardTitle>Membros</CardTitle>
                                <CardDescription>
                                    Configure seus agentes para definir qual waba ele vai atender
                                </CardDescription>
                            </div>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button>Inserir membro</Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Inserir novo membro
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Preencha o email do usuario para acessar essa organização.  <strong className="text-neutral-300">Lembrando que e necessario que ele esteja com sua conta criada na plataforma</strong>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <div className="flex flex-col gap-3">
                                        <Input
                                            placeholder="E-mail do membro"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <Select value={role} onValueChange={(value) => setRole(value)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Selecio o cargo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Cargos</SelectLabel>
                                                    <SelectItem value="admin">Adiministrador</SelectItem>
                                                    <SelectItem value="user">Usuario</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={loading}>
                                            Cancelar
                                        </AlertDialogCancel>

                                        <AlertDialogAction
                                            onClick={handleValidateAndSubmitAddMember}
                                            disabled={loading}
                                        >
                                            {loading ? "Adicionando..." : "Adicionar"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Members members={members} organizationId={idOrganization!} />
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}