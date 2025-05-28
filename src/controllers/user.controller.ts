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

export async function getUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        const err = new Error('ID de usuário inválido.');
        (err as any).status = 400; // Bad Request
        throw err;
    }
    const user = await service.getById(id);
    // Retornando dados do usuário como no seu original
    res.json({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone 
    });
  } catch (err) {
    next(err);
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
// --- FIM DO NOVO CONTROLLER DE LOGIN ---