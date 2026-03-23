// lib/auth-client.ts
import { createAuthClient } from "better-auth/react"; // <--- This sub-path is built into 'better-auth'
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { AuthOptions } from "./auth";

function normalizeBaseUrl(value?: string): string | undefined {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const protocol = process.env.NODE_ENV === "production" ? "https://" : "http://";
    return `${protocol}${trimmed}`;
}

const resolvedClientBaseUrl =
    (typeof window !== "undefined" ? window.location.origin : undefined) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ||
    normalizeBaseUrl(process.env.BETTER_AUTH_URL) ||
    normalizeBaseUrl(process.env.VERCEL_URL) ||
    "http://localhost:3000";

export const authClient = createAuthClient({
    baseURL: resolvedClientBaseUrl,
    plugins: [
        inferAdditionalFields<AuthOptions>()
    ],
    fetchOptions: {
        auth: {
            type: "Bearer",
            token: () => {
                if (typeof window !== "undefined") {
                    return sessionStorage.getItem("better-auth-token") || undefined;
                }
                return undefined;
            }
        },
        plugins: [
            {
                id: "auth-token-storage",
                name: "auth-token-storage",
                hooks: {
                    onResponse: async (context: { response: Response }) => {
                         const token = context.response.headers.get("set-auth-token");
                         if (token) {
                             sessionStorage.setItem("better-auth-token", token);
                         }
                    }
                }
            }
        ]
    }
});

export const { useSession, signIn, signUp, signOut, getSession } = authClient;
