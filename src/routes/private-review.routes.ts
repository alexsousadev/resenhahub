import { Router, Request, Response } from "express";
import { createReview, updateReview, getAllReviewOfUser, checkReviewExists, formatReviews, deleteReview, reviewIsOfUser } from "../controllers/review.controller";
import { userAuth } from "../middlewere/user-auth.middlewere";
import { getIdUser } from "../controllers/user.controller";
import path from "path";

const router = Router();

router.get("/criar-resenha", userAuth, (req: Request, res: Response) => {
    const caminho = path.join(__dirname, '../../public/criar-resenha.html');
    res.sendFile(caminho); // Envia o arquivo HTML
});

router.get("/minhas-resenhas", userAuth, (req: Request, res: Response) => {
    const caminho = path.join(__dirname, '../../public/resenhas-usuario.html');
    res.sendFile(caminho); // Envia o arquivo HTML
});


// criação de resenha
router.post("/api/resenha", userAuth, async (req: Request, res: Response) => {
    try {
        const { title, content } = req.body;

        const userId = req.session?.user ? await getIdUser(req.session.user) : null

        if (!title || !content || !userId) {
            return res.status(400).json({ error: "Ocorreu algum erro." });
        }

        createReview(title, content, userId)

        // Retorna uma resposta de sucesso
        res.status(201).json({ message: "Resenha criada com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Não foi possível criar a resenha." });
    }
});

// lista as resenhas do usuário
router.get("/api/resenhas-usuario", userAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.session?.user ? await getIdUser(req.session.user) : null

        if (!userId) {
            return res.status(400).json({ error: "Ocorreu algum erro." });
        }

        const allReviews = await getAllReviewOfUser(userId);

        const formattedReviews = await formatReviews(allReviews);
        res.status(200).send(formattedReviews);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Não foi possível listar as resenhas do usuário." });
    }
});

router.get("/editar-resenha/:id", userAuth, async (req: Request, res: Response) => {
    const caminho = path.join(__dirname, '../../public/editar-resenha.html');
    res.sendFile(caminho);
});


// edição de resenha
router.put("/api/resenha/:id", userAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.session?.user ? await getIdUser(req.session.user) : null;
        const { title, content } = req.body;
        const id = parseInt(req.params.id.trim());

        // Verificações básicas
        if (!title || !content || !userId) {
            return res.status(400).json({ error: "Ocorreu algum erro. Campos faltando ou usuário não autenticado." });
        }

        const reviewAndUserIsValid = await reviewIsOfUser(id, userId);

        if (!reviewAndUserIsValid) {
            return res.status(401).json({ error: "Usuário não autorizado a editar esta resenha." });
        }

        await updateReview(id, { id, title, content });
        return res.status(200).json({ message: "Resenha atualizada com sucesso." });
    } catch (error) {
        console.error("Erro ao atualizar a resenha:", error);
        return res.status(500).json({ error: "Ocorreu um erro ao processar sua requisição." });
    }
});


// deleção de resenha
router.delete("/api/resenha/:id", userAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.session?.user ? await getIdUser(req.session.user) : null;
        const idReview = parseInt(req.params.id.trim());

        if (!userId) {
            return res.status(401).json({ "error": "Usuário não autenticado." });
        }

        // Verifica se a resenha existe
        const reviewExists = await checkReviewExists(idReview);

        if (!reviewExists) {
            return res.status(404).json({ "error": "Essa resenha não existe." });
        }

        // Verifica se a resenha pertence ao usuário
        const reviewAndUserIsValid = await reviewIsOfUser(idReview, userId);
        if (reviewAndUserIsValid) {
            await deleteReview(idReview);
            return res.status(200).json({
                "message": "Resenha removida com sucesso"
            });
        } else {
            return res.status(401).json({ "error": "Essa resenha não pertence a esse usuário." });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ "error": "Ocorreu um erro ao tentar remover a resenha." });
    }
});



export default router;