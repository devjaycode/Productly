import { Colors } from "@/constants/color";
import React, { useRef } from "react";
import {
    ActivityIndicator,
    Animated,
    GestureResponderEvent,
    Pressable,
    PressableProps,
    Text,
    ViewStyle,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "outline";

type ButtonProps = {
    children: React.ReactNode;
    onPress?: (e: GestureResponderEvent) => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: ButtonVariant;
    containerStyle?: ViewStyle;
    containerClassName?: string;
} & PressableProps;

/**
 * A customizable button component with animated press feedback, loading state, and multiple visual variants.
 *
 * @param children - The content to display inside the button. Can be a string or a React node.
 * @param onPress - Callback function to handle button press events.
 * @param loading - If true, displays a loading indicator instead of button content. Defaults to false.
 * @param disabled - If true, disables the button and reduces its opacity. Defaults to false.
 * @param variant - Visual style of the button. Can be "primary", "secondary", or "outline". Defaults to "primary".
 * @param className - Additional Tailwind CSS classes for the button.
 * @param containerStyle - Additional style object for the outer Animated.View container.
 * @param containerClassName - Additional Tailwind CSS classes for the outer container.
 * @param props - Additional props passed to the underlying Pressable component.
 *
 * @returns An animated, pressable button component with support for loading and disabled states.
 */
export const Button: React.FC<ButtonProps> = ({
    children,
    onPress,
    loading = false,
    disabled = false,
    variant = "primary",
    className = "",
    containerStyle,
    containerClassName = "",
    ...props
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const getVariantClasses = (): string => {
        switch (variant) {
            case "secondary":
                return "bg-gray-500";
            case "outline":
                return "border border-blue-500 bg-transparent";
            case "primary":
            default:
                return "bg-blue-500";
        }
    };

    const renderContent = () => {
        if (loading) {
            return <ActivityIndicator color={variant === "outline" ? Colors.primary : Colors.white} size="small" />;
        }

        if (typeof children === "string") {
            return (
                <Text className={`font-semibold ${variant === "outline" ? "text-blue-500" : "text-white"}`}>
                    {children}
                </Text>
            );
        }

        return children;
    };

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, containerStyle]} className={containerClassName}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                android_ripple={{ color: "rgba(255,255,255,0.2)", borderless: false }}
                disabled={disabled || loading}
                className={`rounded-xl px-5 py-3 items-center justify-center overflow-hidden ${getVariantClasses()} ${
                    disabled ? "opacity-50" : ""
                } ${className}`}
                {...props}
            >
                {renderContent()}
            </Pressable>
        </Animated.View>
    );
};
