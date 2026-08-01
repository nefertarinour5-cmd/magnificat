import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const SALT_ROUNDS = 12;
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function generateSessionToken(): string {
  return `${randomBytes(24).toString("hex")}.${Date.now()}`;
}

export const SECURITY = {
  MAX_ATTEMPTS,
  LOCK_MINUTES,
  SESSION_DURATION_DAYS: 7,
  PASSWORD_MIN_LENGTH: 8,
} as const;

export function isLocked(user: { lockedUntil: Date | null }): boolean {
  if (!user.lockedUntil) return false;
  return new Date(user.lockedUntil).getTime() > Date.now();
}

export function lockExpiry(): Date {
  return new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
}

export function passwordStrength(pwd: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const map = [
    { label: "Très faible", color: "#b91c1c" },
    { label: "Faible", color: "#d97706" },
    { label: "Moyen", color: "#b45309" },
    { label: "Bon", color: "#15803d" },
    { label: "Fort", color: "#15803d" },
    { label: "Excellent", color: "#15803d" },
  ];

  return { score, ...map[score] };
}
