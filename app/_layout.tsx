import { ProductsProvider } from "@/contexts/products-provider";
import { ToastProvider } from "@/contexts/toast-provider";
import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
    return (
        <ToastProvider>
            <ProductsProvider>
                <Stack screenOptions={{ headerShown: false }} />
            </ProductsProvider>
        </ToastProvider>
    );
}
