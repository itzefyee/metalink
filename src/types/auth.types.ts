import { Id } from "../../convex/_generated/dataModel";

export interface User {
  _id: Id<"users">;
  email: string;
  passwordHash: string;
  emailVerified?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  _id: Id<"profiles">;
  userId: Id<"users">;
  email: string;
  company?: string;
  phone?: string;
  role?: string;
  metadata?: any;
  createdAt: number;
  updatedAt: number;
}

export interface Session {
  _id: Id<"sessions">;
  userId: Id<"users">;
  token: string;
  expiresAt: number;
  createdAt: number;
}

export interface UserMetadata {
  company?: string;
  phone?: string;
  role?: string;
}

export interface AuthError {
  error: string | null;
}

export interface SignUpResponse extends AuthError {
  userId?: string;
  token?: string;
}

export interface SignInResponse extends AuthError {
  userId?: string;
  token?: string;
}


