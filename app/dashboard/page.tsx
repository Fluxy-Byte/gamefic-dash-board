"use client"

import type { Waba, Contact } from "@/lib/database.interface";

import { toast } from "sonner";

import type { Result, Message } from "@/app/services/message";
import { getMessage } from "@/app/services/message";

import { getContacts } from "@/app/services/contacts";
import TableContacts from "@/app/dashboard/contatos/contatos"
import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  MessageCircle,
  Users,
  TrendingUp,
  Lightbulb,
  Phone,
  Mail,
  Building2,
  Settings,
  LogOut,
  BarChart3,
  Zap,
  Search,
  Loader2,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator"
import { AppProvider, useAppContext } from "@/app/services/context";

type Organization = {
  id: string
  name: string
}

export default function DashboardPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { setIdOrganization, organizations, wabas, waba, setWaba, count, isLoading } = useAppContext();

  const handleSearchContacts = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    if (!term.trim()) {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter((c) =>
        c.name?.toLowerCase().includes(term.toLowerCase()) ||
        c.phone?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  }

  useEffect(() => {
    if (waba && waba.id) {
      coletarContatosDaWaba(waba);
    }
  }, [waba])

  async function coletarContatosDaWaba(wabaSelected: Waba) {
    setIsLoadingContacts(true);
    try {
      const result = await getContacts(String(wabaSelected.id));
      console.log(result.contatos)
      setContacts(result.contatos);
      setFilteredContacts(result.contatos);
      setSearchTerm("");
    } catch (e: any) {
      console.log(e)
      toast.error("Desculpe mais tivemos um erro durante a coleta dos contatos do waba: " + wabaSelected.displayPhoneNumber);
      setContacts([]);
      setFilteredContacts([]);
    } finally {
      setIsLoadingContacts(false);
    }
  }






  return (
    <main className="w-full min-h-scre">

      <div className="flex border-b bg-sidebar items-center justify-between gap-4 p-5">
        <SidebarTrigger />

        <div className="flex justify-center items-center h-full gap-4">
          <div className="flex justify-center items-center h-full gap-2">
            <p>Organização: </p>
            <Select onValueChange={setIdOrganization}>
              <SelectTrigger className="bg-input border-purple-500/20 text-foreground h-11">
                <SelectValue placeholder="Selecione uma organização" />
              </SelectTrigger>
              <SelectContent className="bg-card border-purple-500/20">
                <SelectGroup>
                  <SelectLabel className="text-muted-foreground">Organizações</SelectLabel>
                  {organizations?.map((org: any) => (
                    <SelectItem key={org.id} value={org.id} className="text-foreground">
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Separator orientation="vertical" />
          <div className="flex justify-center items-center h-full gap-2">
            <p>Agente: </p>

            <Select
              onValueChange={(value) => {
                const selected = wabas.find((a) => String(a.id) === value)
                setWaba(selected || null)
              }}
              disabled={isLoading || wabas.length === 0}
            >
              <SelectTrigger className="bg-input border-purple-500/20 text-foreground h-11 disabled:opacity-50">
                <SelectValue placeholder={isLoading ? "Carregando agentes..." : "Selecione um agente"} />
              </SelectTrigger>
              <SelectContent className="bg-card border-purple-500/20">
                <SelectGroup>
                  <SelectLabel className="text-muted-foreground">Agentes</SelectLabel>
                  {wabas.length > 0 ? (
                    wabas.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)} className="text-foreground">
                        {a.displayPhoneNumber} - {a.agent?.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled className="text-muted-foreground">
                      {isLoading ? "Carregando..." : "Nenhum agente disponível"}
                    </SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>


      <div className="space-y-8 p-5">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-card border border-purple-500/20 h-auto rounded-2xl p-6 backdrop-blur hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-start gap-3 h-auto">
              <Users className="w-12 h-12 text-purple-500 bg-purple-200 p-1 rounded-md" />
              <div className="flex flex-col">
                <p className="text-sm text-muted-foreground">Total de Contatos</p>
                <h3 className="text-2xl font-bold text-foreground">
                  <span>{waba?.logContatoComAgente?.length ?? 0}</span>
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-card border border-purple-500/20 rounded-2xl p-6 backdrop-blur hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-start gap-3 h-auto">
              <TrendingUp className="w-12 h-12 text-green-500 bg-green-200 p-1 rounded-md" />
              <div className="flex flex-col">
                <p className="text-sm text-muted-foreground mb-1">Número de Conversão</p>
                <h3 className="text-2xl font-bold text-foreground">
                  <span>{waba ? count : 0}</span>
                </h3>
              </div>

            </div>

          </div>

          <div className="bg-card border border-purple-500/20 rounded-2xl p-6 backdrop-blur hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-start gap-3 h-auto">
              <BarChart3 className="w-12 h-12 text-blue-500 bg-blue-200 p-1 rounded-md" />
              <div className="flex flex-col">
                <p className="text-sm text-muted-foreground mb-1">Procentagem de Engajamento</p>
                <h3 className="text-2xl font-bold text-foreground">
                  <span>{waba ? Math.round(((count) / (waba?.logContatoComAgente?.length ?? 0)) * 100) : 0}%</span>
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-purple-500/20 h-auto rounded-2xl p-4 backdrop-blur hover:border-purple-500/50 transition-colors">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => handleSearchContacts(e.target.value)}
                className="pl-10 bg-input border-purple-500/20 text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {isLoadingContacts ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-3" />
              <p className="text-muted-foreground">Carregando contatos...</p>
            </div>
          ) : filteredContacts.length > 0 && waba ? (
            <TableContacts waba={waba} filteredContacts={filteredContacts} />
          ) : (
            <div className="bg-card border border-purple-500/20 rounded-2xl p-12 text-center backdrop-blur">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm ? "Nenhum contato encontrado" : "Nenhum contato nesta organização"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Tente uma busca diferente" : "Selecione um agente para visualizar seus contatos"}
              </p>
            </div>
          )}
        </div>
      </div>

    </main>
  )
}

