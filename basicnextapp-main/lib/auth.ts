import { betterAuth, BetterAuthOptions } from "better-auth";
import { bearer } from "better-auth/plugins";
import { pool } from "./db";

function normalizeBaseUrl(value?: string): string | undefined {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const protocol = process.env.NODE_ENV === "production" ? "https://" : "http://";
    return `${protocol}${trimmed}`;
}

const resolvedBaseUrl =
    normalizeBaseUrl(process.env.BETTER_AUTH_URL) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ||
    normalizeBaseUrl(process.env.VERCEL_URL) ||
    "http://localhost:3000";

export const authOptions = {
    database: pool,

    user: { 
        modelName: "users",
        additionalFields: {
            active: {
                type: "boolean",
            },
        },
    },
    session: { 
        modelName: "sessions",
    },
    account: { modelName: "accounts" },
    verification: { modelName: "verifications" },

    emailAndPassword: {
        enabled: true,
    },

    plugins: [
        bearer(),
    ],

    // ✅ Hardcoded secret fallback using ||
    secret: process.env.BETTER_AUTH_SECRET || "NzhkM2Y5ZTJmYjYwM2M0YmU4YjA1ODcyM2M1YjY5NDA3ZDAyM2M1ZTg5M2Y0YjU2YmU4YjA1ODcyM2M1YjY5NDA3ZDAyM2M1ZTg5M2Y0YjU2",

    baseURL: resolvedBaseUrl,

    trustedOrigins: [
        "http://localhost:3000",
        "https://basicnextapp-six.vercel.app",
        resolvedBaseUrl,
    ],
} satisfies BetterAuthOptions;

export const auth = betterAuth(authOptions);

export type Auth = typeof auth;
export type AuthOptions = typeof authOptions;