// types/express-session.d.ts

import session from 'express-session';

// Extensão da interface Session para incluir o campo 'user'
declare module 'express-session' {
    interface Session {
        user?: string; // Defina as informações que você vai armazenar, por exemplo, email
    }
}