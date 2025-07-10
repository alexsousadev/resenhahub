import { Router, Request, Response } from "express";
import { checkLogin, checkHasUser, generateToken, createUser } from "../controllers/user.controller";
import { genSaltSync, hashSync } from 'bcrypt';
import { userAuth } from '../middlewere/user-auth.middlewere'
import { z, ZodError } from 'zod'
import path from "path";
import { verify } from 'jsonwebtoken';

const router = Router();
const JWT_KEY = process.env.JWT_SECRET_KEY || 'secret dog'

// validação do input de usuário
const userSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(2)
})

type userSchema = z.infer<typeof userSchema>

router.get("/login", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../public/login.html"));
});

router.get("/cadastro", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../public/cadastro.html"));
});

router.post("/login", async (req: Request, res: Response) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        // Validar credenciais do usuário
        const isValidLogin = await checkLogin(email, password);
        
        if (!isValidLogin) {
            return res.status(401).json({ error: "Email ou senha incorretos" });
        }

        // Gerar token JWT
        const token: string = generateToken(email);
        
        // Armazenar token na sessão
        req.session.user = token;

        res.redirect("/dashboard")
    
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ error: "Erro interno no servidor.", details: error instanceof Error ? error.message : "Erro desconhecido" });

    }
});

router.get("/logout", (req: Request, res: Response) => {
    // Limpar o cookie da sessão
    res.clearCookie('connect.sid');
    
    // Destruir a sessão
    req.session.destroy((err) => {
        if (err) {
            console.error("Erro ao destruir sessão:", err);
            return res.status(500).send("Erro ao encerrar a sessão.");
        }
        
        // Redirecionar para a página inicial
        res.redirect("/");
    });
});


router.post("/cadastro", async (req: Request, res: Response) => {

    try {
        const { name, email, password } = userSchema.parse(req.body)
        console.log("Email:", email, "Password:", password);


        const salt = genSaltSync(10);
        const hashedPassword = hashSync(password, salt);

        const registerValidation = await checkHasUser(email);
        if (registerValidation) {
            return res.status(409).json({ error: "Usuário já existe" }); // 409 Conflict
        }

        createUser(name, email, hashedPassword)
        return res.redirect("/login")
    } catch (error) {

        if (error instanceof ZodError) {
            return res.status(400).json({ error: "Dados de entrada inválidos" });
        }
        return res.status(500).json({ error: "Ocorreu um erro interno do servidor." });
    }
});


router.get("/dashboard", userAuth, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../public/dashboard.html"));
})

// Rota para verificar se o usuário está autenticado
router.get("/auth/status", (req: Request, res: Response) => {
    const token = req.session.user;
    
    if (token) {
        try {
            // Verificar se o token é válido
            const decoded = verify(token, JWT_KEY);
            res.json({ authenticated: true, user: decoded });
        } catch (error) {
            // Token inválido, destruir a sessão
            req.session.destroy(() => {});
            res.json({ authenticated: false });
        }
    } else {
        res.json({ authenticated: false });
    }
});

export default router;
