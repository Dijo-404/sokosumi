import { adminClient, multiSessionClient, organizationClient, passkeyClient, twoFactorClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
export const authClient = createAuthClient({
    baseURL: '/',
    plugins: [
        organizationClient(),
        adminClient(),
        twoFactorClient(),
        passkeyClient(),
        multiSessionClient(),
    ]
});
