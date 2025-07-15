import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Criar uma nova avaliação
export const criarAvaliacao = async (userId: number, resenhaId: number, nota: number) => {
    try {
        // Verificar se a nota está no intervalo válido (0-10)
        if (nota < 0 || nota > 10) {
            throw new Error('A nota deve estar entre 0 e 10');
        }

        // Verificar se a resenha existe
        const resenha = await prisma.resenha.findUnique({
            where: { id: resenhaId }
        });

        if (!resenha) {
            throw new Error('Resenha não encontrada');
        }

        // Verificar se o usuário já avaliou esta resenha
        const existingRating = await prisma.avaliacao.findUnique({
            where: {
                usuarioId_resenhaId: {
                    usuarioId: userId,
                    resenhaId: resenhaId
                }
            }
        });

        let rating;
        if (existingRating) {
            // Se já existe, atualizar a avaliação
            rating = await prisma.avaliacao.update({
                where: {
                    usuarioId_resenhaId: {
                        usuarioId: userId,
                        resenhaId: resenhaId
                    }
                },
                data: {
                    nota,
                    dt_criacao: new Date()
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true
                        }
                    },
                    resenha: {
                        select: {
                            id: true,
                            titulo: true
                        }
                    }
                }
            });
        } else {
            // Se não existe, criar nova avaliação
            rating = await prisma.avaliacao.create({
                data: {
                    nota,
                    usuarioId: userId,
                    resenhaId: resenhaId
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true
                        }
                    },
                    resenha: {
                        select: {
                            id: true,
                            titulo: true
                        }
                    }
                }
            });
        }

        return rating;
    } catch (error) {
        throw error;
    }
};

// Atualizar uma avaliação existente
export const atualizarAvaliacao = async (userId: number, resenhaId: number, novaNota: number) => {
    try {
        // Verificar se a nota está no intervalo válido (0-10)
        if (novaNota < 0 || novaNota > 10) {
            throw new Error('A nota deve estar entre 0 e 10');
        }

        // Verificar se a avaliação existe e pertence ao usuário
        const existingRating = await prisma.avaliacao.findUnique({
            where: {
                usuarioId_resenhaId: {
                    usuarioId: userId,
                    resenhaId: resenhaId
                }
            }
        });

        if (!existingRating) {
            throw new Error('Avaliação não encontrada');
        }

        // Atualizar a avaliação
        const updatedRating = await prisma.avaliacao.update({
            where: {
                usuarioId_resenhaId: {
                    usuarioId: userId,
                    resenhaId: resenhaId
                }
            },
            data: {
                nota: novaNota,
                dt_criacao: new Date()
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                },
                resenha: {
                    select: {
                        id: true,
                        titulo: true
                    }
                }
            }
        });

        return updatedRating;
    } catch (error) {
        throw error;
    }
};

// Buscar avaliação de um usuário para uma resenha específica
export const buscarAvaliacaoPorUsuarioEResenha = async (userId: number, resenhaId: number) => {
    try {
        const rating = await prisma.avaliacao.findUnique({
            where: {
                usuarioId_resenhaId: {
                    usuarioId: userId,
                    resenhaId: resenhaId
                }
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                },
                resenha: {
                    select: {
                        id: true,
                        titulo: true
                    }
                }
            }
        });

        return rating;
    } catch (error) {
        throw error;
    }
};

// Buscar todas as avaliações de uma resenha
export const buscarAvaliacoesPorResenha = async (resenhaId: number) => {
    try {
        const ratings = await prisma.avaliacao.findMany({
            where: {
                resenhaId: resenhaId
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                }
            },
            orderBy: {
                dt_criacao: 'desc'
            }
        });

        return ratings;
    } catch (error) {
        throw error;
    }
};

// Buscar todas as avaliações feitas por um usuário
export const buscarAvaliacoesPorUsuario = async (userId: number) => {
    try {
        const ratings = await prisma.avaliacao.findMany({
            where: {
                usuarioId: userId
            },
            include: {
                resenha: {
                    select: {
                        id: true,
                        titulo: true,
                        conteudo: true
                    }
                }
            },
            orderBy: {
                dt_criacao: 'desc'
            }
        });

        return ratings;
    } catch (error) {
        throw error;
    }
};

// Deletar uma avaliação
export const deletarAvaliacao = async (userId: number, resenhaId: number) => {
    try {
        // Verificar se a avaliação existe e pertence ao usuário
        const existingRating = await prisma.avaliacao.findUnique({
            where: {
                usuarioId_resenhaId: {
                    usuarioId: userId,
                    resenhaId: resenhaId
                }
            }
        });

        if (!existingRating) {
            throw new Error('Avaliação não encontrada');
        }

        // Deletar a avaliação
        await prisma.avaliacao.delete({
            where: {
                usuarioId_resenhaId: {
                    usuarioId: userId,
                    resenhaId: resenhaId
                }
            }
        });

        return { message: 'Avaliação deletada com sucesso' };
    } catch (error) {
        throw error;
    }
};

// Calcular média das avaliações de uma resenha
export const calcularMediaAvaliacaoPorResenha = async (resenhaId: number) => {
    try {
        const result = await prisma.avaliacao.aggregate({
            where: {
                resenhaId: resenhaId
            },
            _avg: {
                nota: true
            },
            _count: {
                nota: true
            }
        });

        return {
            media: result._avg.nota || 0,
            totalAvaliacoes: result._count.nota
        };
    } catch (error) {
        throw error;
    }
};

// Verificar se uma avaliação existe
export const verificarAvaliacaoExiste = async (userId: number, resenhaId: number) => {
    try {
        const rating = await prisma.avaliacao.findUnique({
            where: {
                usuarioId_resenhaId: {
                    usuarioId: userId,
                    resenhaId: resenhaId
                }
            }
        });

        return !!rating;
    } catch (error) {
        throw error;
    }
}; 