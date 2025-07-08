import { verify } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

const JWT_KEY = process.env.JWT_SECRET_KEY || 'secret dog'

function userAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.session.user;

    if (token) {
        verify(token, JWT_KEY, (err, decoded) => {
            if (err) {
                console.error('Erro de verificação do token:', err);
                return res.status(401).json({ error: 'Token inválido.' });
            }
            next();
        });
    } else {
        console.log('Nenhum token encontrado, redirecionando para login.');
        res.redirect('/login');
    }
}

export { userAuth };
