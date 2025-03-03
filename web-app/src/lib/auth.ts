import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { admin, organization, twoFactor, multiSession } from "better-auth/plugins"
import { passkey } from "better-auth/plugins/passkey"
import { emailHarmony } from 'better-auth-harmony';
import { nextCookies } from "better-auth/next-js";

const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: { enabled: true },
    rateLimit: {
        storage: "database",
    },
    plugins: [
        organization(),
        admin(),
        twoFactor(),
        passkey(),
        multiSession(),
        emailHarmony(),
        nextCookies()
    ]
});
