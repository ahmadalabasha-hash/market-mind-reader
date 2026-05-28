import { neon } from '@neondatabase/serverless';
import { SubscriptionTier } from './auth-types';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('DATABASE_URL environment variable is not set. Database operations will fail.');
}

export const sql = databaseUrl ? neon(databaseUrl) : null;

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
  if (!sql) return;
  await sql`
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
  if (!sql) return null;
  const users = await sql`
    SELECT * FROM users WHERE email = ${email.toLowerCase()}
  `;
  return users.length > 0 ? (users[0] as User) : null;
}

export async function createUser(user: User): Promise<User> {
  if (!sql) throw new Error('Database not configured');
  const result = await sql`
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
  `;
  return result[0] as User;
}

export async function getAllUsers(): Promise<User[]> {
  if (!sql) return [];
  const users = await sql`SELECT * FROM users ORDER BY createdAt DESC`;
  return users as User[];
}
