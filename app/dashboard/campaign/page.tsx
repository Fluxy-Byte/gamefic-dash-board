"use client"

import { getWabas } from "@/app/services/waba";
import { getCampaings } from "@/app/services/campaings";
import { getContactsCampaing } from "@/app/services/contatosCampaing";

import type { Waba, Contact, Agent, Campanha, ContatosCampanha } from "@/lib/database.interface";
import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import DisparoAtivoModal from "@/app/dashboard/campaign/components/modal"

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
} from "@/components/ui/select";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge";

interface CampanhaComContatos extends Campanha {
  contatosCarregados?: ContatosCampanha[];
  carregandoContatos?: boolean;
}

export default function CampaignPage() {
  const [idOrganization, setIdOrganization] = useState<string | null>(null);
  const { data: session } = useSession();
  const { data: organizations } = authClient.useListOrganizations();
  const [wabas, setWabas] = useState<Waba[]>([]);
  const [waba, setWaba] = useState<Waba | null>(null);
  const [isLoadingWabas, setIsLoadingWabas] = useState(false);
  const [count, setCount] = useState<number>(0);
  const [campanhas, setCampanhas] = useState<CampanhaComContatos[]>([]);
  const [campanhasCarregando, setCampanhasCarregando] = useState<Record<number, boolean>>({});
  const [open, setOpen] = useState(false)

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
    if (waba?.id && idOrganization) {
      coletarCampanhas(waba.id, idOrganization)
    }
  }, [waba])

  async function coletarCampanhas(idWaba: number, idOrganization: string) {
    setIsLoadingWabas(true);
    try {

      const result = await getCampaings(String(idWaba), idOrganization);

      setCampanhas(result.campanhas);
    } catch (e) {
      console.error(e)
      toast.error("Tivemos um erro na busca as campanhas!")
      setCampanhas([]);
    } finally {
      setIsLoadingWabas(false);
    }
  }

  async function carregarContatosCampanha(idCampanha: number) {
    // Se já foi carregado, não carregar novamente
    const campanhaAtual = campanhas.find(c => c.id === idCampanha);
    if (campanhaAtual?.contatosCarregados) {
      return;
    }

    setCampanhasCarregando(prev => ({ ...prev, [idCampanha]: true }));
    try {
      const result = await getContactsCampaing(String(idCampanha));

      setCampanhas(prev => prev.map(c =>
        c.id === idCampanha
          ? { ...c, contatosCarregados: result.contatos || [] }
          : c
      ));
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar contatos da campanha");
    } finally {
      setCampanhasCarregando(prev => ({ ...prev, [idCampanha]: false }));
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'enviado':
        return 'bg-green-100 p-2 text-green-800';
      case 'erro':
        return 'bg-red-100 p-2 text-red-800';
      case 'pendente':
        return 'bg-yellow-100 p-2 text-yellow-800';
      case 'lida':
        return 'bg-blue-100 p-2 text-blue-800';
      default:
        return 'bg-gray-100 p-2 text-gray-800';
    }
  };

  function formatarDataBR(dataString: string): string {
    if (!dataString) return ""

    // Ajusta formato para ISO
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-purple-500/20 bg-gradient-to-br from-purple-600/5 to-pink-600/5 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Campanhas</h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">
                Gerencie e monitore suas campanhas de marketing
              </p>
            </div>
            <Button 
              disabled={!waba} 
              onClick={() => setOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova campanha
            </Button>
            {waba && waba.phoneNumberId && idOrganization && (
              <DisparoAtivoModal
                open={open}
                onOpenChange={setOpen}
                phoneNumberId={waba.phoneNumberId}
                idOrganizacao={idOrganization}
              />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Filters Card */}
        <Card className="border-purple-500/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Filtros</CardTitle>
            <CardDescription>
              Selecione uma organização e agente para visualizar campanhas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Organization Select */}
              <div className="space-y-2 sm:space-y-3">
                <label className="text-xs sm:text-sm font-semibold text-foreground block">
                  Organização
                </label>
                <Select onValueChange={setIdOrganization}>
                  <SelectTrigger className="bg-input border-purple-500/20 text-foreground h-10 sm:h-11 text-sm">
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
              <div className="space-y-2 sm:space-y-3">
                <label className="text-xs sm:text-sm font-semibold text-foreground block">
                  Agente
                </label>
                <Select
                  onValueChange={(value) => {
                    const selected = wabas.find((a) => String(a.id) === value)
                    setWaba(selected || null)
                  }}
                  disabled={isLoadingWabas || wabas.length === 0}
                >
                  <SelectTrigger className="bg-input border-purple-500/20 text-foreground h-10 sm:h-11 disabled:opacity-50 text-sm">
                    <SelectValue placeholder={isLoadingWabas ? "Carregando agentes..." : "Selecione um agente"} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-purple-500/20">
                    <SelectGroup>
                      <SelectLabel className="text-muted-foreground">Agentes</SelectLabel>
                      {wabas.length > 0 ? (
                        wabas.map((a) => (
                          <SelectItem key={a.id} value={String(a.id)} className="text-foreground text-sm">
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
              <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-400 mt-4">
                <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                Carregando agentes...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campanhas Section */}
        <div>
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Campanhas Disponíveis</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {campanhas.length === 0
                  ? "Nenhuma campanha encontrada"
                  : `${campanhas.length} campanha${campanhas.length > 1 ? 's' : ''} disponível${campanhas.length > 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>

          {!isLoadingWabas && campanhas?.length === 0 && (
            <Card className="border-purple-500/20">
              <CardContent className="pt-12 pb-12">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground text-sm sm:text-base">Selecione um agente para visualizar campanhas.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoadingWabas && campanhas?.length > 0 && (
            <div className="space-y-4">
              {campanhas.map((campanha) => (
                <Card key={campanha.id} className="border-purple-500/20 bg-card/50 backdrop-blur hover:border-purple-500/40 transition-colors overflow-hidden">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={`campanha-${campanha.id}`} className="border-0">
                      <AccordionTrigger
                        onClick={() => carregarContatosCampanha(campanha.id)}
                        className="hover:no-underline p-4 sm:p-6 [&[data-state=open]>svg]:rotate-180"
                      >
                        <div className="flex flex-1 items-start sm:items-center justify-between gap-3 sm:gap-4 pr-4 text-left">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{campanha.name}</h3>
                            <div className="hidden sm:block space-y-1 mt-1">
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Template: {campanha.nameTemplate}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {campanha.dataDeEnvio
                                  ? formatarDataBR(String(campanha.dataDeEnvio))
                                  : 'Data de envio desconhecida'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap justify-end">
                            <Badge variant="outline" className="whitespace-nowrap text-xs">
                              {campanha.qtdDeContatos}
                            </Badge>
                            <Badge variant="outline" className="whitespace-nowrap text-xs">
                              {campanha.qtdDeEnviadas}
                            </Badge>
                            <Badge variant="destructive" className="whitespace-nowrap text-xs">
                              {campanha.qtdDeFalhas}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="border-t border-purple-500/20 p-4 sm:p-6">
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">Contatos da Campanha</p>
                            {campanhasCarregando[campanha.id] && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Carregando...
                              </div>
                            )}
                          </div>

                          {campanha.contatosCarregados && campanha.contatosCarregados.length === 0 && (
                            <p className="text-xs sm:text-sm text-muted-foreground py-4">
                              Nenhum contato encontrado nesta campanha.
                            </p>
                          )}

                          {campanha.contatosCarregados && campanha.contatosCarregados.length > 0 && (
                            <div className="w-full overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
                              <Table className="min-w-full text-xs sm:text-sm">
                                <TableHeader>
                                  <TableRow className="border-purple-500/20">
                                    <TableHead className="text-xs">Nome</TableHead>
                                    <TableHead className="text-xs">Telefone</TableHead>
                                    <TableHead className="hidden md:table-cell text-xs">Empresa</TableHead>
                                    <TableHead className="text-xs">Status</TableHead>
                                    <TableHead className="hidden lg:table-cell text-xs">Retorno</TableHead>
                                    <TableHead className="hidden xl:table-cell text-xs">Data de Envio</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {campanha.contatosCarregados.map((contatoCampanha) => (
                                    <TableRow key={contatoCampanha.id} className="border-purple-500/20">
                                      <TableCell className="font-medium text-xs sm:text-sm">
                                        {contatoCampanha.contact?.name || 'N/A'}
                                      </TableCell>
                                      <TableCell className="text-xs sm:text-sm">
                                        {contatoCampanha.contact?.phone || 'N/A'}
                                      </TableCell>
                                      <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                                        {contatoCampanha.contact?.empresa || 'N/A'}
                                      </TableCell>
                                      <TableCell className="text-xs sm:text-sm">
                                        <Badge className={`${getStatusColor(contatoCampanha.status)} text-xs`}>
                                          {contatoCampanha.status || 'Desconhecido'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="hidden lg:table-cell text-xs">
                                        {contatoCampanha.body_retorno ? (
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button variant="outline" size="sm" className="text-xs h-7">Detalhes</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="max-w-md sm:max-w-lg">
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>Detalhes do erro</AlertDialogTitle>
                                                <AlertDialogDescription asChild>
                                                  <pre className="max-h-96 max-w-full overflow-auto text-xs bg-muted p-3 rounded-md mt-2">
                                                    {contatoCampanha.body_retorno}
                                                  </pre>
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>Fechar</AlertDialogCancel>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        ) : (
                                          <span className="text-muted-foreground">-</span>
                                        )}
                                      </TableCell>
                                      <TableCell className="hidden xl:table-cell text-xs">
                                        {campanha.dataDeEnvio
                                          ? formatarDataBR(String(campanha.dataDeEnvio))
                                          : 'N/A'
                                        }
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              ))}
            </div>
          )}

          {/* Loading State for Campaigns */}
          {isLoadingWabas && (
            <Card className="border-purple-500/20">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center justify-center gap-2 text-sm text-purple-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carregando campanhas...
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
