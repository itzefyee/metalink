# Convex Authentication Setup

This document describes the Convex-based authentication system implemented for the Metalink application.

## Overview

The authentication system is built using Convex as the backend, similar to the Supabase implementation but adapted for Convex's serverless architecture. It provides:

- ✅ User registration (sign up)
- ✅ User login (sign in)
- ✅ Session management with tokens
- ✅ User profiles with metadata
- ✅ Profile updates
- ✅ Secure password hashing (SHA-256)
- ✅ Session expiration (30 days)

## Architecture

### Database Schema

The authentication system uses three main tables in Convex:

#### 1. `users` table
- `email` - User's email address (unique)
- `passwordHash` - Hashed password
- `emailVerified` - Email verification status
- `createdAt` / `updatedAt` - Timestamps

#### 2. `profiles` table
- `userId` - Reference to user
- `email` - User's email
- `company` - Optional company name
- `phone` - Optional phone number
- `role` - Optional user role
- `metadata` - Optional additional data
- `createdAt` / `updatedAt` - Timestamps

#### 3. `sessions` table
- `userId` - Reference to user
- `token` - Session token (32-byte random hex)
- `expiresAt` - Expiration timestamp
- `createdAt` - Timestamp

## Files Structure

```
metalink/
├── convex/
│   ├── schema.ts                    # Database schema with users, profiles, sessions
│   ├── mutations.ts                 # Auth mutations (create user, profile, session)
│   ├── queries.ts                   # Auth queries (get user, profile, session)
│   └── actions/
│       └── auth.ts                  # Auth actions (signUp, signIn, signOut, verify)
├── src/
│   ├── types/
│   │   └── auth.types.ts           # TypeScript types for auth
│   └── components/
│       └── auth/
│           └── AuthProvider.tsx     # React context provider for auth
```

## Usage

### 1. Wrap your app with AuthProvider

First, make sure your app is wrapped with both `ConvexClientProvider` and `AuthProvider`:

```tsx
// app/layout.tsx
import ConvexClientProvider from '@/components/ConvexClientProvider';
import { AuthProvider } from '@/components/auth/AuthProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
```

### 2. Use the `useAuth` hook

Access authentication state and methods in any component:

```tsx
'use client';

import { useAuth } from '@/components/auth/AuthProvider';

export default function MyComponent() {
  const { user, profile, loading, signIn, signUp, signOut, updateProfile } = useAuth();

  // Check if user is authenticated
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.email}!</h1>
      {profile && (
        <div>
          <p>Company: {profile.company}</p>
          <p>Phone: {profile.phone}</p>
        </div>
      )}
    </div>
  );
}
```

### 3. Sign Up

```tsx
const handleSignUp = async (email: string, password: string) => {
  const { error } = await signUp(email, password, {
    company: 'Acme Corp',
    phone: '+1234567890',
    role: 'engineer',
  });

  if (error) {
    console.error('Sign up failed:', error);
  } else {
    console.log('Sign up successful!');
  }
};
```

### 4. Sign In

```tsx
const handleSignIn = async (email: string, password: string) => {
  const { error } = await signIn(email, password);

  if (error) {
    console.error('Sign in failed:', error);
  } else {
    console.log('Sign in successful!');
  }
};
```

### 5. Sign Out

```tsx
const handleSignOut = async () => {
  await signOut();
  console.log('Signed out successfully');
};
```

### 6. Update Profile

```tsx
const handleUpdateProfile = async () => {
  const { error } = await updateProfile({
    company: 'New Company Name',
    phone: '+9876543210',
  });

  if (error) {
    console.error('Profile update failed:', error);
  } else {
    console.log('Profile updated successfully!');
  }
};
```

## API Reference

### AuthProvider Context

#### Properties
- `user: User | null` - Current authenticated user
- `profile: UserProfile | null` - Current user's profile
- `loading: boolean` - Loading state

#### Methods

##### `signUp(email, password, metadata?)`
Creates a new user account.

**Parameters:**
- `email: string` - User's email address
- `password: string` - User's password (min 8 characters)
- `metadata?: UserMetadata` - Optional metadata
  - `company?: string`
  - `phone?: string`
  - `role?: string`

**Returns:** `Promise<{ error: Error | null }>`

##### `signIn(email, password)`
Signs in an existing user.

**Parameters:**
- `email: string` - User's email address
- `password: string` - User's password

**Returns:** `Promise<{ error: Error | null }>`

##### `signOut()`
Signs out the current user.

**Returns:** `Promise<void>`

##### `updateProfile(updates)`
Updates the current user's profile.

**Parameters:**
- `updates: Partial<UserProfile>` - Fields to update
  - `company?: string`
  - `phone?: string`
  - `role?: string`

**Returns:** `Promise<{ error: Error | null }>`

## Security Considerations

### Password Hashing
- Passwords are hashed using SHA-256 before storage
- For production, consider upgrading to bcrypt or argon2 for stronger security

### Session Management
- Sessions use 32-byte random tokens stored in localStorage
- Tokens expire after 30 days
- Expired sessions are automatically deleted on verification

### Best Practices
1. Always use HTTPS in production
2. Implement rate limiting for login attempts
3. Add email verification for new accounts
4. Consider adding 2FA for enhanced security
5. Implement password reset functionality

## Deployment

### Convex Environment Variables
No additional environment variables are needed for basic auth functionality. The system uses Convex's built-in database.

### Next Steps
1. Deploy your Convex backend: `npx convex deploy --prod`
2. Deploy your Next.js app to Vercel or your hosting provider
3. Ensure `NEXT_PUBLIC_CONVEX_URL` is set in your production environment

## Migration from Supabase

If you're migrating from Supabase:

1. **User Migration**: Export users from Supabase and import to Convex
2. **Password Hashing**: You'll need to rehash passwords (or ask users to reset)
3. **Session Tokens**: New sessions will be created on first login
4. **Profile Data**: Map Supabase profile fields to Convex profile schema

## Troubleshooting

### "User not found" on page reload
- Check that the session token is stored in localStorage
- Verify the session hasn't expired
- Check browser console for errors

### "Invalid email or password"
- Verify email format is correct
- Ensure password meets minimum requirements
- Check Convex dashboard for user records

### Profile not updating
- Ensure user is authenticated before updating
- Check Convex dashboard for mutation errors
- Verify profile exists for the user

## Example: Protected Route

```tsx
// app/dashboard/page.tsx
'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.email}!</p>
    </div>
  );
}
```

## Support

For issues or questions:
1. Check the Convex documentation: https://docs.convex.dev
2. Review the code in `convex/actions/auth.ts`
3. Check browser console for errors
4. Inspect Convex dashboard for database state

