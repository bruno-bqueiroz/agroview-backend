import { Request, Response, NextFunction } from 'express';
import { AreaService } from '../services/area.service';

const areaService = new AreaService();

export async function createAreaController(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, name, areaType, geom } = req.body;
    const area = await areaService.createArea({ userId, name, areaType, geom });
    res.status(201).json(area);
  } catch (err) {
    next(err);
  }
}

export async function listAreasController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.params.userId);
    const areas = await areaService.listAreas(userId);
    res.json(areas);
  } catch (err) {
    next(err);
  }
}
