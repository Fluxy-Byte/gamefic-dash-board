"use client"

import type { Organization } from "@/lib/organization.interface";
import { useEffect, useState } from "react";
import Link from "next/link"
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
import { Button } from "@/components/ui/button";

interface Props {
    organizations: Organization[]
}

export default function Organization(prosp: Props) {

    return (
        <div className="flex justify-start items-center gap-2">
            {
                prosp.organizations.length > 0 && prosp.organizations.map((o) => (
                    <Button key={o.id} asChild variant="outline">
                        <Link href={`/dashboard/configurations/organizations-details/${o.id}`}>
                            {o.name}
                        </Link>
                    </Button>
                ))
            }
            {
                prosp.organizations.length == 0 && (
                    <div className="flex flex-col items-center justify-center h-auto space-y-4">
                        <div className="text-start">
                            <h3 className="text-lg font-semibold">Nenhuma organização encontrada</h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Comece criando sua primeira organização 😊🚀
                            </p>
                        </div>
                    </div>
                )
            }
        </div>
    )
}
