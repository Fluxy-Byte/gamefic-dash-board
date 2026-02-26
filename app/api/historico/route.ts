import { NextResponse } from "next/server";
import { coletarHistorico } from "@/lib/messages";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user");
  const agent = searchParams.get("agent");

  if (!user || !agent) {
    return NextResponse.json(
      { status: false, historico: [] },
      { status: 400 }
    );
  }

  const historico = await coletarHistorico(Number(user), Number(agent));

  return NextResponse.json({
    status: true,
    historico,
  });
}