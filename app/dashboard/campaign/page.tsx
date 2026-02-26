"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

export default function CampaignPage() {
  return (
    <div className="space-y-6">
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
          <CardTitle>Suas Campanhas</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as suas campanhas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Nenhuma campanha encontrada</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Comece criando sua primeira campanha
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Campanha
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
