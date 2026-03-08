import type { Waba, Contact } from "@/lib/database.interface";
import { useState } from "react";

import type { Result, Message } from "@/app/services/message";
import { getMessage } from "@/app/services/message";
import { toast } from "sonner";

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    MessageCircle,
    Users,
    Phone,
    Loader2,
    Clock,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DisparoAtivoModalProps {
    waba: Waba,
    filteredContacts: Contact[]
}

export default function TableContacts({
    waba,
    filteredContacts
}: DisparoAtivoModalProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    async function coletarMensages(userId: string, agenteId: string) {
        setIsLoadingMessages(true);
        try {
            const result: Result = await getMessage(userId, agenteId);
            console.log(result)
            setMessages(result.historico);

            if (result.status == false) {
                toast.error(result.message)
            }

        } catch (e: any) {
            console.error(e);
            toast.error("Tivemos um erro na busca das mensagens desse contato!")
            setMessages([]);
        } finally {
            setIsLoadingMessages(false);
        }
    }

    const formatDateTime = (date: string | undefined) => {
        if (!date) return "Data não disponível";
        try {
            const d = new Date(date);
            return d.toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });
        } catch (e) {
            return date;
        }
    }


    // Pagination logic
    const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };
    return (
        <>
            <Card className="px-4 py-2">
                <Table className="w-full">
                    <TableHeader className="w-full">
                        <TableRow>
                            <TableHead className="text-start">Contato</TableHead>
                            <TableHead className="text-center">E-mail</TableHead>
                            <TableHead className="text-center">Empresa</TableHead>
                            <TableHead className="text-center">Data/Hora</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="w-full">
                        {paginatedContacts.map((contact: Contact) => (
                            <Drawer direction="right" key={contact.id} >
                                <DrawerTrigger asChild>
                                    <TableRow
                                        className=""
                                        onClick={() => coletarMensages(String(contact.id), String(waba?.agent?.id))}
                                        key={contact.id}>
                                        <TableCell className="w-auto">
                                            <div className="w-auto flex gap-4 items-center">
                                                <Users className="w-8 h-8 text-purple-500 bg-purple-200 p-1 rounded-full" />
                                                <span className="flex flex-col justify-center items-start">
                                                    <h1>{contact.name ?? "Não coletado"}</h1>
                                                    <p className="flex gap-2 text-neutral-400 justify-center items-center"><Phone size={14} />{contact.phone ?? ""}</p>
                                                </span>
                                            </div>

                                        </TableCell>
                                        <TableCell className="w-auto text-center">
                                            <span>
                                                {contact.email ?? "Não foi coletado"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="w-auto text-center">
                                            <span>
                                                {contact.empresa ?? "Não foi coletado"}
                                            </span>
                                        </TableCell>
                                        <TableCell className="w-auto text-center" >
                                            <span>
                                                {String(contact.lastDateConversation) ?? "Não foi coletado"}
                                            </span>
                                        </TableCell>
                                    </TableRow>

                                </DrawerTrigger>
                                <DrawerContent className="bg-card border-purple-500/20">
                                    <DrawerHeader className="border-b border-purple-500/20">
                                        <DrawerTitle className="text-foreground">
                                            {contact.name || "Contato"}
                                        </DrawerTitle>
                                        <DrawerDescription className="text-muted-foreground">
                                            {contact.phone}
                                        </DrawerDescription>
                                    </DrawerHeader>
                                    <div className="overflow-y-auto p-6 space-y-4">
                                        {isLoadingMessages ? (
                                            <div className="flex flex-col items-center justify-center h-32">
                                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-2" />
                                                <p className="text-sm text-muted-foreground">Carregando mensagens...</p>
                                            </div>
                                        ) : messages.length > 0 ? (
                                            messages.map((msg, idx) => (
                                                <div key={idx} className="space-y-4">



                                                    <div className="flex justify-start">
                                                        <div className="max-w-xs">
                                                            <div className="bg-purple-500/20 text-foreground px-4 py-2 rounded-2xl rounded-tl-none text-sm border border-purple-500/20">
                                                                {msg.answer_message}
                                                            </div>
                                                            <div className="flex justify-start mt-1 text-xs text-muted-foreground flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {formatDateTime(String(msg.date_send_message))}
                                                            </div>
                                                        </div>
                                                    </div>


                                                    <div className="flex justify-end">
                                                        <div className="max-w-xs">
                                                            <div className="bg-purple-600 text-white px-4 py-2 rounded-2xl rounded-tr-none text-sm">
                                                                {msg.question_message}
                                                            </div>
                                                            <div className="flex justify-end mt-1 text-xs text-muted-foreground flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {formatDateTime(String(msg.date_recept_message))}
                                                            </div>
                                                        </div>
                                                    </div>


                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex items-center justify-center h-32 text-muted-foreground">
                                                <div className="text-center">
                                                    <MessageCircle className="w-8 h-8 opacity-30 mx-auto mb-2" />
                                                    <p className="text-sm">Nenhuma mensagem encontrada</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <DrawerFooter className="border-t border-purple-500/20">
                                        <DrawerClose asChild>
                                            <Button
                                                variant="outline"
                                                className="border-purple-500/20"
                                            >
                                                Fechar
                                            </Button>
                                        </DrawerClose>
                                    </DrawerFooter>
                                </DrawerContent>
                            </Drawer>

                        ))}
                    </TableBody>
                </Table>
            </Card>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-card border border-purple-500/20 hover:border-purple-500/50 rounded-lg p-4">
                <div className="text-sm text-muted-foreground gap-2 flex flex-col">
                    <span>
                        Página <span className="font-semibold text-foreground">{currentPage}</span> de <span className="font-semibold text-foreground">{totalPages}</span> • Total de <span className="font-semibold text-foreground">{filteredContacts.length}</span> contatos
                    </span>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Itens por página:</span>
                        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                            <SelectTrigger className="w-24 bg-input border-purple-500/20 text-foreground h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-purple-500/20">
                                <SelectGroup>
                                    <SelectItem value="10" className="text-foreground">10</SelectItem>
                                    <SelectItem value="20" className="text-foreground">20</SelectItem>
                                    <SelectItem value="30" className="text-foreground">30</SelectItem>
                                    <SelectItem value="100" className="text-foreground">100</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="border-purple-500/20 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="border-purple-500/20 disabled:opacity-50"
                    >
                        Próxima
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>
        </>
    )
}