// src/routes/user.routes.ts
import { Router } from 'express';
import { 
  registerController, 
  getUserController, 
  loginController,
  getDashboardStatsController, // Controller para estatísticas
  getTemperatureTrendController 
} from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Rotas públicas
router.post('/register', registerController); // <<< Mudei POST / para POST /register para clareza
router.post('/login', loginController);

// --- Rotas Autenticadas ---
// O authMiddleware será aplicado individualmente ou com router.use() para um grupo

// Rota para estatísticas do dashboard do usuário LOGADO
// Não precisa mais de :userId na URL aqui, o middleware cuida disso
router.get('/dashboard-stats', authMiddleware, getDashboardStatsController); // GET /users/dashboard-stats

// Rota para tendência de temperatura do usuário LOGADO
router.get('/dashboard/temperature-trend', authMiddleware, getTemperatureTrendController); // GET /users/dashboard/temperature-trend
                                                                                        // (Removido :userId da URL)

// Rota para buscar dados de um usuário específico pelo ID (se ainda necessária e protegida)
// Se esta rota for para buscar o *próprio* perfil, poderia ser /me
router.get('/:id', authMiddleware, getUserController); 

export default router;