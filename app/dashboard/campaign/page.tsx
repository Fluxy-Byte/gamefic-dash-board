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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campanhas</h1>
          <p className="text-muted-foreground">
            Gerencie suas campanhas de marketing
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Campanha
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Selecione uma organização e agente para visualizar campanhas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="flex items-center gap-2 text-sm text-purple-400 mt-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando agentes...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campanhas Section */}
      <Card>
        <CardHeader>
          <CardTitle>Campanhas Disponíveis</CardTitle>
          <CardDescription>
            {campanhas.length === 0
              ? "Nenhuma campanha encontrada"
              : `${campanhas.length} campanha${campanhas.length > 1 ? 's' : ''} disponível${campanhas.length > 1 ? 's' : ''}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isLoadingWabas && campanhas?.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Selecione um agente para visualizar campanhas.</p>
            </div>
          )}

          {!isLoadingWabas && campanhas?.length > 0 && (
            <Accordion type="single" collapsible className="w-full">
              {campanhas.map((campanha) => (
                <AccordionItem key={campanha.id} value={`campanha-${campanha.id}`}>
                  <AccordionTrigger
                    onClick={() => carregarContatosCampanha(campanha.id)}
                    className="hover:no-underline"
                  >
                    <div className="flex flex-1 items-center justify-between gap-4 pr-4">
                      <div className="text-left">
                        <h3 className="font-semibold text-foreground">{campanha.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Template: {campanha.nameTemplate}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Data de Envio: {campanha.dataDeEnvio
                            ? formatarDataBR(String(campanha.dataDeEnvio))
                            : 'Data de envio desconhecida'}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Badge variant="outline" className="whitespace-nowrap">
                          {campanha.qtdDeContatos} contatos
                        </Badge>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {campanha.qtdDeEnviadas} enviadas
                        </Badge>
                        <Badge variant="destructive" className="whitespace-nowrap">
                          {campanha.qtdDeFalhas} falhas
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Contatos da Campanha</p>
                        {campanhasCarregando[campanha.id] && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Carregando...
                          </div>
                        )}
                      </div>

                      {campanha.contatosCarregados && campanha.contatosCarregados.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4">
                          Nenhum contato encontrado nesta campanha.
                        </p>
                      )}

                      {campanha.contatosCarregados && campanha.contatosCarregados.length > 0 && (
                        <div className="w-full overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Retorno</TableHead>
                                <TableHead>Data de Envio</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {campanha.contatosCarregados.map((contatoCampanha) => (
                                <TableRow key={contatoCampanha.id}>
                                  <TableCell className="font-medium">
                                    {contatoCampanha.contact?.name || 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    {contatoCampanha.contact?.phone || 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    {contatoCampanha.contact?.empresa || 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={getStatusColor(contatoCampanha.status)}>
                                      {contatoCampanha.status || 'Desconhecido'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {contatoCampanha.body_retorno ? (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="outline">Detlhes do erro</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Detalhes do erro</AlertDialogTitle>
                                            <AlertDialogDescription asChild>
                                              <pre className="max-h-96 max-w-full overflow-auto text-xs bg-muted p-3 rounded-md">
                                                {contatoCampanha.body_retorno}
                                              </pre>
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction>Continue</AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-sm">
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
              ))}
            </Accordion>
          )}

          {/* Loading State for Campaigns */}
          {isLoadingWabas && (
            <div className="flex items-center gap-2 text-sm text-purple-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando campanhas...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
