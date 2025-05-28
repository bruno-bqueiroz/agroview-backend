import { Router } from 'express';
import { createAreaController, listAreasController } from '../controllers/area.controller';

const areaRouter = Router();
areaRouter.post('/', createAreaController);
areaRouter.get('/user/:userId', listAreasController);
export default areaRouter;

