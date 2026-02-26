"use client"


import { useEffect, useState } from "react";
import { z } from "zod"

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
import { toast } from "sonner"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Phone, BotMessageSquare } from "lucide-react";

import type { Waba, Agent } from "@/lib/database.interface";
import { updateWaba } from "@/app/services/waba";


interface Props {
    wabas: Waba[],
    agents: Agent[],
    organizationId: string
}

const createWabaSchema = z.object({
    phoneNumberId: z.string().min(1, "O ID do numero cadastrado precisa ser preenchido!"),
    displayPhoneNumber: z.string().min(1, "O numero do telefone precisa ser preenchido!"),
    idAgente: z.coerce.number().min(1, "É necessario selecionar um agente")
})

export default function Wabas(prosp: Props) {
    const [phoneNumberId, setPhoneNumberId] = useState("");
    const [displayPhoneNumber, setDisplayPhoneNumber] = useState("");
    const [idAgente, setIdAgente] = useState<number>();
    const [loading, setLoading] = useState(false)

    async function handleValidateAndSubmit() {
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
            setLoading(true);

            console.log(
                validation.data.phoneNumberId,
                validation.data.displayPhoneNumber,
                prosp.organizationId,
                validation.data.idAgente
            )

            const result = await updateWaba(
                validation.data.phoneNumberId,
                validation.data.displayPhoneNumber,
                prosp.organizationId,
                validation.data.idAgente
            );


            if (result?.waba) {
                toast.success("Waba atualizado com sucesso!");
            } else {
                toast.error("Erro ao atualizar o waba");
            }

        } catch (error) {
            toast.error("Erro ao tentar atualizar waba.");
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="flex justify-start items-center gap-2">
            {
                prosp.wabas.length > 0 && prosp.wabas.map((w) => (
                    <AlertDialog
                        key={w.id}
                        onOpenChange={(isOpen) => {
                            if (isOpen) {
                                setPhoneNumberId(w.phoneNumberId);
                                setDisplayPhoneNumber(w.displayPhoneNumber);
                                setIdAgente(w.agentId);
                            } else {
                                setPhoneNumberId("");
                                setDisplayPhoneNumber("");
                                setIdAgente(undefined);
                            }
                        }}
                    >
                        <AlertDialogTrigger asChild>
                            <Button className="gap-3">
                                <Phone />{w.displayPhoneNumber} <span className="flex gap-1 justify-center items-center">(<BotMessageSquare />{w.agent?.name} )</span>
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Waba - {w.displayPhoneNumber ?? "Numero de telefone não encontrado"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Preencha os dados abaixo para atualizar seu waba.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

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

                            <Select
                                value={idAgente ? String(idAgente) : ""}
                                onValueChange={(value) => setIdAgente(Number(value))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione um agente" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Agentes</SelectLabel>

                                        {prosp.agents.map((a) => (
                                            <SelectItem
                                                key={String(a.id)}
                                                value={String(a.id)}
                                            >
                                                {a.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={loading}>
                                    Cancelar
                                </AlertDialogCancel>

                                <AlertDialogAction
                                    onClick={handleValidateAndSubmit}
                                    disabled={loading}
                                >
                                    {loading ? "Atualizando..." : "Atualizar waba"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ))
            }
            {
                prosp.wabas.length == 0 && (
                    <div className="flex flex-col items-center justify-center h-auto space-y-4">
                        <div className="text-start">
                            <h3 className="text-lg font-semibold">Nenhum waba encontrada</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Comece criando seu primeira waba 📱🚀
                            </p>
                        </div>
                    </div>
                )
            }
        </div>
    )
}
