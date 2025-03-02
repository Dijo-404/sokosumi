import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import {
    admin,
    organization,
    twoFactor,
    multiSession,
} from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';
import { nextCookies } from 'better-auth/next-js';
import { resend } from './email/resend';
import { reactResetPasswordEmail } from './email/reset-password';

const prisma = new PrismaClient();

const from = process.env.BETTER_AUTH_EMAIL || 'sokosumi@nmkr.io';

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailVerification: {
        async sendVerificationEmail({ user, url }) {
            const res = await resend.emails.send({
                from,
                to: user.email,
                subject: 'Verify your email address',
                html: `<a href="${url}">Verify your email address</a>`,
            });
            console.log(res, user.email);
        },
        sendOnSignUp: true,
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        async sendResetPassword({ user, url }) {
            await resend.emails.send({
                from,
                to: user.email,
                subject: 'Reset your password',
                react: reactResetPasswordEmail({
                    username: user.email,
                    resetLink: url,
                }),
            });
        },
    },
    rateLimit: {
        storage: 'database',
    },
    plugins: [
        organization(),
        twoFactor({
            otpOptions: {
                async sendOTP({ user, otp }) {
                    await resend.emails.send({
                        from,
                        to: user.email,
                        subject: 'Your OTP',
                        html: `Your OTP is ${otp}`,
                    });
                },
            },
        }),
        passkey(),
        admin(),
        multiSession(),
        nextCookies(),
    ],
});
