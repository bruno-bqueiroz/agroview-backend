import { AreaRepository } from '../repositories/area.repository';
import type { Area } from '@prisma/client';

export class AreaService {
  private repo = new AreaRepository();

  async createArea(data: { userId: number; name: string; areaType: string; geom?: any; }): Promise<Area> {
    // Transform userId into relation connect
    return this.repo.create({
      name: data.name,
      areaType: data.areaType,
      geom: data.geom,
      user: { connect: { id: data.userId } }
    });
  }

  async listAreas(userId: number): Promise<Area[]> {
    return this.repo.findByUser(userId);
  }
}