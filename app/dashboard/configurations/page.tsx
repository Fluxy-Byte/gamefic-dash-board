"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { getOrganizations } from "@/app/services/organizations"
import type { Organization } from "@/lib/organization.interface"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { useSession } from "@/lib/auth-client"
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
  const { data: session } = useSession()
  const [organizations, setOrganizations] = useState<Organization[]>([])

  const [name, setName] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)

  // Verificar se o usuário é admin
  const isAdmin = session?.user?.role === "admin"

  useEffect(() => {
    if (isAdmin) {
      coletarOrganizacoes()
    }
  }, [isAdmin])

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
      const errorMessage = validation.error.errors[0]?.message
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

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Configurações
            </h1>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Acesso Restrito</h3>
              <p className="text-muted-foreground">
                Apenas administradores podem gerenciar as configurações. Entre em contato com um administrador para obter acesso.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas configurações de Waba, agentes de IA e organizações
          </p>
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
  )
}
