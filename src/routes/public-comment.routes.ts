import { Router } from "express";
import { Request, Response } from "express";
import { listarComentarios, formatRespostas } from "../controllers/comment.controller";

const router = Router();

//listar os comentários de uma resenha
router.get('/resenhas/:resenhaId/listar-comentarios', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.resenhaId.trim());
        const comentarios = await listarComentarios(id);

        if (!comentarios.length) {
            return res.status(404).send({ message: 'Nenhum comentário encontrado.' });
        }
        const comentariosFormatados = await formatRespostas(comentarios);

        res.status(200).send(comentariosFormatados);
    } catch (error) {
        res.status(500).send({ message: "Erro ao buscar comentários." });
    }
});


export default router;