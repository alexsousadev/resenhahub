import { Router } from "express";
import { Request, Response } from "express";
import { criarComentario, atualizarComentario, deletarComentario, responderComentario, atualizarRespostaComentario, deletarRespostaComentario, listarRespostas, formatResposta, formatRespostas } from "../controllers/comment.controller";
import { userAuth } from "../middlewere/user-auth.middlewere";// middleware de autenticação
import { getIdUser } from "../controllers/user.controller";

const router = Router();

//COMENTÁRIOS A RESENHAS

// Criar um novo comentário
router.post('/api/comentario/criar', userAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.session?.user ? await getIdUser(req.session.user) : null;
        if (!userId) {
            return res.status(401).send({ message: "Usuário não autenticado." });
        }

        const { texto, resenhaId, respostaAId } = req.body;
        const novoComentario = await criarComentario(texto, userId, resenhaId, respostaAId);
        const comentarioFormatado = await formatResposta(novoComentario);

        res.status(201).json(comentarioFormatado);
    } catch (error) {
        res.status(500).send({ message: "Erro ao criar comentário." });
    }
});

//atualizar um comentário
router.put('/api/comentario/atualizar/:id', userAuth, async (req: Request, res: Response) => {
    const { id } = req.params;//obtém o id da URL
    const { texto } = req.body;//obtém o novo comentario

    try {
        const userId = req.session?.user ? await getIdUser(req.session.user) : null;
        if (!userId) {
            return res.status(401).send({ message: "Usuário não autenticado." });
        }

        if (!texto) {
            return res.status(400).send({ message: 'Texto do comentário não pode ser vazio.' });
        }

        const comentarioAtualizado = await atualizarComentario(Number(id), texto);
        if (!comentarioAtualizado) {
            return res.status(404).send({ message: 'Comentário não encontrado.' });
        }

        res.status(200).json(comentarioAtualizado);
    } catch (error) {
        res.status(500).send({ message: 'Erro ao atualizar comentário.' })
    }
});

//deletar comentário
router.delete('/api/comentario/deletar/:id', userAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.session?.user ? await getIdUser(req.session.user) : null;
        if (!userId) {
            return res.status(401).send({ message: "Usuário não autenticado." });
        }

        const id = parseInt(req.params.id.trim());
        const comentario = await deletarComentario(id);

        res.status(200).send(comentario);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: `Um erro ocorreu ao buscar o comentário.` });
    }
});

//RESPOSTAS A OUTROS COMENTARIOS

// Listar respostas de um comentário específico
router.get('/api/comentario/respostas/:comentarioId', async (req: Request, res: Response) => {
    try {
        const comentarioId = parseInt(req.params.comentarioId.trim());
        const respostas = await listarRespostas(comentarioId);

        if (!respostas.length) {
            return res.status(404).send({ message: 'Nenhuma resposta encontrada.' });
        }
        const respostasFormatadas = await formatRespostas(respostas);

        res.status(200).send(respostasFormatadas);
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar respostas." });
    }
});

//criar um comentario como resposta de outro comentario
router.post('/api/comentario/responder/:id', userAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.session?.user ? await getIdUser(req.session.user) : null;
        if (!userId) {
            return res.status(401).send({ message: "Usuário não autenticado." });
        }

        const { texto, usuarioId, resenhaId, respostaAId } = req.body;
        if (!texto || !usuarioId || !resenhaId || !respostaAId) {
            return res.status(400).send({ message: 'Faltam dados para criar a resposta ao comentário.' });
        }

        const novaResposta = await responderComentario(texto, usuarioId, resenhaId, respostaAId);
        const respostaFormatada = await formatResposta(novaResposta);
        res.status(201).json(respostaFormatada);
    } catch (error) {
        res.status(500).send({ message: "Erro ao responder ao comentário." });
    }
});

//atualizar um comentario
router.put('/api/comentario/atualizar-resposta/:id', userAuth, async (req: Request, res: Response) => {
    const { id } = req.params; // Obtém o id da URL
    const { texto } = req.body; // Obtém o novo texto da resposta

    try {
        const userId = req.session?.user ? await getIdUser(req.session.user) : null;
        if (!userId) {
            return res.status(401).send({ message: "Usuário não autenticado." });
        }
        if (!texto) {
            return res.status(400).send({ message: 'Texto da resposta não pode ser vazio.' });
        }
        const respostaAtualizada = await atualizarRespostaComentario(Number(id), texto);
        if (!respostaAtualizada) {
            return res.status(404).send({ message: 'Resposta não encontrada.' });
        }
        res.status(200).json(respostaAtualizada);
    } catch (error) {
        res.status(500).send({ message: 'Erro ao atualizar resposta ao comentário.' });
    }
});

router.delete('/api/comentario/deletar-resposta/:id', userAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.session?.user ? await getIdUser(req.session.user) : null;
        if (!userId) {
            return res.status(401).send({ message: "Usuário não autenticado." });
        }

        const id = parseInt(req.params.id.trim());
        const respostaDeletada = await deletarRespostaComentario(id);
        res.status(200).send(respostaDeletada);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: `Um erro ocorreu ao deletar a resposta ao comentário.` });
    }
});

export default router;