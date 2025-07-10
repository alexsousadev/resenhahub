import express, { Response, Request } from 'express'
import bodyParser from 'body-parser';
import publicReviewRoutes from './src/routes/public-review.routes'
import userRoutes from './src/routes/user.routes'
import commentRoutes from './src/routes/public-comment.routes'
import publicCommentRoutes from './src/routes/public-comment.routes'
import privateCommentRoutes from './src/routes/private-comment.routes'
import privateReviewRoutes from './src/routes/private-review.routes'
import privateRatingRoutes from './src/routes/private-rating.routes'
import publicRatingRoutes from './src/routes/public-rating.routes'
import session from 'express-session'

import path from 'path'
const app = express()

const PORT = process.env.PORT || 3000;
const JWT_KEY = process.env.JWT_SECRET_KEY || 'secret dog';

// configuração da sessão
app.use(session({
    secret: JWT_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 dias
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true em produção
        sameSite: 'lax'
    },
    name: 'connect.sid'
}));


app.use(express.json())
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// Rota principal
app.get("/", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
})

app.use(publicReviewRoutes, userRoutes,publicCommentRoutes, privateCommentRoutes, commentRoutes, privateReviewRoutes, privateRatingRoutes, publicRatingRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on  http://localhost:${PORT}`)
})