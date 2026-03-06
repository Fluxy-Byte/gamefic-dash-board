"use client"

import { getWabas } from "@/app/services/waba";
import type { Waba, Contact, Agent } from "@/lib/database.interface";

import { toast } from "sonner";

import type { Result, Message } from "@/app/services/message";
import { getMessage } from "@/app/services/message";

import { getContacts } from "@/app/services/contacts";

import { useState, useEffect } from "react"
import { useSession } from "@/lib/auth-client"
import { authClient } from "@/lib/auth-client"
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

type Organization = {
  id: string
  name: string
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: organizations } = authClient.useListOrganizations();
  const [idOrganization, setIdOrganization] = useState<string | null>(null);
  const [wabas, setWabas] = useState<Waba[]>([]);
  const [waba, setWaba] = useState<Waba | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [count, setCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoadingWabas, setIsLoadingWabas] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (idOrganization) {
      coletarWabasDaOrganizacao(idOrganization)
    }
  }, [idOrganization])

  async function coletarWabasDaOrganizacao(id: string) {
    setIsLoadingWabas(true);
    try {
      const result = await getWabas(id);

      console.log(result)
      let valor = 0
      const contadorDeReunioes = result.wabas.map((w: Waba) => w.contactWabas?.map((cw) => { valor = valor + (cw.contact?.reunioesContato?.length ?? 0) }))
      setCount(valor)
      setWabas(result.wabas);
    } catch (e) {
      console.error(e)
      toast.error("Tivemos um erro na busca dos agentes e dos waba dessa organização!")
      setWabas([]);
    } finally {
      setIsLoadingWabas(false);
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

  const handleLogout = async () => {
    await authClient.signOut()
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
    <div className="w-full min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-purple-500/20 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Fluxy</h1>
              <p className="text-xs text-muted-foreground">Gerenciador de Agentes IA</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Bem-vindo,</span>
              <span className="font-semibold text-foreground">{session?.user?.name}</span>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-purple-500/20 bg-card">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Fazer logout?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-purple-500/20">Cancelar</AlertDialogCancel>
                  <Button
                    onClick={handleLogout}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Logout
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-purple-600/10 border border-purple-500/20 rounded-2xl p-8 backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Dashboard de Agentes
                </h2>
                <p className="text-muted-foreground max-w-2xl">
                  Gerencie todos os seus agentes de WhatsApp com IA em um único lugar.
                  Visualize métricas, contatos e conversas em tempo real.
                </p>
              </div>
              <Zap className="w-12 h-12 text-purple-600/60" />
            </div>
          </div>

          {/* Filters Section - Reorganized */}
          <div className="bg-card border border-purple-500/20 rounded-2xl p-8 backdrop-blur">
            <h3 className="text-lg font-semibold text-foreground mb-8 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-500" />
              Configurações de Acesso
            </h3>

            <div className="space-y-6">
              {/* Main Selects Row */}
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {/* Organization Select */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground block">
                    Organização
                  </label>
                  <Select onValueChange={setIdOrganization}>
                    <SelectTrigger className="bg-input border-purple-500/20 text-foreground h-11">
                      <SelectValue placeholder="Selecione uma organização" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-purple-500/20">
                      <SelectGroup>
                        <SelectLabel className="text-muted-foreground">Organizações</SelectLabel>
                        {organizations?.map((org) => (
                          <SelectItem key={org.id} value={org.id} className="text-foreground">
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Agent Select */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground block">
                    Agente
                  </label>
                  <Select
                    onValueChange={(value) => {
                      const selected = wabas.find((a) => String(a.id) === value)
                      setWaba(selected || null)
                    }}
                    disabled={isLoadingWabas || wabas.length === 0}
                  >
                    <SelectTrigger className="bg-input border-purple-500/20 text-foreground h-11 disabled:opacity-50">
                      <SelectValue placeholder={isLoadingWabas ? "Carregando agentes..." : "Selecione um agente"} />
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
                            {isLoadingWabas ? "Carregando..." : "Nenhum agente disponível"}
                          </SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Loading State for Agents */}
              {isLoadingWabas && (
                <div className="flex items-center gap-2 text-sm text-purple-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carregando agentes...
                </div>
              )}
            </div>
          </div>

          {/* Metrics Section */}
          {waba && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Contacts Card */}
                <div className="bg-card border border-purple-500/20 rounded-2xl p-6 backdrop-blur hover:border-purple-500/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total de Contatos</p>
                      <h3 className="text-4xl font-bold text-foreground">
                        <span>{waba.logContatoComAgente?.length ?? 0}</span>
                      </h3>
                    </div>
                    <div className="p-3 bg-purple-600/10 rounded-lg">
                      <Users className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Número de contatos que o agente teve conversa
                  </p>
                </div>

                {/* Conversion Rate Card */}
                <div className="bg-card border border-purple-500/20 rounded-2xl p-6 backdrop-blur hover:border-purple-500/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Número de Conversão</p>
                      <h3 className="text-4xl font-bold text-foreground">
                        <span>{count}</span>
                      </h3>
                    </div>
                    <div className="p-3 bg-purple-600/10 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-pink-500" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Número de conversão que o agente conseguiu
                  </p>
                </div>

                {/* Engagement Card */}
                <div className="bg-card border border-purple-500/20 rounded-2xl p-6 backdrop-blur hover:border-purple-500/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Procentagem de Engajamento</p>
                      <h3 className="text-4xl font-bold text-foreground">
                        <span>{Math.round(((count) / (waba.logContatoComAgente?.length ?? 0)) * 100)}%</span>
                      </h3>
                    </div>
                    <div className="p-3 bg-purple-600/10 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Taxa média de enganjamento que o agente obteve
                  </p>
                </div>
              </div>

              {/* Contacts Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">Contatos Encontrados</h3>


                  {/* Search Filter */}
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
                ) : filteredContacts.length > 0 ? (
                  <>

                    {/* Grid de Contatos */}
                    <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {paginatedContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="bg-card border border-purple-500/20 rounded-2xl p-6 backdrop-blur hover:border-purple-500/50 transition-all hover:shadow-lg"
                        >
                          {/* Contact Header */}
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                              <Users className="w-6 h-6 text-purple-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground truncate">
                                {contact.name || "Contato Anônimo"}
                              </h4>
                              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <Phone className="w-4 h-4" />
                                {contact.phone}
                              </p>
                            </div>
                          </div>

                          <div className="mb-1 pb-4 border-t border-purple-500/10 gap-2">
                            {/* Contact Info */}
                            {contact.email && (

                              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-3">
                                <Mail className="w-4 h-4" />
                                {contact.email}
                              </p>

                            )}

                            {contact.empresa && (
                              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-3">
                                <Building2 className="w-4 h-4" />
                                {contact.empresa}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Drawer direction="right" >
                              <DrawerTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white border-0"
                                  onClick={() => coletarMensages(String(contact.id), String(waba.agent?.id))}
                                >
                                  <MessageCircle className="w-4 h-4 mr-2" />
                                  Mensagens
                                </Button>
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


                                        {/* Agent Message */}
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

                                        {/* User Message */}
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
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls - Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
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
                          className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white border-0 disabled:opacity-50 disabled:bg-gray-400"
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white border-0 disabled:opacity-50 disabled:bg-gray-400"
                        >
                          Próxima
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </>
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
            </>
          )}
        </div>
      </main>
    </div>
  )
}

