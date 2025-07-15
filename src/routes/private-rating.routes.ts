import { Router, Request, Response } from "express";
import {
    criarAvaliacao,
    atualizarAvaliacao,
    buscarAvaliacaoPorUsuarioEResenha,
    buscarAvaliacoesPorResenha,
    buscarAvaliacoesPorUsuario,
    deletarAvaliacao,
    calcularMediaAvaliacaoPorResenha,
} from "../controllers/rating.controller";
import { userAuth } from "../middlewere/user-auth.middlewere";
import { pegarIdUsuario } from "../controllers/user.controller";

const router = Router();

// Criar uma nova avaliação
router.post("/api/avaliacao", userAuth, async (req: Request, res: Response) => {
    try {
        const { resenhaId, nota } = req.body;
        const userId = req.session?.user ? await pegarIdUsuario(req.session.user) : null;

        if (!resenhaId || nota === undefined || !userId) {
            return res.status(400).json({ error: "Dados incompletos. Resenha ID, nota e usuário são obrigatórios." });
        }

        const resenhaIdNum = parseInt(resenhaId);
        const notaNum = parseFloat(nota);

        if (isNaN(resenhaIdNum) || isNaN(notaNum)) {
            return res.status(400).json({ error: "ID da resenha e nota devem ser números válidos." });
        }

        const rating = await criarAvaliacao(userId, resenhaIdNum, notaNum);
        res.status(201).json({
            message: "Avaliação criada com sucesso",
            rating
        });
    } catch (error: any) {
        console.error("Erro ao criar avaliação:", error);
        res.status(400).json({ error: error.message });
    }
});

// Atualizar uma avaliação existente
router.put("/api/avaliacao/:resenhaId", userAuth, async (req: Request, res: Response) => {
    try {
        const { nota } = req.body;
        const resenhaId = parseInt(req.params.resenhaId);
        const userId = req.session?.user ? await pegarIdUsuario(req.session.user) : null;

        if (!nota || !userId) {
            return res.status(400).json({ error: "Nota e usuário são obrigatórios." });
        }

        if (isNaN(resenhaId)) {
            return res.status(400).json({ error: "ID da resenha deve ser um número válido." });
        }

        const notaNum = parseFloat(nota);
        if (isNaN(notaNum)) {
            return res.status(400).json({ error: "Nota deve ser um número válido." });
        }

        const rating = await atualizarAvaliacao(userId, resenhaId, notaNum);
        res.status(200).json({
            message: "Avaliação atualizada com sucesso",
            rating
        });
    } catch (error: any) {
        console.error("Erro ao atualizar avaliação:", error);
        res.status(400).json({ error: error.message });
    }
});

// Buscar avaliação do usuário para uma resenha específica
router.get("/api/avaliacao/:resenhaId", userAuth, async (req: Request, res: Response) => {
    try {
        const resenhaId = parseInt(req.params.resenhaId);
        const userId = req.session?.user ? await pegarIdUsuario(req.session.user) : null;

        if (!userId) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        if (isNaN(resenhaId)) {
            return res.status(400).json({ error: "ID da resenha deve ser um número válido." });
        }

        const rating = await buscarAvaliacaoPorUsuarioEResenha(userId, resenhaId);

        if (!rating) {
            return res.status(404).json({ message: "Usuário ainda não avaliou esta resenha." });
        }

        res.status(200).json({ rating });
    } catch (error: any) {
        console.error("Erro ao buscar avaliação:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

// Buscar todas as avaliações de uma resenha (público)
router.get("/api/resenha/:resenhaId/avaliacoes", async (req: Request, res: Response) => {
    try {
        const resenhaId = parseInt(req.params.resenhaId);

        if (isNaN(resenhaId)) {
            return res.status(400).json({ error: "ID da resenha deve ser um número válido." });
        }

        const ratings = await buscarAvaliacoesPorResenha(resenhaId);
        const averageRating = await calcularMediaAvaliacaoPorResenha(resenhaId);

        res.status(200).json({
            ratings,
            averageRating
        });
    } catch (error: any) {
        console.error("Erro ao buscar avaliações:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

// Buscar todas as avaliações feitas pelo usuário
router.get("/api/minhas-avaliacoes", userAuth, async (req: Request, res: Response) => {
    try {
        const userId = req.session?.user ? await pegarIdUsuario(req.session.user) : null;

        if (!userId) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        const ratings = await buscarAvaliacoesPorUsuario(userId);
        res.status(200).json({ ratings });
    } catch (error: any) {
        console.error("Erro ao buscar avaliações do usuário:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

// Deletar uma avaliação
router.delete("/api/avaliacao/:resenhaId", userAuth, async (req: Request, res: Response) => {
    try {
        const resenhaId = parseInt(req.params.resenhaId);
        const userId = req.session?.user ? await pegarIdUsuario(req.session.user) : null;

        if (!userId) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        if (isNaN(resenhaId)) {
            return res.status(400).json({ error: "ID da resenha deve ser um número válido." });
        }

        const result = await deletarAvaliacao(userId, resenhaId);
        res.status(200).json(result);
    } catch (error: any) {
        console.error("Erro ao deletar avaliação:", error);
        res.status(400).json({ error: error.message });
    }
});

// Buscar média de avaliações de uma resenha (público)
router.get("/api/resenha/:resenhaId/media-avaliacoes", async (req: Request, res: Response) => {
    try {
        const resenhaId = parseInt(req.params.resenhaId);

        if (isNaN(resenhaId)) {
            return res.status(400).json({ error: "ID da resenha deve ser um número válido." });
        }

        const averageRating = await calcularMediaAvaliacaoPorResenha(resenhaId);
        res.status(200).json(averageRating);
    } catch (error: any) {
        console.error("Erro ao buscar média de avaliações:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

export default router; 