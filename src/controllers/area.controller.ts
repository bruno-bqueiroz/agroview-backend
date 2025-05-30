// src/controllers/area.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AreaService } from '../services/area.service'; // Ajuste o caminho se o seu for diferente
import type { AreaUpdateData } from '../services/area.service'; // Importando a interface se você a definiu lá

// Instanciando o serviço para ser usado pelos controllers
const areaService = new AreaService();

/**
 * Controller para criar uma nova área.
 * Espera name, areaType e opcionalmente geom no corpo da requisição.
 * O userId é obtido do token JWT (req.user.userId) injetado pelo authMiddleware.
 */
export async function createAreaController(req: Request, res: Response, next: NextFunction) {
  try {
    // Verifica se o usuário está autenticado (o middleware já deve ter feito isso, mas é uma dupla checagem)
    if (!req.user || req.user.userId === undefined) {
      const err = new Error('Usuário não autenticado. Acesso negado.');
      (err as any).status = 401; // Unauthorized
      throw err;
    }
    const userId = req.user.userId;

    const { name, areaType, geom } = req.body;

    if (!name || !areaType) {
      const err = new Error('Campos obrigatórios "name" e "areaType" não fornecidos.');
      (err as any).status = 400; // Bad Request
      throw err;
    }

    // Prepara os dados para o serviço
    // O serviço AreaService.createArea já espera um objeto com userId, name, areaType, geom
    const areaData = {
      userId, // Vem do token autenticado
      name,
      areaType,
      geom: geom || null, // Garante que geom seja null se não fornecido
    };

    const newArea = await areaService.createArea(areaData);
    res.status(201).json(newArea);
  } catch (err) {
    next(err); // Passa o erro para o errorMiddleware
  }
}

/**
 * Controller para listar todas as áreas do usuário autenticado.
 * O userId é obtido do token JWT (req.user.userId).
 */
export async function listAreasController(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || req.user.userId === undefined) {
      const err = new Error('Usuário não autenticado. Acesso negado.');
      (err as any).status = 401;
      throw err;
    }
    const userId = req.user.userId;

    const areas = await areaService.listAreas(userId);
    res.status(200).json(areas);
  } catch (err) {
    next(err);
  }
}

/**
 * Controller para buscar uma área específica pelo seu ID.
 * O areaId vem dos parâmetros da rota.
 * O userId (do usuário autenticado) é usado pelo serviço para verificar a permissão.
 */
export async function getAreaByIdController(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || req.user.userId === undefined) {
      const err = new Error('Usuário não autenticado. Acesso negado.');
      (err as any).status = 401;
      throw err;
    }
    const userId = req.user.userId;
    const areaId = parseInt(req.params.areaId, 10);

    if (isNaN(areaId)) {
      const err = new Error('ID da área inválido na URL.');
      (err as any).status = 400;
      throw err;
    }

    const area = await areaService.getAreaById(areaId, userId); // Serviço agora verifica propriedade
    if (!area) { // Embora o serviço já lance erro 404, uma verificação aqui pode ser redundante ou para customizar
      const err = new Error('Área não encontrada ou acesso não autorizado.');
      (err as any).status = 404;
      throw err;
    }
    res.status(200).json(area);
  } catch (err) {
    next(err);
  }
}

/**
 * Controller para atualizar uma área existente.
 * O areaId vem dos parâmetros da rota.
 * Os dados para atualização vêm do corpo da requisição.
 * O userId (do usuário autenticado) é usado pelo serviço para verificar a permissão.
 */
export async function updateAreaController(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || req.user.userId === undefined) {
      const err = new Error('Usuário não autenticado. Acesso negado.');
      (err as any).status = 401;
      throw err;
    }
    const userId = req.user.userId;
    const areaId = parseInt(req.params.areaId, 10);

    if (isNaN(areaId)) {
      const err = new Error('ID da área inválido na URL.');
      (err as any).status = 400;
      throw err;
    }

    const { name, areaType, geom } = req.body;
    const updateData: AreaUpdateData = {}; // Usando a interface importada ou definida no serviço

    // Adiciona ao payload apenas os campos que foram realmente enviados
    if (name !== undefined) updateData.name = name;
    if (areaType !== undefined) updateData.areaType = areaType;
    if (geom !== undefined) updateData.geom = geom; // Permite null para limpar geom se desejado

    if (Object.keys(updateData).length === 0) {
      const err = new Error('Nenhum dado fornecido para atualização.');
      (err as any).status = 400;
      throw err;
    }

    const updatedArea = await areaService.updateArea(areaId, userId, updateData); // Serviço agora verifica propriedade
    res.status(200).json(updatedArea);
  } catch (err) {
    next(err);
  }
}

/**
 * Controller para deletar uma área.
 * O areaId vem dos parâmetros da rota.
 * O userId (do usuário autenticado) é usado pelo serviço para verificar a permissão.
 */
export async function deleteAreaController(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || req.user.userId === undefined) {
      const err = new Error('Usuário não autenticado. Acesso negado.');
      (err as any).status = 401;
      throw err;
    }
    const userId = req.user.userId;
    const areaId = parseInt(req.params.areaId, 10);

    if (isNaN(areaId)) {
      const err = new Error('ID da área inválido na URL.');
      (err as any).status = 400;
      throw err;
    }

    await areaService.deleteArea(areaId, userId); // Serviço agora verifica propriedade
    res.status(204).send(); // No Content
  } catch (err) {
    next(err);
  }
}