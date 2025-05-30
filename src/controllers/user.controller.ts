// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';


const service = new UserService(); // Você já tem essa instância

export async function registerController(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, phone } = req.body; // Desestruturar para passar ao serviço
    const user = await service.register({ name, email, password, phone });
    // Retornando mais dados do usuário, como no seu original
    res.status(201).json({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone,
        // createdAt: user.createdAt // Opcional
    });
  } catch (err) {
    next(err); // Passa para o errorMiddleware
  }
}


// --- NOVO CONTROLLER DE LOGIN ---
export async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body; // O frontend enviará email e password
    console.log("🚀 ~ loginController ~ req:", req.body)

    if (!email || !password) {
      const err = new Error('Email e senha são obrigatórios.');
      (err as any).status = 400; // Bad Request
      throw err;
    }

    // No serviço, nomeei o campo de senha como password_provided para clareza
    const loginResponse = await service.login({ email, password_provided: password });
    
    res.json(loginResponse);
  } catch (err) {
    next(err); // Passa para o errorMiddleware
  }
}


function getAuthenticatedUserId(req: Request): number {
  if (!req.user || req.user.userId === undefined) {
    const err = new Error('Usuário não autenticado ou ID do usuário não encontrado no token.');
    (err as any).status = 401;
    throw err;
  }
  return req.user.userId;
}



export async function getUserController(req: Request, res: Response, next: NextFunction) {
     try {
         const authenticatedUserId = getAuthenticatedUserId(req); // Usuário logado
         const requestedUserId = parseInt(req.params.id, 10);

         // Por segurança, geralmente você só permite que um usuário veja seus próprios dados,
         // a menos que seja um admin.
         if (authenticatedUserId !== requestedUserId) {
              // Você pode também permitir se for um admin, adicionando lógica de role aqui
             const err = new Error('Acesso não autorizado aos dados deste usuário.');
             (err as any).status = 403; // Forbidden
             throw err;
         }
         if (isNaN(requestedUserId)) { /* ... erro ID inválido ... */ }
         const user = await new UserService().getById(requestedUserId); // Ou use a instância 'service'
         res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone });
     } catch (err) { next(err); }
}


export async function getDashboardStatsController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getAuthenticatedUserId(req); // <<< Pega o userId do token

    const stats = await new UserService().getDashboardStats(userId); // Use a instância correta do service
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function getTemperatureTrendController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getAuthenticatedUserId(req); // <<< Pega o userId do token

    const limitQuery = req.query.limit as string | undefined;
    const limit = limitQuery ? parseInt(limitQuery, 10) : undefined;
    if (limit !== undefined && isNaN(limit)) { /* ... erro ... */ }
    
    const temperatureData = await new UserService().getTemperatureTrend(userId, { limit }); // Use a instância correta
    res.json(temperatureData);
  } catch (err) {
    next(err);
  }
}

// --- FIM DO NOVO CONTROLLER DE LOGIN ---