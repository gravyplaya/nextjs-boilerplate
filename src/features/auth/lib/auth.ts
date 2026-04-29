import { env } from '@/libs/env';
import { betterAuth } from 'better-auth';

if (
  process.env.NODE_ENV === 'production' &&
  env.BETTER_AUTH_SECRET.startsWith('PLEASE_SET_')
) {
  throw new Error(
    'Missing BETTER_AUTH_SECRET. Set a 32+ char secret in your environment variables.',
  );
}

const socialProviders =
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      }
    : undefined;

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders,
});
