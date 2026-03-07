"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { authClient } from "@/lib/auth-client"
import { getWabas } from "@/app/services/waba";
import type { Waba, Contact, Agent } from "@/lib/database.interface";

interface AppContextType {
  wabas: Waba[]
  waba: Waba | null
  count: number
  isLoading: boolean
  setWabas: (wabas: Waba[]) => void
  setWaba: (waba: Waba | null) => void
  organizations: any
  idOrganization: string | null
  setIdOrganization: (id: string | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {

  const [wabas, setWabas] = useState<Waba[]>([]);
  const [waba, setWaba] = useState<Waba | null>(null);

  const { data: organizations } = authClient.useListOrganizations();
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [idOrganization, setIdOrganization] = useState<string | null>(null);

  useEffect(() => {
    if (idOrganization) {
      coletarWabasDaOrganizacao(idOrganization);
    }
  }, [idOrganization]);

  async function coletarWabasDaOrganizacao(id: string) {
    setIsLoading(true);
    try {
      const result = await getWabas(id);
      let valor = 0;
      result.wabas.map((w: Waba) => w.contactWabas?.map((cw) => { valor = valor + (cw.contact?.reunioesContato?.length ?? 0) }));
      setCount(valor);
      setWabas(result.wabas);
    } catch (e) {
      console.error(e)
      setWabas([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppContext.Provider
      value={{
        wabas,
        setWabas,
        waba,
        setWaba,
        count,
        isLoading,
        organizations,
        idOrganization,
        setIdOrganization
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error("useAppContext deve ser usado dentro do AppProvider")
  }

  return context
}


