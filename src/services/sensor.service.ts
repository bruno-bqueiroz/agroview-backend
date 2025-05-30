// src/services/sensor.service.ts
import { SensorRepository } from '../repositories/sensor.repository';
import { AreaRepository } from '../repositories/area.repository'; // Para validações de área
import type { Sensor, SensorData, Prisma } from '@prisma/client';

export interface CreateSensorDto {
  name: string;
  type: string;
  model?: string | null;
  active?: boolean;
  installedAt?: string | Date;
  areaId: number;
}

export interface UpdateSensorDto {
  name?: string;
  type?: string;
  model?: string | null;
  active?: boolean;
  installedAt?: string | Date;
  areaId?: number;
}

export interface CreateSensorReadingDto { // Renomeado para Dto
  value: number;
  timestamp?: Date | string;
}

export class SensorService {
  private sensorRepo = new SensorRepository();
  private areaRepo = new AreaRepository(); // Usado para verificar se a área pertence ao usuário

  async createSensor(data: CreateSensorDto, userId: number): Promise<Sensor> {
    const area = await this.areaRepo.findById(data.areaId); // O findById do AreaRepo precisa ser ajustado para verificar o userId ou o controller precisa garantir isso
    if (!area || area.userId !== userId) { // Garante que a área pertence ao usuário
      const err = new Error('Área não encontrada ou não pertence ao usuário.');
      (err as any).status = 404;
      throw err;
    }

    const sensorDataToCreate: Prisma.SensorUncheckedCreateInput = {
      name: data.name,
      type: data.type,
      model: data.model,
      installedAt: data.installedAt ? new Date(data.installedAt) : new Date(),
      active: data.active === undefined ? true : data.active,
      areaId: data.areaId,
      userId: userId, // Vincula o sensor ao usuário
    };
    return this.sensorRepo.create(sensorDataToCreate);
  }

  async listSensorsByUserId(userId: number): Promise<Sensor[]> {
    return this.sensorRepo.findByUserId(userId);
  }

  async getSensorById(sensorId: number, userId: number): Promise<Sensor> {
    const sensor = await this.sensorRepo.findByIdAndUserId(sensorId, userId);
    if (!sensor) {
      const err = new Error('Sensor não encontrado ou acesso não autorizado.');
      (err as any).status = 404;
      throw err;
    }
    return sensor;
  }

  async updateSensor(sensorId: number, userId: number, data: UpdateSensorDto): Promise<Sensor> {
    const existingSensor = await this.sensorRepo.findByIdAndUserId(sensorId, userId);
    if (!existingSensor) {
      const err = new Error('Sensor não encontrado para atualização ou acesso não autorizado.');
      (err as any).status = 404;
      throw err;
    }

    if (data.areaId !== undefined && data.areaId !== existingSensor.areaId) {
      const newArea = await this.areaRepo.findById(data.areaId); // Novamente, idealmente este findById também checaria o userId
      if (!newArea || newArea.userId !== userId) { // Garante que a nova área também pertença ao usuário
        const err = new Error('Nova área não encontrada ou não pertence ao usuário.');
        (err as any).status = 404;
        throw err;
      }
    }

    const updatePayload: Prisma.SensorUpdateInput = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.type !== undefined) updatePayload.type = data.type;
    if (data.hasOwnProperty('model')) updatePayload.model = data.model;
    if (data.active !== undefined) updatePayload.active = data.active;
    if (data.installedAt !== undefined) updatePayload.installedAt = new Date(data.installedAt);
    if (data.areaId !== undefined) updatePayload.area = { connect: { id: data.areaId } };

    if (Object.keys(updatePayload).length === 0) {
      const err = new Error('Nenhum dado válido fornecido para atualização.');
      (err as any).status = 400;
      throw err;
    }
    return this.sensorRepo.update(sensorId, updatePayload);
  }

  async deleteSensor(sensorId: number, userId: number): Promise<Sensor> {
    const existingSensor = await this.sensorRepo.findByIdAndUserId(sensorId, userId);
    if (!existingSensor) {
      const err = new Error('Sensor não encontrado para exclusão ou acesso não autorizado.');
      (err as any).status = 404;
      throw err;
    }
    return this.sensorRepo.delete(sensorId);
  }

  // --- Métodos para SensorData ---
  async addSensorReading(sensorId: number, userId: number, data: CreateSensorReadingDto): Promise<SensorData> {
    // Verificar se o sensorId pertence ao userId antes de adicionar a leitura
    const sensor = await this.sensorRepo.findByIdAndUserId(sensorId, userId);
    if (!sensor) {
      const err = new Error('Sensor não encontrado ou não pertence ao usuário para adicionar leitura.');
      (err as any).status = 404; // Ou 403
      throw err;
    }

    const readingData: Prisma.SensorDataUncheckedCreateInput = {
      sensorId: sensorId,
      value: data.value,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
    };
    return this.sensorRepo.createSensorReading(readingData); // Assumindo que createSensorReading está no SensorRepository
                                                          // Ou chame this.sensorDataRepo.create se você o criou
  }

  async listReadingsForSensor(sensorId: number, userId: number, limit?: number, orderBy?: 'asc' | 'desc'): Promise<SensorData[]> {
    // Verificar se o sensorId pertence ao userId antes de listar as leituras
    const sensor = await this.sensorRepo.findByIdAndUserId(sensorId, userId);
    if (!sensor) {
      const err = new Error('Sensor não encontrado ou não pertence ao usuário para buscar leituras.');
      (err as any).status = 404; // Ou 403
      throw err;
    }
    return this.sensorRepo.findSensorReadings(sensorId, limit, orderBy); // Assumindo que findSensorReadings está no SensorRepository
  }
}