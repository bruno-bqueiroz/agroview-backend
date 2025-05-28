import { prisma } from '../prismaClient';
import type { Sensor, Prisma } from '@prisma/client';

export class SensorRepository {
  async create(data: Prisma.SensorCreateInput): Promise<Sensor> {
    return prisma.sensor.create({ data });
  }

  async findByArea(areaId: number): Promise<Sensor[]> {
    return prisma.sensor.findMany({ where: { areaId } });
  }

  async findById(id: number): Promise<Sensor | null> {
    return prisma.sensor.findUnique({ where: { id } });
  }

  async update(id: number, data: Prisma.SensorUpdateInput): Promise<Sensor> {
    return prisma.sensor.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Sensor> {
    return prisma.sensor.delete({ where: { id } });
  }
}
