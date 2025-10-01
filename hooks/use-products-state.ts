import { Product } from "@/types/product.type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "PRODUCTS";

/**
 * React hook for managing product state with persistence in AsyncStorage.
 *
 * @remarks
 * - Stores and retrieves product data under the `PRODUCTS` key in AsyncStorage.
 * - Handles loading state while retrieving saved products on mount.
 * - Provides helper methods to add, update, delete, and clear products.
 * - Automatically syncs product updates to AsyncStorage.
 *
 * @returns An object containing:
 * - `products`: The current list of products.
 * - `loading`: Boolean indicating whether products are still being loaded from storage.
 * - `addProduct`: Function to add a new product.
 * - `updateProduct`: Function to update an existing product by ID.
 * - `deleteProduct`: Function to remove a product by ID.
 * - `clearProducts`: Function to clear all stored products.
 *
 * @example
 * ```tsx
 * import { useProductsState } from "@/hooks/useProductsState";
 *
 * export default function ProductScreen() {
 *   const { products, loading, addProduct, updateProduct, deleteProduct, clearProducts } = useProductsState();
 *
 *   if (loading) {
 *     return <Text>Loading...</Text>;
 *   }
 *
 *   return (
 *     <View>
 *       {products.map((p) => (
 *         <Text key={p.id}>{p.name} - ${p.price}</Text>
 *       ))}
 *       <Button
 *         title="Add Product"
 *         onPress={() => addProduct({ id: "123", name: "New Item", price: 10, thumbnail: "" })}
 *       />
 *     </View>
 *   );
 * }
 * ```
 */

export function useProductsState() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored) {
                    setProducts(JSON.parse(stored));
                }
            } catch (error) {
                console.error("Failed to load products", error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const saveProducts = useCallback(async (updated: Product[]) => {
        try {
            setProducts(updated);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error("Failed to save products", error);
        }
    }, []);

    const addProduct = useCallback(
        async (product: Product) => {
            await saveProducts([...products, product]);
        },
        [products, saveProducts]
    );

    const updateProduct = useCallback(
        async (id: string, updated: Partial<Product>) => {
            const newList = products.map((p) => (p.id === id ? { ...p, ...updated } : p));
            await saveProducts(newList);
        },
        [products, saveProducts]
    );

    const deleteProduct = useCallback(
        async (id: string) => {
            const newList = products.filter((p) => p.id !== id);
            await saveProducts(newList);
        },
        [products, saveProducts]
    );

    const clearProducts = useCallback(async () => {
        await saveProducts([]);
    }, [saveProducts]);

    return {
        products,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        clearProducts,
    };
}
