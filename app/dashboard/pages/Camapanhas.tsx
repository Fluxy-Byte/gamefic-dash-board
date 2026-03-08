"use client"

import { getCampaings } from "@/app/services/campaings";
import { getContactsCampaing } from "@/app/services/contatosCampaing";

import type { Campanha, ContatosCampanha } from "@/lib/database.interface";

import { useState, useEffect } from "react";

import { Loader2, Plus, ChevronLeft, ChevronRight, Search, MessageCircle } from "lucide-react";
import DisparoAtivoModal from "@/app/dashboard/components/ModalCampaing";
import { useAppContext } from "@/app/services/context";
import { formatarDataBR } from "@/app/hooks/FormatDate";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

interface CampanhaComContatos extends Campanha {
  contatosCarregados?: ContatosCampanha[];
  carregandoContatos?: boolean;
}

export default function Campaign() {
  const [isLoadingWabas, setIsLoadingWabas] = useState(false);
  const [campanhas, setCampanhas] = useState<CampanhaComContatos[]>([]);
  const [filteredCampanhas, setFilteredCampanhas] = useState<CampanhaComContatos[]>([]);
  const [campanhasCarregando, setCampanhasCarregando] = useState<Record<number, boolean>>({});
  const [contatosDaCampanha, setContatosDaCampanha] = useState<ContatosCampanha[]>([])
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const { setIdOrganization, idOrganization, organizations, wabas, waba, setWaba, count, isLoading } = useAppContext();

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
      setFilteredCampanhas(result.campanhas);
      setCurrentPage(1);
      setSearchTerm("");
    } catch (e) {
      console.error(e)
      toast.error("Tivemos um erro na busca as campanhas!")
      setCampanhas([]);
      setFilteredCampanhas([]);
    } finally {
      setIsLoadingWabas(false);
    }
  }

  const handleSearchCampanhas = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    if (!term.trim()) {
      setFilteredCampanhas(campanhas);
    } else {
      const filtered = campanhas.filter((c) =>
        c.name?.toLowerCase().includes(term.toLowerCase()) ||
        c.nameTemplate?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCampanhas(filtered);
    }
  }

  // Paginação
  const totalPages = Math.ceil(filteredCampanhas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCampanhas = filteredCampanhas.slice(startIndex, endIndex);

  async function carregarContatosCampanha(idCampanha: number) {

    try {
      const result = await getContactsCampaing(String(idCampanha));

      setContatosDaCampanha(result.contatos);

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

  return (

    <main className="w-full">
      <div className="px-5">
        <Card>
          <div className="space-y-8 px-5">
            <div className="max-w-full space-y-6">

              {/* Campanhas Section */}
              <div>
                <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">Campanhas realizadas</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {filteredCampanhas.length === 0
                        ? "Nenhuma campanha encontrada"
                        : `${filteredCampanhas.length} campanha${filteredCampanhas.length > 1 ? 's' : ''} encontrada${filteredCampanhas.length > 1 ? 's' : ''}`
                      }
                    </p>
                  </div>

                  <Button
                    disabled={!waba}
                    onClick={() => setOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
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

                {/* Search Box */}
                {!isLoadingWabas && campanhas?.length > 0 && (
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Buscar por nome da campanha ou template..."
                        value={searchTerm}
                        onChange={(e) => handleSearchCampanhas(e.target.value)}
                        className="bg-input border-purple-500/20 text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 pl-10"
                      />
                    </div>
                  </div>
                )}

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

                {!isLoadingWabas && paginatedCampanhas?.length > 0 && (
                  <div className="space-y-4">

                    <Accordion
                      type="single"
                      collapsible
                      className="w-full flex flex-col gap-3">
                      {paginatedCampanhas.map((campanha) => (
                        <AccordionItem key={campanha.id} value={`campanha-${campanha.id}`} className="border rounded-2xl">
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
                                  <div className="flex mt-2 gap-2 flex-wrap justify-start">
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

                              {contatosDaCampanha && contatosDaCampanha.length === 0 && (
                                <p className="text-xs sm:text-sm text-muted-foreground py-4">
                                  Nenhum contato encontrado nesta campanha.
                                </p>
                              )}

                              {contatosDaCampanha && contatosDaCampanha.length > 0 && (
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
                                      {contatosDaCampanha.map((contatoCampanha) => (
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

                      ))}

                    </Accordion>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-purple-500/20">
                        <p className="text-sm text-muted-foreground">
                          Página {currentPage} de {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="border-purple-500/20"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={currentPage === page ? "bg-purple-600 hover:bg-purple-700" : "border-purple-500/20"}
                              >
                                {page}
                              </Button>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="border-purple-500/20"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
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
        </Card>
      </div>
    </main>
  )
}
