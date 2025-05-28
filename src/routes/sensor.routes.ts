import { Router } from 'express';
import { createSensorController, listSensorsController } from '../controllers/sensor.controller';

const sensorRouter = Router();
sensorRouter.post('/', createSensorController);
sensorRouter.get('/area/:areaId', listSensorsController);
export default sensorRouter;
