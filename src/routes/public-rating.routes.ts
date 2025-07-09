import { Router, Request, Response } from "express";
import { 
    getRatingsByReview, 
    getAverageRatingByReview 
} from "../controllers/rating.controller";

const router = Router();

// Buscar todas as avaliações de uma resenha (público)
router.get("/api/resenha/:resenhaId/avaliacoes", async (req: Request, res: Response) => {
    try {
        const resenhaId = parseInt(req.params.resenhaId);

        if (isNaN(resenhaId)) {
            return res.status(400).json({ error: "ID da resenha deve ser um número válido." });
        }

        const ratings = await getRatingsByReview(resenhaId);
        const averageRating = await getAverageRatingByReview(resenhaId);

        res.status(200).json({ 
            ratings, 
            averageRating 
        });
    } catch (error: any) {
        console.error("Erro ao buscar avaliações:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

// Buscar média de avaliações de uma resenha (público)
router.get("/api/resenha/:resenhaId/media-avaliacoes", async (req: Request, res: Response) => {
    try {
        const resenhaId = parseInt(req.params.resenhaId);

        if (isNaN(resenhaId)) {
            return res.status(400).json({ error: "ID da resenha deve ser um número válido." });
        }

        const averageRating = await getAverageRatingByReview(resenhaId);
        res.status(200).json(averageRating);
    } catch (error: any) {
        console.error("Erro ao buscar média de avaliações:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

export default router; 