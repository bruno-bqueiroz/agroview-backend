// src/services/user.service.ts
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms'; // Importação para o tipo de expiresIn
import { UserRepository } from '../repositories/user.repository'; // Ajuste o caminho se necessário
import { User } from '@prisma/client'; // Tipo gerado pelo Prisma

// Interfaces para clareza
interface LoginCredentials {
  email: string;
  password_provided: string;
}

interface LoginResponse {
  user: {
    id: number; // Seu User ID é Int
    name: string;
    email: string;
    phone: string | null;
  };
  token: string;
}

// Constantes para configuração do JWT
const SALT_ROUNDS = 10; // Você já tinha isso para o bcrypt

// Em src/services/user.service.ts, dentro do método login, nas signOptions:
// ...



const JWT_SECRET_KEY: jwt.Secret = process.env.JWT_SECRET || 'SEU_FALLBACK_SECRETO_FORTE_PARA_DESENVOLVIMENTO_AQUI';
const expiresInValueFromEnv: string = process.env.JWT_EXPIRES_IN || '1h'; // Ex: '1h', '7d', '30m'

const signOptions: SignOptions = {
  expiresIn: expiresInValueFromEnv as StringValue, // Use a variável do .env
  // algorithm: 'HS256'
};
// ...


export class UserService {
  private repo = new UserRepository(); // Instanciando o repositório como você já faz

  async register(userData: {
    name: string;
    email: string;
    password: string; // Campo 'password' como no seu código original do controller
    phone?: string;
  }): Promise<User> {
    const existing = await this.repo.findByEmail(userData.email);
    if (existing) {
      const err = new Error('Email já cadastrado.');
      (err as any).status = 409; // Conflict
      throw err;
    }
    const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);
    return this.repo.create({
      name: userData.name,
      email: userData.email,
      passwordHash, // Usando o nome do campo do seu schema.prisma
      phone: userData.phone,
    });
  }

  async getById(id: number): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) {
      const err = new Error('Usuário não encontrado.');
      (err as any).status = 404; // Not Found
      throw err;
    }
    return user;
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const user = await this.repo.findByEmail(credentials.email);
    console.log("🚀 ~ UserService ~ login ~ user:", user)
    
    if (!user) {
      const err = new Error('Credenciais inválidas.'); // Mensagem genérica por segurança
      (err as any).status = 401; // Unauthorized
      throw err;
    }

    // Comparar a senha fornecida com o passwordHash armazenado
    const isPasswordValid = await bcrypt.compare(credentials.password_provided, user.passwordHash);
    if (!isPasswordValid) {
      const err = new Error('Credenciais inválidas.');
      (err as any).status = 401; // Unauthorized
      throw err;
    }

    // Usuário autenticado, gerar token JWT
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name, // Adicionando nome ao payload para fácil acesso no frontend se necessário
      // Você pode adicionar outros dados ao payload se necessário (ex: roles)
    };

    const signOptions: SignOptions = {
      expiresIn: expiresInValueFromEnv as StringValue, // Asserção de tipo para a string de expiração
      // algorithm: 'HS256' // O padrão é HS256, mas você pode especificar se quiser
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET_KEY, signOptions);

    // Retornar dados do usuário (sem a senha) e o token
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token,
    };
  }
}

// Se você costuma exportar a instância diretamente, mantenha esse padrão.
// Caso contrário, você importará a classe e a instanciará onde for usar (como no controller).
// export default new UserService(); // Exemplo de como você poderia exportar se não for no controller