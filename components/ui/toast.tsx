import { AlertTriangle, BellIcon, CheckCircle, Info, XCircle } from "lucide-react-native";
import React, { JSX, useCallback, useEffect, useRef } from "react";
import { Animated, Pressable, Text } from "react-native";

export type ToastType = "success" | "error" | "warning" | "info" | "default";

export enum ALERT_TYPE {
    SUCCESS = "success",
    ERROR = "error",
    WARNING = "warning",
    INFO = "info",
    DEFAULT = "default",
}

type ToastProps = {
    id: number;
    type: ToastType;
    message: string;
    onClose: (id: number) => void;
    duration?: number;
    index: number;
};

const COLORS: Record<ToastType, string> = {
    success: "bg-success",
    error: "bg-error",
    warning: "bg-warning",
    info: "bg-info",
    default: "bg-gray-800",
};

const ICONS: Record<ToastType, JSX.Element> = {
    success: <CheckCircle size={20} color="white" />,
    error: <XCircle size={20} color="white" />,
    warning: <AlertTriangle size={20} color="white" />,
    info: <Info size={20} color="white" />,
    default: <BellIcon size={20} color="white" />,
};

/**
 * Toast component for displaying animated notification messages.
 *
 * @param id - Unique identifier for the toast.
 * @param type - Type of the toast, used to determine icon and color.
 * @param message - The message to display in the toast.
 * @param onClose - Callback function invoked when the toast is closed.
 * @param duration - Duration in milliseconds before the toast auto-closes (default: 3000).
 * @param index - Position index of the toast in the stack, used for margin styling.
 *
 * Animates the toast in and out with slide and fade effects.
 * The icon also animates with scale and rotation for visual feedback.
 * Automatically closes after the specified duration or when the close button is pressed.
 */
export const Toast: React.FC<ToastProps> = ({ id, type, message, onClose, duration = 3000, index }) => {
    const slideAnim = useRef(new Animated.Value(-50)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const iconScaleAnim = useRef(new Animated.Value(0)).current;
    const iconRotateAnim = useRef(new Animated.Value(0)).current;

    const handleClose = useCallback(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -50,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => onClose(id));
    }, [id, onClose, opacityAnim, slideAnim]);

    const iconAnimation = useCallback(() => {
        iconRotateAnim.setValue(0);
        Animated.sequence([
            Animated.spring(iconScaleAnim, {
                toValue: 1.2,
                friction: 50,
                useNativeDriver: true,
            }),

            Animated.spring(iconScaleAnim, {
                toValue: 1,
                friction: 50,
                useNativeDriver: true,
            }),

            Animated.timing(iconRotateAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, [iconRotateAnim, iconScaleAnim]);

    useEffect(() => {
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 0,
                damping: 15,
                stiffness: 150,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start();

        iconAnimation();

        const timer = setTimeout(() => handleClose(), duration);

        return () => clearTimeout(timer);
    }, [duration, handleClose, iconAnimation, opacityAnim, slideAnim]);

    const iconRotate = iconRotateAnim.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: ["0deg", "15deg", "-10deg", "5deg", "0deg"],
    });

    return (
        <Animated.View
            style={{
                transform: [{ translateY: slideAnim }],
                opacity: opacityAnim,
                marginTop: index === 0 ? 10 : 6,
            }}
            className={`mx-4 rounded-lg px-4 py-3 shadow-lg flex-row items-center ${COLORS[type]}`}
        >
            <Animated.View
                style={{
                    transform: [
                        { scale: iconScaleAnim },
                        {
                            rotate: iconRotate,
                        },
                    ],
                }}
            >
                {ICONS[type]}
            </Animated.View>
            <Text className="text-white mx-2 flex-1">{message}</Text>
            <Pressable onPress={handleClose}>
                <XCircle size={18} color="white" />
            </Pressable>
        </Animated.View>
    );
};
