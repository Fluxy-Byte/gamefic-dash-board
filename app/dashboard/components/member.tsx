"use client"

import { useState } from "react";
import { z } from "zod";
import { updateMember } from "@/app/services/member"
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
} from "@/components/ui/select"

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

import type { Member } from "@/lib/member.interface";

interface Props {
    members: Member[];
    organizationId: string;
}

const updateMemberOrganization = z.object({
    role: z.string().min(1, "O tipo de acesso do membro é obrigatório")
});

export default function Members(props: Props) {
    const [role, setRole] = useState("user");
    const [member, setMember] = useState<Member | null>(null)
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    function handleOpenAgent(member: Member) {
        setRole(member.role);
    }

    async function handleValidateAndSubmitUpdateAgent() {
        const validation = updateMemberOrganization.safeParse({
            role
        });

        if (!validation.success) {
            toast.error(validation.error.message || "Erro de validação");
            return;
        }

        if (!member) {
            toast.error("Erro interno no serviço");
            return;
        }

        try {
            setLoading(true);

            const result = await updateMember(
                role,
                props.organizationId,
                member?.id
            );

            if (result.member) {
                toast.success("Membro atualizado com sucesso!");
            } else {
                toast.error("Erro ao atualizar o membro");
            }

        } catch (error) {
            toast.error("Erro ao tentar atualizar membro.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-wrap gap-2">
            {props.members.length > 0 ? (
                props.members.map((members: Member) => (
                    <AlertDialog
                        key={members.id}
                        open={open}
                        onOpenChange={(isOpen) => {
                            setOpen(isOpen);
                            if (isOpen) {
                                setMember(members)
                            }
                        }}
                    >
                        <AlertDialogTrigger asChild>
                            <Button onClick={() => handleOpenAgent(members)}>
                                <User />
                                {members.user?.name}
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Atualizar agente</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Atualize os dados do agente <b>{members.user?.name}</b>.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <div className="flex flex-col gap-3">
                                <Select onValueChange={(value) => setRole(value)}>
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
                    <h3 className="text-lg font-semibold">Nenhum membro encontrado.</h3>
                    <p className="text-sm text-muted-foreground">
                        Comece adicionando seu primeiro membro.
                    </p>
                </div>
            )}
        </div>
    );
}