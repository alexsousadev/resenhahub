import { PrismaClient } from "@prisma/client";
import dayjs from 'dayjs';
import { pegarNomeUsuario } from './user.controller';
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
            where: { 
                resenhaId: Number(id),
                respostaAId: null // Apenas comentários principais, não respostas
            },
            include: {
                usuario: true //detalhes do usuario
            }
        });
        return comentarios || [];
    } catch (error) {
        console.error(error);
        throw error;
    }
};

//criar um novo comentario
export const criarComentario = async (texto: string, usuarioId: number, resenhaId: number, respostaAId?: number) => {
    try {
        const novoComentario = await prisma.comentario.create({
            data:
            {
                texto,
                usuarioId,
                resenhaId,
                respostaAId: respostaAId || null,
            },
        });

        return novoComentario;
    } catch (error) {
        console.log(error);
        throw new Error('Erro ao criar comentário.');
    }
};

// atualizar um comentario
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

// deletar um comentario
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

// responder a um comentario
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

// atualizar uma resposta de comentario
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

// deletar uma resposta de comentario
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
        const user = await pegarNomeUsuario(resposta.usuarioId);

        const formatted = {
            id: resposta.id,
            texto: resposta.texto,
            nome_usuario: user || "Usuário desconhecido",
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
            // Adiciona uma resposta com dados básicos em caso de erro
            formattedRespostas.push({
                id: resposta.id,
                texto: resposta.texto || "Texto não disponível",
                nome_usuario: "Usuário desconhecido",
                dt_criacao: "Data desconhecida",
                respostaAId: resposta.respostaAId
            });
        }
    }

    return formattedRespostas;
};