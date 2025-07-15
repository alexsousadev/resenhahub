import { PrismaService } from "../services/database.service";
import { v4 as uuidv4 } from 'uuid'; // Utilizando a função uuidv4 para gerar um nome único para cada resenha
import { readFileSync, writeFileSync } from "fs";
import { pegarNomeUsuario, pegarIdUsuario } from "./user.controller";
import path from "path";
import dayjs from "dayjs";
const prisma = new PrismaService();

type Review = {
    conteudo: string; // UUID
    dt_criacao: Date; // Data em formato ISO 8601
    dt_ultima_edicao: Date // Data em formato ISO 8601
    id: number; // ID da resenha
    titulo: string; // Título da resenha
    usuarioId: number; // ID do usuário
};

type formattedRev = {
    id: number,
    titulo: string,
    conteudo: string,
    nome_usuario: string,
    dt_criacao: string,
    dt_ultima_edicao: string,
    categorias: string[]
}

// pegando uma resenha especifica usando ID
const pegarResenha = async (id: number) => {
    try {
        const review = await prisma.resenha.findUnique({
            where: {
                id: id,
            },
        });

        if (!review) {
            throw new Error(`Resenha com o ${id} não foi encontrada.`);
        }

        return review;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// pegando todas as resenhas de um usuário
const pegarTodasResenhasDoUsuario = async (id: number) => {
    try {
        const review = await prisma.resenha.findMany({
            where: {
                usuarioId: id,
            },
        });

        if (!review) {
            throw new Error(`Nenhuma resenha foi encontrada.`);
        }

        return review;
    } catch (error) {
        console.error(error);
        throw error;
    }
};


// criando nova resenha de um usuario
const criarResenha = async (titulo: string, conteudo: string, categoria: string, IdUsuario: number) => {

    // gerando o arquivo .md do post
    const fileName = `${uuidv4()}`;
    const filePath = path.join(path.join(__dirname, '../../data/reviews'), fileName + ".md");

    writeFileSync(filePath, conteudo)

    try {
        // Primeiro, verificar se a categoria existe, se não, criar
        let categoriaObj = await prisma.categoria.findUnique({
            where: { nome: categoria }
        });

        if (!categoriaObj) {
            categoriaObj = await prisma.categoria.create({
                data: {
                    nome: categoria,
                    descricao: `Categoria para ${categoria}`
                }
            });
        }

        // Criar a resenha e conectar com a categoria
        await prisma.resenha.create({
            data: {
                titulo: titulo,
                conteudo: fileName,
                usuarioId: IdUsuario,
                categorias: {
                    connect: {
                        id: categoriaObj.id
                    }
                }
            },
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// ROTAS PÚBLICAS
// pegando todas as resenhas de um usuário
const pegarTodasResenhas = async () => {
    try {
        // Obtém todas as resenhas da tabela
        const reviews = await prisma.resenha.findMany();

        // Retorna a lista de resenhas (pode estar vazia)
        return reviews;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Formatar uma resenha
const formatarResenha = async (review: Review) => {
    try {
        let content = "Conteúdo não disponível";
        
        try {
            const filePath = path.join(__dirname, '../../data/reviews', `${review.conteudo}.md`);
            const fileContent = readFileSync(filePath, 'utf-8');
            content = fileContent.trim() || "Conteúdo não disponível";
        } catch (fileError) {
            console.error(`Erro ao ler arquivo da resenha ${review.id}:`, fileError);
            content = "Conteúdo não disponível";
        }

        let formattedDate = dayjs(new Date(review.dt_criacao)).format('DD/MM/YYYY HH:mm');
        let formattedDateMod = dayjs(new Date(review.dt_ultima_edicao)).format('DD/MM/YYYY HH:mm');

        const user = await pegarNomeUsuario(review.usuarioId);

        // Buscar categorias da resenha
        const resenhaComCategorias = await prisma.resenha.findUnique({
            where: { id: review.id },
            include: {
                categorias: true
            }
        });

        const categorias = resenhaComCategorias?.categorias.map(cat => cat.nome) || [];

        const formatted = {
            "id": review.id,
            "titulo": review.titulo,
            "conteudo": content,
            "nome_usuario": user || "Autor desconhecido",
            "dt_criacao": formattedDate,
            "dt_ultima_edicao": formattedDateMod,
            "categorias": categorias
        };

        return formatted;
    } catch (error) {
        console.error("Erro ao formatar a resenha:", error);
        throw error;
    }
};

// retorna várias resenhas formatadas
const formatarResenhas = async (reviews: Review[]) => {
    const formattedReviews: formattedRev[] = [];

    for (let review of reviews) {
        try {
            const newReview = await formatarResenha(review);
            formattedReviews.push(newReview);
        } catch (error) {
            console.error(`Erro ao formatar resenha ${review.id}:`, error);
            // Adiciona uma resenha com dados básicos em caso de erro
            formattedReviews.push({
                id: review.id,
                titulo: review.titulo || "Título não disponível",
                conteudo: "Conteúdo não disponível",
                nome_usuario: "Autor desconhecido",
                dt_criacao: "Data desconhecida",
                dt_ultima_edicao: "Data desconhecida",
                categorias: []
            });
        }
    }

    return formattedReviews;
};


// procura uma resenha especifica de um usuario
const resenhaEdoUsuario = async (reviewId: number, userId: number) => {
    const review = await prisma.resenha.findUnique({
        where: {
            id: reviewId,
            usuarioId: userId
        }
    });
    return review !== null;
}

const verificarResenhaExiste = async (reviewId: number) => {
    const review = await prisma.resenha.findUnique({
        where: {
            id: reviewId
        }
    });
    return review !== null;
}


// apagando resenha
const deletarResenha = async (reviewId: number) => {
    await prisma.$transaction(async (prisma) => {
        // Deletar todos os comentários associados à resenha
        await prisma.comentario.deleteMany({
            where: {
                resenhaId: reviewId
            }
        });

        // Agora deletar a resenha
        await prisma.resenha.delete({
            where: {
                id: reviewId
            }
        });
    });
};


async function atualizarResenha(id: number, data: { id: number, title: string; content: string }) {
    try {
        // Obtém o caminho do arquivo Markdown 

        const review = await prisma.resenha.findUnique({
            where: {
                id: id
            },

        });

        if (!review) {
            throw new Error("Nenhuma resenha encontrada.");
        }

        const reviewPath = path.join(__dirname, '../../data/reviews', review.conteudo + ".md");

        // Atualiza o conteúdo do arquivo com o novo conteúdo fornecido
        writeFileSync(reviewPath, data.content);

        // Atualiza a tabela no banco de dados
        const updatedReview = await prisma.resenha.update({
            where: { id },
            data: {
                titulo: data.title,
            },
        });

        return updatedReview;
    } catch (error) {
        console.error("Erro ao atualizar a resenha:", error);
        throw new Error("Erro ao atualizar a resenha.");
    }
}



export { pegarResenha, atualizarResenha, resenhaEdoUsuario, verificarResenhaExiste, deletarResenha, formatarResenha, formatarResenhas, criarResenha, pegarTodasResenhas, pegarTodasResenhasDoUsuario };