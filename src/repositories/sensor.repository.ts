// src/repositories/sensor.repository.ts
import {prisma} from '../prismaClient';
import type { Sensor, Prisma, SensorData } from '@prisma/client';

export class SensorRepository {
  async create(data: Prisma.SensorUncheckedCreateInput): Promise<Sensor> {
    return prisma.sensor.create({
      data,
      include: { area: { select: { name: true } } },
    });
  }

  async findByUserId(userId: number): Promise<Sensor[]> {
    return prisma.sensor.findMany({
      where: { userId: userId },
      include: { area: { select: { name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findByAreaId(areaId: number): Promise<Sensor[]> { // Renomeado do seu 'findByArea' para clareza
    return prisma.sensor.findMany({
      where: { areaId },
      include: { area: { select: { name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number): Promise<Sensor | null> {
    return prisma.sensor.findUnique({
      where: { id },
      include: { area: { select: { name: true } } },
    });
  }

  // Para verificar se um sensor específico pertence a um usuário
  async findByIdAndUserId(id: number, userId: number): Promise<Sensor | null> {
    return prisma.sensor.findFirst({
      where: { id, userId },
      include: { area: { select: { name: true } } },
    });
  }

  async update(id: number, data: Prisma.SensorUpdateInput): Promise<Sensor> {
    return prisma.sensor.update({
      where: { id },
      data,
      include: { area: { select: { name: true } } },
    });
  }

  async delete(id: number): Promise<Sensor> {
    // Considere deletar SensorData associado aqui ou via cascade no Prisma schema
    await prisma.sensorData.deleteMany({ where: { sensorId: id }});
    return prisma.sensor.delete({ where: { id } });
  }

  // Métodos para SensorData (leituras)
  async createSensorReading(data: Prisma.SensorDataUncheckedCreateInput): Promise<SensorData> {
    return prisma.sensorData.create({
      data: {
        sensorId: data.sensorId,
        value: data.value,
        timestamp: data.timestamp || new Date(),
      },
    });
  }

  async findSensorReadings(
    sensorId: number,
    limit: number = 50,
    orderBy: 'asc' | 'desc' = 'desc'
  ): Promise<SensorData[]> {
    return prisma.sensorData.findMany({
      where: { sensorId },
      orderBy: { timestamp: orderBy },
      take: limit,
    });
  }
}