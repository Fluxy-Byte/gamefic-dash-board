


import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrganizationWithIdUser, createNewOrganization, updateOrganization } from "@/lib/organization";
import { createMember } from "@/lib/member";

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
    const { name, slug, logo } = await req.json();

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

    const organization = await createNewOrganization(
      name,
      slug,
      logo ?? ""
    );

    if (organization) {
      await createMember(organization.id, user.id)
    }

    return NextResponse.json({
      status: true,
      organization,
      message: "Sucesso na criação"
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

export async function PUT(req: Request) {
  try {
    const { name, slug, logo, idOrganization } = await req.json();

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

    const organization = await updateOrganization(
      name,
      slug,
      logo ?? "",
      idOrganization
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