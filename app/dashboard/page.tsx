"use client"

import Contatos from "@/app/dashboard/pages/Contatos"
import Campaign from "@/app/dashboard/pages/Camapanhas"
import Config from "@/app/dashboard/pages/Configuracoes"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator"
import { useAppContext } from "@/app/services/context";

export default function DashboardPage() {
  const { setIdOrganization, organizations, idOrganization, wabas, setWaba, isLoading, pageAcess } = useAppContext();

  return (
    <main className="w-full min-h-scre">
      <div className="flex border-b bg-sidebar items-center justify-between gap-4 p-4">
        <SidebarTrigger />

        <div className="flex justify-center items-center h-full gap-2">
          <div className="flex justify-center items-center h-full gap-2">
            <p className="text-sm text-neutral-300">Organização: </p>
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
            <p className="text-sm text-neutral-300">Agente: </p>
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
        {!idOrganization && (
          <div className="px-5">
            <Badge variant="destructive">Necessário selecionar uma organização</Badge>
          </div>
        )
        }
        {
          pageAcess == "contatos" && (
            <Contatos />
          )
        }
        {
          pageAcess == "campanha" && (
            <Campaign />
          )
        }
        {
          pageAcess == "configuracao" && (
            <Config />
          )
        }
      </div >

    </main >
  )
}

