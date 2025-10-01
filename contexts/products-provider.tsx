import { useProductsState } from "@/hooks/use-products-state";
import React, { createContext, useContext } from "react";

const ProductsContext = createContext<ReturnType<typeof useProductsState> | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
    const productsState = useProductsState();
    return <ProductsContext.Provider value={productsState}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
    const ctx = useContext(ProductsContext);
    if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
    return ctx;
}
