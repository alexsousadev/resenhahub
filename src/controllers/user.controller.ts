import { PrismaService } from "../services/database.service";
import { sign, verify, JwtPayload } from "jsonwebtoken"
import { compare } from 'bcrypt';

const prisma = new PrismaService();

const JWT_KEY = process.env.JWT_SECRET_KEY || 'secret dog'

// Validação do login
export async function checkLogin(email: string, password: string): Promise<boolean> {
    try {
        // Simulação de consulta ao banco de dados (por exemplo, usando Prisma ou outra ferramenta)
        const user = await prisma.usuario.findUnique({ where: { email } });

        // Checar se o usuário existe e se a senha está correta
        if (user && (await compare(password, user.senha))) {
            return true;
        }
        return false;
    } catch (error) {
        console.error("Erro na validação de login:", error);
        console.error("Detalhes do erro:", error instanceof Error ? error.message : "Erro desconhecido");
        throw error; // Isso vai cair no bloco catch do router e causar o "internal server error"
    }
}



// Checa se o usuário existe
export async function checkHasUser(email: string) {
    const user = await prisma.usuario.findUnique({
        where: { email: email },  // Busca o usuário pelo email
    });

    return !!user;  // Retorna true se o usuário existir, false se não existir
}


// cria um novo usuario 
export const createUser = async (nome: string, email: string, senha: string) => {
    await prisma.usuario.create({
        data: {
            nome: nome,
            email: email,
            senha: senha,
        },
    })

}

// geração do token
export const generateToken = (email: string) => {
    const JWT_KEY = process.env.JWT_SECRET_KEY

    if (!JWT_KEY) {
        throw new Error('JWT_SECRET_KEY não está definida no ambiente.');
    }

    const token = sign({ email }, JWT_KEY, { expiresIn: '1h' });
    return token;

}

// pega id do usuario com base no token
const getIdUser = async (token: string) => {
    try {

        if (!JWT_KEY) {
            throw Error('JWT_SECRET_KEY não está definida no ambiente.');
        }

        if (token) {
            const decoded = await verifyTokenAsync(token, JWT_KEY)

            if (decoded && typeof decoded !== 'string' && 'email' in decoded) {

                const user = await prisma.usuario.findUnique({
                    where: { email: decoded.email },  // Busca o usuário pelo email
                });

                if (!!user) {
                    return user.id;
                }
            }
        }
    } catch (err) {
        console.error('Erro ao pegar o ID do usuário:', err);
        throw err;  // Isso vai cair no bloco catch do router e causar o "internal server error"
    }
}

// Função para verificar o token de forma assíncrona
const verifyTokenAsync = (token: string, secret: string): Promise<JwtPayload | string> => {
    return new Promise((resolve, reject) => {
        verify(token, secret, (err, decoded) => {
            if (err || decoded == undefined) {
                return reject(err);
            }
            resolve(decoded);
        });
    });
};




// pega o nome de um usuário com base no id
const getNameUser = async (id: number) => {
    const user = await prisma.usuario.findUnique({
        where: {
            id: id
        },

        select: {
            nome: true
        }
    })

    return user?.nome;
}

export { getIdUser, getNameUser };