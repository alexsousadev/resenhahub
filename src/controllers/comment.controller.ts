import { PrismaClient } from "@prisma/client";
import dayjs from 'dayjs';
import { getNameUser } from './user.controller';
import { Comentario } from '@prisma/client';


const prisma = new PrismaClient();

type  formattedResposta = {
    id: number;
    texto: string;
    nome_usuario: string;
    dt_criacao: string;
    respostaAId: number | null;
}

//COMENTÁRIOS A RESENHAS

//lista todos os comentarios
export const listarComentarios = async (id: number) => {
    try {
        const comentarios = await prisma.comentario.findMany({
            where: { resenhaId: Number(id) },
            include: {
                usuario: true, //detalhes do usuario
                respostas: true //respostas ao comentario
            }
        });
        if (!comentarios) {
            throw new Error(`Os comentários da resenha ${id} não foram encontrados.`);
        }
        return comentarios;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const criarComentario = async (texto: string, usuarioId: number, resenhaId: number, respostaAId: number) => {
    try {
        const novoComentario = await prisma.comentario.create({
            data:
            {
                texto,
                usuarioId,
                resenhaId,
                respostaAId,
            },
        });

        return novoComentario;
    } catch (error) {
        console.log(error);
        throw new Error('Erro ao criar comentário.');
    }
};

export const atualizarComentario = async (id: number, texto: string) => {
    try {
        const comentariosExistente = await prisma.comentario.findUnique({
            where: { id: Number(id) }
        });

        if (!comentariosExistente) {
            throw new Error(`Comentário não encontrado.`);
        }

        const comentarioAtulizado = await prisma.comentario.update({
            where: { id: Number(id) },
            data: { texto }
        });

        return comentarioAtulizado;
    } catch (error) {
        throw new Error('Erro ao atualizar comentário.');
    }
};

export const deletarComentario = async (id: number) => {
    try {
        const comentario = await prisma.comentario.findUnique({
            where: { id: Number(id) },
        });

        if (!comentario) {
            throw new Error(`Comentário não encontrado.`);
        }

        await prisma.comentario.delete({
            where: { id: Number(id) },
        });

        return comentario;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

//RESPOSTAS A OUTROS COMENTARIOS
export const listarRespostas = async (comentarioId: number) => {
    try {
        const respostas = await prisma.comentario.findMany({
            where: { respostaAId: comentarioId },
            include: {
                usuario: true, // Inclui detalhes do usuário
            },
        });
        return respostas;
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao listar respostas.');
    }
};

export const responderComentario = async (texto: string, usuarioId: number, resenhaId: number, respostaAId: number) => {
    try {
        const novaResposta = await prisma.comentario.create({
            data: {
                texto,
                usuarioId,
                resenhaId,
                respostaAId,
            },
        });
        return novaResposta;
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao responder ao comentário.');
    }
};

export const atualizarRespostaComentario = async (id: number, texto: string) => {
    try {
        const respostaExistente = await prisma.comentario.findUnique({
            where: { id: Number(id) }
        });
        if (!respostaExistente) {
            throw new Error(`Resposta não encontrada.`);
        }
        const respostaAtualizada = await prisma.comentario.update({
            where: { id: Number(id) },
            data: { texto }
        });
        return respostaAtualizada;
    } catch (error) {
        throw new Error('Erro ao atualizar resposta ao comentário.');
    }
};

export const deletarRespostaComentario = async (id: number) => {
    try {
        const resposta = await prisma.comentario.findUnique({
            where: { id: Number(id) },
        });
        if (!resposta) {
            throw new Error(`Resposta não encontrada.`);
        }
        await prisma.comentario.delete({
            where: { id: Number(id) },
        });
        return resposta;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

//FORMATAÇÃO DAS RESPOSTAS

// uma única resposta formatada
export const formatResposta = async (resposta: Comentario): Promise<formattedResposta> => {
    try {
        let formattedDate = dayjs(new Date(resposta.dt_criacao)).format('DD/MM/YYYY HH:mm');
        const user = await getNameUser(resposta.usuarioId);

        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        const formatted = {
            id: resposta.id,
            texto: resposta.texto,
            nome_usuario: user,
            dt_criacao: formattedDate,
            respostaAId: resposta.respostaAId,
        };

        return formatted;
    } catch (error) {
        console.error("Erro ao formatar a resposta:", error);
        throw error;
    }
};

// lista de respostas formatada
export const formatRespostas = async (respostas: Comentario[]): Promise<formattedResposta[]> => {
    const formattedRespostas: formattedResposta[] = [];

    for (let resposta of respostas) {
        try {
            const formattedResposta = await formatResposta(resposta);
            formattedRespostas.push(formattedResposta);
        } catch (error) {
            console.error(`Erro ao formatar resposta ${resposta.id}:`, error);
        }
    }

    return formattedRespostas;
};