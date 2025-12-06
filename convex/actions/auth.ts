"use node";
import { v } from "convex/values";
import { action } from "../_generated/server";
import { api } from "../_generated/api";
import crypto from "crypto";

// Simple password hashing using Node.js crypto (for production, consider bcrypt)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export const signUp = action({
  args: {
    email: v.string(),
    password: v.string(),
    metadata: v.optional(v.object({
      company: v.optional(v.string()),
      phone: v.optional(v.string()),
      role: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<{ error: string | null; userId?: string; token?: string }> => {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(args.email)) {
        return { error: "Invalid email format" };
      }

      // Validate password strength
      if (args.password.length < 8) {
        return { error: "Password must be at least 8 characters long" };
      }

      // Check if user already exists
      const existingUser = await ctx.runQuery(api.queries.getUserByEmail, {
        email: args.email,
      });

      if (existingUser) {
        return { error: "User already exists with this email" };
      }

      // Hash password
      const passwordHash = hashPassword(args.password);

      // Create user
      const userId = await ctx.runMutation(api.mutations.createUser, {
        email: args.email,
        passwordHash,
      });

      // Create profile
      await ctx.runMutation(api.mutations.createProfile, {
        userId,
        email: args.email,
        company: args.metadata?.company,
        phone: args.metadata?.phone,
        role: args.metadata?.role,
      });

      // Create session
      const token = generateToken();
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

      await ctx.runMutation(api.mutations.createSession, {
        userId,
        token,
        expiresAt,
      });

      return { error: null, userId, token };
    } catch (error) {
      console.error("Sign up error:", error);
      return { error: error instanceof Error ? error.message : "Sign up failed" };
    }
  },
});

export const signIn = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<{ error: string | null; userId?: string; token?: string }> => {
    try {
      // Get user by email
      const user = await ctx.runQuery(api.queries.getUserByEmail, {
        email: args.email,
      });

      if (!user) {
        return { error: "Invalid email or password" };
      }

      // Verify password
      const passwordHash = hashPassword(args.password);
      if (passwordHash !== user.passwordHash) {
        return { error: "Invalid email or password" };
      }

      // Create new session
      const token = generateToken();
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

      await ctx.runMutation(api.mutations.createSession, {
        userId: user._id,
        token,
        expiresAt,
      });

      return { error: null, userId: user._id, token };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: error instanceof Error ? error.message : "Sign in failed" };
    }
  },
});

export const signOut = action({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args): Promise<{ error: string | null }> => {
    try {
      await ctx.runMutation(api.mutations.deleteSession, {
        token: args.token,
      });

      return { error: null };
    } catch (error) {
      console.error("Sign out error:", error);
      return { error: error instanceof Error ? error.message : "Sign out failed" };
    }
  },
});

export const verifySession = action({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args): Promise<{ valid: boolean; userId?: string }> => {
    try {
      const session = await ctx.runQuery(api.queries.getSessionByToken, {
        token: args.token,
      });

      if (!session) {
        return { valid: false };
      }

      // Check if session is expired
      if (session.expiresAt < Date.now()) {
        // Delete expired session
        await ctx.runMutation(api.mutations.deleteSession, {
          token: args.token,
        });
        return { valid: false };
      }

      return { valid: true, userId: session.userId };
    } catch (error) {
      console.error("Verify session error:", error);
      return { valid: false };
    }
  },
});


