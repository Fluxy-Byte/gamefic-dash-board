"use client"

import { useState } from "react";
import { z } from "zod";

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

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BotMessageSquare } from "lucide-react";

import type { Agent } from "@/lib/database.interface";
import { updateAgent } from "@/app/services/agent";
import { StringXor } from "next/dist/compiled/webpack/webpack";

interface Props {
    agents: Agent[];
    organizationId: string;
}

const updateAgentSchema = z.object({
    name: z.string().min(1, "O nome do agente é obrigatório"),
    urlAgent: z.string().min(5, "A URL do agente é obrigatória"),
    idAgent: z.string().min(1, "Erro interno"),
});

export default function Agentes(props: Props) {
    const [name, setName] = useState("");
    const [urlAgent, setUrlAgent] = useState("");
    const [idAgent, setIdAgent] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    function handleOpenAgent(agent: Agent) {
        setName(agent.name);
        setUrlAgent(agent.url);
        setIdAgent(String(agent.id));
    }

    async function handleValidateAndSubmitUpdateAgent() {
        const validation = updateAgentSchema.safeParse({
            name,
            urlAgent,
            idAgent,
        });

        if (!validation.success) {
            toast.error(validation.error.errors[0]?.message || "Erro de validação");
            return;
        }

        try {
            setLoading(true);

            const result = await updateAgent(
                validation.data.name,
                validation.data.urlAgent,
                "",
                props.organizationId,
                validation.data.idAgent
            );

            if (result?.agent) {
                toast.success("Agente atualizado com sucesso!");
            } else {
                toast.error("Erro ao atualizar o agente");
            }

        } catch (error) {
            toast.error("Erro ao tentar atualizar agente.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-wrap gap-2">
            {props.agents.length > 0 ? (
                props.agents.map((agent) => (
                    <AlertDialog
                        key={agent.id}
                        open={open}
                        onOpenChange={(isOpen) => {
                            setOpen(isOpen);
                            if (isOpen) {
                                setName(agent.name);
                                setUrlAgent(agent.url);
                                setIdAgent(String(agent.id));
                            }
                        }}
                    >
                        <AlertDialogTrigger asChild>
                            <Button onClick={() => handleOpenAgent(agent)}>
                                <BotMessageSquare />
                                {agent.name}
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Atualizar agente</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Atualize os dados do agente <b>{agent.name}</b>.
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
                                    onClick={handleValidateAndSubmitUpdateAgent}
                                    disabled={loading}
                                >
                                    {loading ? "Atualizando..." : "Atualizar agente"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ))
            ) : (
                <div className="flex flex-col items-start space-y-2">
                    <h3 className="text-lg font-semibold">Nenhum agente encontrado</h3>
                    <p className="text-sm text-muted-foreground">
                        Comece criando seu primeiro agente 🤖🚀
                    </p>
                </div>
            )}
        </div>
    );
}