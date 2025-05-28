import { Request, Response, NextFunction } from 'express';
import { SensorService } from '../services/sensor.service';

const sensorService = new SensorService();

export async function createSensorController(req: Request, res: Response, next: NextFunction) {
  try {
    const { areaId, name, type, model } = req.body;
    const sensor = await sensorService.createSensor({ areaId, name, type, model });
    res.status(201).json(sensor);
  } catch (err) {
    next(err);
  }
}

export async function listSensorsController(req: Request, res: Response, next: NextFunction) {
  try {
    const areaId = Number(req.params.areaId);
    const sensors = await sensorService.listSensors(areaId);
    res.json(sensors);
  } catch (err) {
    next(err);
  }
}
