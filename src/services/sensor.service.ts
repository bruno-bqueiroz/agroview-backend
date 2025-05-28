import { SensorRepository } from '../repositories/sensor.repository';
import type { Sensor } from '@prisma/client';

export class SensorService {
  private repo = new SensorRepository();

  async createSensor(data: { areaId: number; name: string; type: string; model?: string; }): Promise<Sensor> {
    // Transform areaId into relation connect
    return this.repo.create({
      name: data.name,
      type: data.type,
      model: data.model,
      installedAt: new Date(),
      active: true,
      area: { connect: { id: data.areaId } }
    });
  }

  async listSensors(areaId: number): Promise<Sensor[]> {
    return this.repo.findByArea(areaId);
  }
}