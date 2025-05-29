// src/controllers/sensor.controller.ts
import { Request, Response, NextFunction } from 'express';
import { SensorService } from '../services/sensor.service'; // Ajuste o caminho

const sensorService = new SensorService();

export async function createSensorController(req: Request, res: Response, next: NextFunction) {
  try {
    // Agora esperamos userId também, além dos outros campos.
    // active e installedAt podem ser opcionais no corpo, o serviço definirá defaults.
    const { areaId, userId, name, type, model, active, installedAt } = req.body;

    if (!areaId || !userId || !name || !type) {
      const err = new Error('Campos obrigatórios (areaId, userId, name, type) não fornecidos.');
      (err as any).status = 400;
      throw err;
    }

    const sensor = await sensorService.createSensor({
      areaId: Number(areaId),
      userId: Number(userId), // Passar o userId para o serviço
      name,
      type,
      model,
      active,
      installedAt: installedAt ? new Date(installedAt) : undefined // Converte para Date se fornecido
    });
    res.status(201).json(sensor);
  } catch (err) {
    next(err);
  }
}

// Modificado para ser listSensorsByUserController e usar req.query.userId
export async function listSensorsByUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const userIdString = req.query.userId as string; 

    if (!userIdString) {
      const err = new Error('O parâmetro de query "userId" é obrigatório.');
      (err as any).status = 400;
      throw err;
    }
    
    const userId = parseInt(userIdString, 10);
    if (isNaN(userId)) {
      const err = new Error('O parâmetro de query "userId" deve ser um número.');
      (err as any).status = 400;
      throw err;
    }

    const sensors = await sensorService.listSensorsByUserId(userId);
    res.json(sensors);
  } catch (err) {
    next(err);
  }
}

export async function listSensorReadingsController(req: Request, res: Response, next: NextFunction) {
  try {
    const sensorId = parseInt(req.params.sensorId, 10);
    if (isNaN(sensorId)) { /* ... erro ... */ }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const orderBy = req.query.orderBy as ('asc' | 'desc' | undefined);
    // ... (validações para limit e orderBy como antes) ...

    const readings = await sensorService.listReadingsForSensor(sensorId, limit, orderBy);
    res.json(readings);
  } catch (err) {
    next(err);
  }
}

// Controller para listar sensores por AreaId (se você quiser manter a rota antiga)
export async function listSensorsByAreaController(req: Request, res: Response, next: NextFunction) {
  try {
    const areaId = Number(req.params.areaId);
    if (isNaN(areaId)) {
        const err = new Error('ID da área inválido na URL.');
        (err as any).status = 400;
        throw err;
    }
    const sensors = await sensorService.listSensorsByAreaId(areaId);
    res.json(sensors);
  } catch (err) {
    next(err);
  }
}

export async function updateSensorController(req: Request, res: Response, next: NextFunction) {
  try {
    const sensorId = parseInt(req.params.sensorId, 10);
    if (isNaN(sensorId)) {
      const err = new Error('ID do sensor inválido na URL.');
      (err as any).status = 400;
      throw err;
    }

    // Pegar apenas os campos permitidos para atualização do corpo da requisição
    const { name, type, model, active, installedAt, areaId } = req.body;
    const updateData = { name, type, model, active, installedAt, areaId };

    // Validação para garantir que pelo menos um campo de atualização foi enviado
    if (Object.values(updateData).every(value => value === undefined)) {
        const err = new Error('Nenhum dado fornecido para atualização.');
        (err as any).status = 400;
        throw err;
    }
    
    // Converte areaId para número se presente
    if (updateData.areaId !== undefined) {
        updateData.areaId = Number(updateData.areaId);
        if (isNaN(updateData.areaId)) {
            const err = new Error('areaId fornecido para atualização é inválido.');
            (err as any).status = 400;
            throw err;
        }
    }


    const updatedSensor = await sensorService.updateSensor(sensorId, updateData);
    res.json(updatedSensor);
  } catch (err) {
    next(err);
  }
}
export async function createSensorReadingController(req: Request, res: Response, next: NextFunction) {
  try {
    const sensorId = parseInt(req.params.sensorId, 10);
    if (isNaN(sensorId)) {
      const err = new Error('ID do sensor inválido na URL.');
      (err as any).status = 400;
      throw err;
    }

    const { value, timestamp } = req.body;
    if (value === undefined || typeof value !== 'number') {
      const err = new Error('O campo "value" (numérico) é obrigatório para a leitura do sensor.');
      (err as any).status = 400;
      throw err;
    }

    const reading = await sensorService.addSensorReading(sensorId, { value, timestamp });
    res.status(201).json(reading);
  } catch (err) {
    next(err);
  }
}

export async function getSensorByIdController(req: Request, res: Response, next: NextFunction) {
    try {
        const sensorId = parseInt(req.params.sensorId, 10);
        if (isNaN(sensorId)) {
            const err = new Error('ID do sensor inválido na URL.');
            (err as any).status = 400;
            throw err;
        }
        const sensor = await sensorService.getSensorById(sensorId);
        res.json(sensor);
    } catch (err) {
        next(err);
    }
}

export async function deleteSensorController(req: Request, res: Response, next: NextFunction) {
  try {
    const sensorId = parseInt(req.params.sensorId, 10);
    if (isNaN(sensorId)) {
      const err = new Error('ID do sensor inválido na URL.');
      (err as any).status = 400;
      throw err;
    }

    await sensorService.deleteSensor(sensorId);
    res.status(204).send(); // Sucesso, sem conteúdo para retornar
  } catch (err) {
    next(err);
  }

  
}

// Adicionar getSensorByIdController, updateSensorController, deleteSensorController quando formos implementar o CRUD completo