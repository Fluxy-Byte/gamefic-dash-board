


import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrganizationWithIdUser, createNewOrganization, updateOrganization } from "@/lib/organization";
import { createMember, updateMember } from "@/lib/member";
import { getUserWithEmail, updateRoleUser } from "@/lib/user";

export async function POST(req: Request) {
  try {
    const { email, idOrganization, role } = await req.json();

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { status: false, member: null, message: "Não encontramos a sessão do usuário" },
        { status: 401 }
      );
    }

    const user = session.user;

    if (user.role != "admin") {
      return NextResponse.json(
        { status: false, member: null, message: "Você não tem permissão para criar um membro ou editalo" },
        { status: 401 }
      );
    }

    const usuarioMember = await getUserWithEmail(email)

    if (!usuarioMember) {
      return NextResponse.json(
        { status: false, member: null, message: "Esse e-mail não foi encontrado" },
        { status: 401 }
      );
    }

    const registerMember = await createMember(
      idOrganization, role, usuarioMember.id
    );

    return NextResponse.json({
      status: true,
      member: registerMember,
      message: "Sucesso no registro do membro"
    });
  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      {
        status: false,
        member: null,
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
        { status: false, member: null, message: "Não encontramos a sessão do usuário" },
        { status: 401 }
      );
    }

    const user = session.user;
    if (user.role != "admin") {
      return NextResponse.json(
        { status: false, member: null, message: "Você não tem permissão para criar um membro ou editalo" },
        { status: 401 }
      );
    }

    const member = await updateMember(
      role, idOrganization, idMember
    );

    const resultUpdateUser = await updateRoleUser(member.userId, role);

    console.log(resultUpdateUser)

    console.log(member)

    return NextResponse.json({
      status: true,
      member,
      message: "Sucesso na atualização"
    });
  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      {
        status: false,
        member: null,
        message: "Erro interno no servidor"
      },
      { status: 500 }
    );
  }
}