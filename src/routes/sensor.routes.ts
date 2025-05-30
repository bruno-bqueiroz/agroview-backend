// src/routes/sensor.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { 
  createSensorController, 
  listSensorsByUserController,
  getSensorByIdController,
  updateSensorController,
  deleteSensorController,
  createSensorReadingController,
  listSensorReadingsController
} from '../controllers/sensor.controller';

const sensorRouter = Router();

// Aplicar authMiddleware a todas as rotas de /sensors
sensorRouter.use(authMiddleware);

// Rotas CRUD para Sensores
sensorRouter.post('/', createSensorController);      // Criar sensor (userId do token)
sensorRouter.get('/', listSensorsByUserController); // Listar sensores do usuário (userId do token)
sensorRouter.get('/:sensorId', getSensorByIdController);    // Buscar sensor por ID (verifica propriedade)
sensorRouter.put('/:sensorId', updateSensorController);   // Atualizar sensor (verifica propriedade)
sensorRouter.delete('/:sensorId', deleteSensorController); // Deletar sensor (verifica propriedade)

// Rotas para Dados de um Sensor Específico (SensorData)
sensorRouter.post('/:sensorId/data', createSensorReadingController); // Adicionar leitura (verifica propriedade do sensor)
sensorRouter.get('/:sensorId/data', listSensorReadingsController);  // Listar leituras (verifica propriedade do sensor)

// A rota GET /sensors/area/:areaId foi removida, pois listamos agora por usuário autenticado.
// Se precisar dela, ela também precisaria de lógica de autorização (ex: a área pertence ao usuário?)

export default sensorRouter;