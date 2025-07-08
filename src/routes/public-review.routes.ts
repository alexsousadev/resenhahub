import { Router, Request, Response } from "express";
import { formatReview, formatReviews, getAllReviews, getReview } from "../controllers/review.controller";
import path from "path";
import { userAuth } from "../middlewere/user-auth.middlewere";
const router = Router();

router.get("/resenhas", userAuth, (req: Request, res: Response) => {
    const caminho = path.join(__dirname, '../../public/resenhas.html');
    res.sendFile(caminho); // Envia o arquivo HTML
});

// retornar todas as resenhas
router.get("/api/resenhas", async (req: Request, res: Response) => {
    try {
        const review = await getAllReviews();
        const formattedReviews = await formatReviews(review);
        res.status(200).json(formattedReviews);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Não foi possível exibir as resenhas." });
    }
});


// busca resenha especifica
router.get("/api/resenha/:id", async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id.trim());
        const review = await getReview(id);
        const formatedReview = await formatReview(review);
        res.status(200).json(formatedReview);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Um erro ocorreu ao buscar a resenha" });
    }
});

router.get("/resenha/:id", async (req: Request, res: Response) => {
    const caminho = path.join(__dirname, '../../public/resenha.html');
    res.sendFile(caminho);
});


export default router;