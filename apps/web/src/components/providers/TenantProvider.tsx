// apps/web/src/components/providers/TenantProvider.tsx
"use client";

import { createContext, useContext, type ReactNode } from "react";

type TenantContextValue = {
    tenantId: string | null;
    merchantId: string | null;
};

const TenantContext = createContext<TenantContextValue>({
    tenantId: null,
    merchantId: null,
});

export function TenantProvider({
    tenantId,
    merchantId,
    children,
}: TenantContextValue & { children: ReactNode }) {
    return (
        <TenantContext.Provider value={{ tenantId, merchantId }}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    return useContext(TenantContext);
}
