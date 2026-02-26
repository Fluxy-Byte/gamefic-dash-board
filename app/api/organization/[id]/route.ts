import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrganizationWithIdUserAndId } from "@/lib/organization";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user || !id) {
      return NextResponse.json(
        {
          status: false,
          organization: null,
          message: "Não encontramos a sessão do usuário ou id da organização",
        },
        { status: 401 }
      );
    }

    const user = session.user;

    const organization = await getOrganizationWithIdUserAndId(
      id,
      user.id
    );

    return NextResponse.json({
      status: true,
      organization,
      message: "Sucesso na consulta",
    });
  } catch (e) {
    return NextResponse.json(
      {
        status: false,
        organization: null,
        message: "Erro interno no servidor",
      },
      { status: 500 }
    );
  }
}