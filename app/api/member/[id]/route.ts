import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMembersFilterIdOrganization } from "@/lib/member";

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
          members: [],
          message: "Não encontramos a sessão do usuário ou id da organização",
        },
        { status: 401 }
      );
    }

    const user = session.user;

    if (user.role != "admin") {
      return NextResponse.json(
        {
          status: false,
          members: [],
          message: "Seu usuario não tem acesso a essa area de gerenciamento de membros",
        },
        { status: 401 }
      );
    }

    const members = await getMembersFilterIdOrganization(
      id
    );

    return NextResponse.json({
      status: true,
      members,
      message: "Sucesso na consulta",
    });
  } catch (e) {
    return NextResponse.json(
      {
        status: false,
        members: [],
        message: "Erro interno no servidor",
      },
      { status: 500 }
    );
  }
}