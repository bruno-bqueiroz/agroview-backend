// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'SEU_FALLBACK_SECRETO_FORTE_AQUI_PARA_DEV';

// Sua declaração global e interface JwtPayload permanecem as mesmas
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
      };
    }
  }
}

interface JwtPayload {
  userId: number;
  email: string;
}

// Adicionar tipo de retorno explícito : void
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Nenhum token fornecido.' });
    return; // <<< Adicionar return
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    res.status(401).json({ error: 'Token mal formatado. Formato esperado: "Bearer [token]".' });
    return; // <<< Adicionar return
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };
    
    next(); // Chama next(), o que está correto e implicitamente leva a um retorno void
    // Não precisa de 'return next();' explicitamente se a função já é : void
  } catch (err) {
    // console.error("Erro na verificação do token:", err);
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expirado.' });
      return; // <<< Adicionar return
    }
    // Trata outros erros do jwt
    res.status(401).json({ error: 'Token inválido ou falha na autenticação.' });
    return; // <<< Adicionar return
  }
}