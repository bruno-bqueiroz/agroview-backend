// src/controllers/sensor.controller.ts
import { Request, Response, NextFunction } from 'express';
import { SensorService, CreateSensorDto, UpdateSensorDto, CreateSensorReadingDto } from '../services/sensor.service';

const sensorService = new SensorService();

// Função helper para obter userId autenticado
function getAuthenticatedUserId(req: Request): number {
  if (!req.user || req.user.userId === undefined) {
    const err = new Error('Usuário não autenticado ou ID do usuário não encontrado no token.');
    (err as any).status = 401;
    throw err;
  }
  return req.user.userId;
}

export async function createSensorController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getAuthenticatedUserId(req);
    const { name, type, model, active, installedAt, areaId } = req.body;

    if (name === undefined || type === undefined || areaId === undefined) {
      const err = new Error('Campos obrigatórios (name, type, areaId) não fornecidos.');
      (err as any).status = 400;
      throw err;
    }

    const sensorData: CreateSensorDto = {
      name, type, model, active,
      installedAt: installedAt ? String(installedAt) : undefined, // Serviço espera string ou Date
      areaId: Number(areaId),
    };

    const newSensor = await sensorService.createSensor(sensorData, userId);
    res.status(201).json(newSensor);
  } catch (err) {
    next(err);
  }
}

export async function listSensorsByUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getAuthenticatedUserId(req);
    const sensors = await sensorService.listSensorsByUserId(userId);
    res.status(200).json(sensors);
  } catch (err) {
    next(err);
  }
}

export async function getSensorByIdController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getAuthenticatedUserId(req);
    const sensorId = parseInt(req.params.sensorId, 10);

    if (isNaN(sensorId)) {
      const err = new Error('ID do sensor inválido na URL.');
      (err as any).status = 400;
      throw err;
    }
    const sensor = await sensorService.getSensorById(sensorId, userId);
    res.status(200).json(sensor);
  } catch (err) {
    next(err);
  }
}

export async function updateSensorController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getAuthenticatedUserId(req);
    const sensorId = parseInt(req.params.sensorId, 10);

    if (isNaN(sensorId)) {
      const err = new Error('ID do sensor inválido na URL.');
      (err as any).status = 400;
      throw err;
    }

    const { name, type, model, active, installedAt, areaId } = req.body;
    const updateData: UpdateSensorDto = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (model !== undefined) updateData.model = model;
    if (active !== undefined) updateData.active = active;
    if (installedAt !== undefined) updateData.installedAt = String(installedAt);
    if (areaId !== undefined) updateData.areaId = Number(areaId);

    if (Object.keys(updateData).length === 0) {
      const err = new Error('Nenhum dado fornecido para atualização.');
      (err as any).status = 400;
      throw err;
    }

    const updatedSensor = await sensorService.updateSensor(sensorId, userId, updateData);
    res.status(200).json(updatedSensor);
  } catch (err) {
    next(err);
  }
}

export async function deleteSensorController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getAuthenticatedUserId(req);
    const sensorId = parseInt(req.params.sensorId, 10);

    if (isNaN(sensorId)) {
      const err = new Error('ID do sensor inválido na URL.');
      (err as any).status = 400;
      throw err;
    }
    await sensorService.deleteSensor(sensorId, userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// --- CONTROLLERS PARA SensorData ---
export async function createSensorReadingController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getAuthenticatedUserId(req); // Usuário autenticado
    const sensorId = parseInt(req.params.sensorId, 10);

    if (isNaN(sensorId)) {
      const err = new Error('ID do sensor inválido na URL.');
      (err as any).status = 400;
      throw err;
    }

    const { value, timestamp } = req.body;
    if (value === undefined || typeof value !== 'number') {
      const err = new Error('O campo "value" (numérico) é obrigatório.');
      (err as any).status = 400;
      throw err;
    }
    const readingData: CreateSensorReadingDto = { value, timestamp };
    // O serviço addSensorReading agora também verifica se o sensorId pertence ao userId
    const reading = await sensorService.addSensorReading(sensorId, userId, readingData);
    res.status(201).json(reading);
  } catch (err) {
    next(err);
  }
}

export async function listSensorReadingsController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getAuthenticatedUserId(req); // Usuário autenticado
    const sensorId = parseInt(req.params.sensorId, 10);

    if (isNaN(sensorId)) {
      const err = new Error('ID do sensor inválido na URL.');
      (err as any).status = 400;
      throw err;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const orderBy = req.query.orderBy as ('asc' | 'desc' | undefined);
    // Validações para limit e orderBy...

    // O serviço listReadingsForSensor agora também verifica se o sensorId pertence ao userId
    const readings = await sensorService.listReadingsForSensor(sensorId, userId, limit, orderBy);
    res.json(readings);
  } catch (err) {
    next(err);
  }
}

// Removido listSensorsByAreaController se não for mais usado diretamente pela rota,
// ou mantenha se a rota GET /sensors/area/:areaId ainda for necessária e protegida de outra forma.