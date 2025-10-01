import { ALERT_TYPE, Toast, ToastType } from "@/components/ui/toast";
import React, { createContext, useContext, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ToastItem = {
    id: number;
    type: ToastType;
    message: string;
};

type ToastContextType = {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType>({
    showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

/**
 * Provides toast notification functionality to its children via context.
 *
 * @remarks
 * This provider manages a list of toast messages and exposes a `showToast` function
 * through context, allowing child components to display toast notifications.
 * Toasts are automatically removed after a specified duration, and can also be
 * manually closed.
 *
 * @param children - The React children components that will have access to the toast context.
 *
 * @example
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 *
 * @context
 * Provides `showToast(type, message, duration)` to display a toast.
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = (message: string, type: ToastType = ALERT_TYPE.DEFAULT, duration = 3000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, type, message }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration + 600);
    };

    const handleClose = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <SafeAreaView className="absolute top-0 left-0 right-0">
                <View>
                    {toasts.map((toast, i) => (
                        <Toast
                            key={toast.id}
                            id={toast.id}
                            type={toast.type}
                            message={toast.message}
                            duration={3000}
                            onClose={handleClose}
                            index={i}
                        />
                    ))}
                </View>
            </SafeAreaView>
        </ToastContext.Provider>
    );
};
