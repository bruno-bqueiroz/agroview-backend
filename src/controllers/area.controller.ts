// src/controllers/area.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AreaService } from '../services/area.service'; // Ajuste o caminho se necessário

const areaService = new AreaService(); // Você já tem essa instância

export async function createAreaController(req: Request, res: Response, next: NextFunction) {
  try {
    // userId deve vir do corpo da requisição por enquanto, ou do req.user.id quando tiver auth
    const { userId, name, areaType, geom } = req.body;

    if (!userId || !name || !areaType) {
      const err = new Error('Campos obrigatórios (userId, name, areaType) não fornecidos.');
      (err as any).status = 400;
      throw err;
    }

    const area = await areaService.createArea({ userId: Number(userId), name, areaType, geom });
    res.status(201).json(area);
  } catch (err) {
    next(err);
  }
}

export async function listAreasController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      const err = new Error('ID de usuário inválido na URL.');
      (err as any).status = 400;
      throw err;
    }
    const areas = await areaService.listAreas(userId);
    res.json(areas);
  } catch (err) {
    next(err);
  }
}

// --- NOVOS CONTROLLERS ---

export async function getAreaByIdController(req: Request, res: Response, next: NextFunction) {
  try {
    const areaId = Number(req.params.areaId);
    if (isNaN(areaId)) {
      const err = new Error('ID da área inválido na URL.');
      (err as any).status = 400;
      throw err;
    }
    // Aqui, futuramente, você pegaria o userId do req.user.id (do token JWT)
    // e passaria para o service para verificar a permissão.
    const area = await areaService.getAreaById(areaId);
    res.json(area);
  } catch (err) {
    next(err);
  }
}

export async function updateAreaController(req: Request, res: Response, next: NextFunction) {
  try {
    const areaId = Number(req.params.areaId);
    if (isNaN(areaId)) {
      const err = new Error('ID da área inválido na URL.');
      (err as any).status = 400;
      throw err;
    }
    // Os dados para atualização vêm do corpo da requisição
    const { name, areaType, geom } = req.body; 
    if (!name && !areaType && geom === undefined) {
        const err = new Error('Nenhum dado fornecido para atualização.');
        (err as any).status = 400;
        throw err;
    }
    // Futuramente, adicionar userId do token para verificação de permissão no serviço
    const updatedArea = await areaService.updateArea(areaId, { name, areaType, geom });
    res.json(updatedArea);
  } catch (err) {
    next(err);
  }
}

export async function deleteAreaController(req: Request, res: Response, next: NextFunction) {
  try {
    const areaId = Number(req.params.areaId);
    if (isNaN(areaId)) {
      const err = new Error('ID da área inválido na URL.');
      (err as any).status = 400;
      throw err;
    }
    // Futuramente, adicionar userId do token para verificação de permissão no serviço
    await areaService.deleteArea(areaId);
    res.status(204).send(); // 204 No Content é uma resposta comum para delete bem-sucedido
  } catch (err) {
    next(err);
  }
}
// --- FIM DOS NOVOS CONTROLLERS ---