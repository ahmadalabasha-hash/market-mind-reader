import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = neon(process.env.DATABASE_URL);

export interface User {
  id?: number;
  fullName: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  trialEndsAt?: string;
  membershipStatus: string;
  subscriptionTier: string;
}

export async function initDb() {
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
  const users = await sql`
    SELECT * FROM users WHERE email = ${email.toLowerCase()}
  `;
  return users.length > 0 ? (users[0] as User) : null;
}

export async function createUser(user: User): Promise<User> {
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
  const users = await sql`SELECT * FROM users ORDER BY createdAt DESC`;
  return users as User[];
}
