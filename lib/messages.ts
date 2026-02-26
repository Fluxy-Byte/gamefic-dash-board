import mongoose, { Schema, Document } from "mongoose";

/* ===============================
   CONEXÃO (COM CACHE)
================================ */
const MONGODB_URI = process.env.NEXT_MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("❌ DATABASE_URL_MONGO não definida");
}

console.log(MONGODB_URI)

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

async function connectMongo() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      console.log("✅ MongoDB conectado");
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/* ===============================
   INTERFACE
================================ */
export interface IMessage extends Document {
  id_user: Number;
  id_agent: Number;
  type_message: string;
  question_message: string;
  answer_message: string;
  date_recept_message: Date;
  date_send_message: Date;
  status_message: string;
}

/* ===============================
   SCHEMA
================================ */
const MessageSchema = new Schema<IMessage>(
  {
    id_user: {
      type: Number,
      required: true,
    },

    id_agent: {
      type: Number,
      required: true,
    },

    type_message: {
      type: String,
      required: true,
    },

    question_message: {
      type: String,
      required: true,
    },

    answer_message: {
      type: String,
      required: true,
    },

    date_recept_message: {
      type: Date,
      default: Date.now,
    },

    date_send_message: {
      type: Date,
    },

    status_message: {
      type: String,
      enum: ["enviado", "recebido", "erro", "pendente"],
      default: "pendente",
    },
  },
  {
    timestamps: true,
  }
);

/* ===============================
   MODEL
================================ */
const Message =
  mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);

/* ===============================
   FUNÇÕES
================================ */

// Buscar histórico
export async function coletarHistorico(
  id_user: number,
  id_agent: number
) {
  await connectMongo();

  const mensagens = await Message.find({ id_user, id_agent })
    .sort({ date_recept_message: 1 })
    .lean();

  console.log(mensagens)
  return mensagens;
}

// Criar mensagem
export async function criarMensagem(data: Partial<IMessage>) {
  await connectMongo();

  const mensagem = await Message.create(data);
  return mensagem;
}