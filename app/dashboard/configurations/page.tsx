"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { MonitorCog } from "lucide-react"

import { getOrganizations } from "@/app/services/organizations"
import type { Organization } from "@/lib/organization.interface"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
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
import OrganizationComponent from "@/app/dashboard/configurations/components/organization"
import { createOrganizations } from "@/app/services/organizations"
import { z } from "zod"

/* ===========================
   ZOD SCHEMA
=========================== */
const createOrganizationSchema = z.object({
  name: z.string().min(1, "O nome da organização é obrigatório"),
  imageUrl: z.string().optional(),
})

export default function CampaignPage() {

  const [organizations, setOrganizations] = useState<Organization[]>([])

  const [name, setName] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    coletarOrganizacoes()
  }, [])

  async function coletarOrganizacoes() {
    try {
      const result = await getOrganizations()
      setOrganizations(result.organizations)
    } catch (e) {
      console.error(e)
      toast.error("Erro ao buscar as organizações do usuário")
    }
  }

  /* ===========================
     VALIDAR CAMPOS
  =========================== */
  async function handleValidateAndSubmit() {
    const validation = createOrganizationSchema.safeParse({
      name,
      imageUrl,
    })

    if (!validation.success) {
      const errorMessage = validation.error.message
      toast.error(errorMessage || "Erro de validação")
      return
    }

    await handleCreateOrganization(validation.data)
  }

  /* ===========================
     FUNÇÃO PARA CRIAÇÃO (API)
  =========================== */
  async function handleCreateOrganization(data: {
    name: string
    imageUrl?: string
  }) {
    try {
      setLoading(true)

      const body = {
        name: data.name,
        slug: data.name.toLowerCase(),
        logo: data.imageUrl ?? ""
      }

      const result = await createOrganizations(body.name, body.slug, body.logo)

      toast.info("Organização criada com sucesso!")
      setName("")
      setImageUrl("")

    } catch (error) {
      console.error(error)
      toast.error("Erro ao criar organização")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <main className="max-w-full mx-auto px-2 py-2">
        <div className="space-y-8">

          {/* Welcome Section */}
          <div className="bg-purple-600/10 border border-purple-500/20 rounded-2xl p-8 backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Configurações
                </h2>
                <p className="text-muted-foreground max-w-2xl">
                  Gerencie suas configurações de Waba, agentes de IA e organizações
                </p>
              </div>
              <MonitorCog className="w-12 h-12 text-purple-600/60" />
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between">

                <div className="flex flex-col gap-2">
                  <CardTitle>Suas Organizações</CardTitle>
                  <CardDescription>
                    Visualize e gerencie todas as suas organizações
                  </CardDescription>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button>Criar organização</Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Criar nova organização
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Preencha os dados abaixo para criar sua organização.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="flex flex-col gap-3">
                      <Input
                        placeholder="Nome da organização *"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />

                      <Input
                        placeholder="URL da imagem (opcional)"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={loading}>
                        Cancelar
                      </AlertDialogCancel>

                      <AlertDialogAction
                        onClick={handleValidateAndSubmit}
                        disabled={loading}
                      >
                        {loading ? "Criando..." : "Criar organização"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>

            <CardContent>
              <OrganizationComponent organizations={organizations} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}