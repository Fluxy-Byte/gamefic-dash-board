


import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrganizationWithIdUser, createNewOrganization, updateOrganization } from "@/lib/organization";
import { createMember, updateMember } from "@/lib/member";
import { getUserWithEmail } from "@/lib/user";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { status: false, organizations: [], message: "Não encontramos a sessão do usuario" },
        { status: 401 }
      );
    }

    const user = session.user;

    const organizations = await getOrganizationWithIdUser(user.id);

    return NextResponse.json({
      status: true,
      organizations,
      message: "Sucesso na consulta"
    });
  } catch (e: any) {
    return NextResponse.json({
      status: false,
      organizations: [],
      message: "Erro interno no servidor"
    })
  }
}

export async function POST(req: Request) {
  try {
    const { email, idOrganization, role } = await req.json();

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { status: false, registerMember: null, message: "Não encontramos a sessão do usuário" },
        { status: 401 }
      );
    }

    const user = session.user;

    if (user.role != "admin") {
      return NextResponse.json(
        { status: false, registerMember: null, message: "Você não tem permissão para criar um membro ou editalo" },
        { status: 401 }
      );
    }

    const usuarioMember = await getUserWithEmail(email)

    if (!usuarioMember) {
      return NextResponse.json(
        { status: false, registerMember: null, message: "Esse e-mail não foi encontrado" },
        { status: 401 }
      );
    }

    const registerMember = await createMember(
      idOrganization, role, usuarioMember.id
    );

    return NextResponse.json({
      status: true,
      registerMember,
      message: "Sucesso no registro do membro"
    });
  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      {
        status: false,
        registerMember: null,
        message: "Erro interno no servidor"
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { role, idOrganization, idMember } = await req.json();

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { status: false, organization: null, message: "Não encontramos a sessão do usuário" },
        { status: 401 }
      );
    }

    const user = session.user;

    const organization = await updateMember(
      role, idOrganization, idMember
    );

    return NextResponse.json({
      status: true,
      organization,
      message: "Sucesso na atualização"
    });
  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      {
        status: false,
        organization: null,
        message: "Erro interno no servidor"
      },
      { status: 500 }
    );
  }
}