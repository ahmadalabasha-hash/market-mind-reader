import { neon } from '@neondatabase/serverless';
import { SubscriptionTier } from './auth-types';

let sqlInstance: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!sqlInstance) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.warn('DATABASE_URL environment variable is not set. Database operations will fail.');
      return null;
    }
    sqlInstance = neon(databaseUrl);
  }
  return sqlInstance;
}

export function sql() {
  return getSql();
}

export interface User {
  id?: number;
  fullName: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  trialEndsAt?: string;
  membershipStatus: string;
  subscriptionTier: SubscriptionTier;
}

export async function initDb() {
  const client = sql();
  if (!client) return;
  await client`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      salt TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      trialEndsAt TEXT,
      membershipStatus TEXT NOT NULL DEFAULT 'trial',
      subscriptionTier TEXT NOT NULL DEFAULT 'trial'
    )
  `;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const client = sql();
  if (!client) return null;
  const users = await client`
    SELECT * FROM users WHERE email = ${email.toLowerCase()}
  ` as any[];
  return users.length > 0 ? (users[0] as User) : null;
}

export async function createUser(user: User): Promise<User> {
  const client = sql();
  if (!client) throw new Error('Database not configured');
  const result = await client`
    INSERT INTO users (fullName, email, passwordHash, salt, createdAt, trialEndsAt, membershipStatus, subscriptionTier)
    VALUES (
      ${user.fullName},
      ${user.email.toLowerCase()},
      ${user.passwordHash},
      ${user.salt},
      ${user.createdAt},
      ${user.trialEndsAt || null},
      ${user.membershipStatus},
      ${user.subscriptionTier}
    )
    RETURNING *
  ` as any[];
  return result[0] as User;
}

export async function getAllUsers(): Promise<User[]> {
  const client = sql();
  if (!client) return [];
  const users = await client`SELECT * FROM users ORDER BY createdAt DESC` as any[];
  return users as User[];
}
