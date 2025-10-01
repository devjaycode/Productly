import React, { useEffect, useRef } from "react";
import { Animated, Image, Text, View } from "react-native";

type EmptyListNoticeProps = {
    title?: string;
    description?: string;
};

/**
 * Empty List Notice component with fade and scale animations.
 *
 * @remarks
 * - Useful for showing a friendly notice when a list has no data.
 * - Includes an illustration, a title, and a description.
 * - Animates in with a fade-in and spring scale effect on mount.
 * - Can be customized with `title` and `description` props.
 *
 * @param title - The main headline text to display. Defaults to `"No products yet"`.
 * @param description - The supporting message shown under the title. Defaults to `"Click the button below to add your first product"`.
 *
 * @example
 * ```tsx
 * <EmptyListNotice
 *   title="No items found"
 *   description="Start by adding your first item"
 * />
 * ```
 */
const EmptyListNotice: React.FC<EmptyListNoticeProps> = ({
    title = "No products yet",
    description = "Click the button below to add your first product",
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 450,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 80,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, scaleAnim]);

    return (
        <Animated.View
            style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
            className="flex-1 items-center justify-center px-6 py-8"
        >
            <Image source={require("../../assets/images/no-data.png")} className="w-40 h-40" resizeMode="contain" />

            <View className="mt-6 items-center gap-y-2">
                <Text className="text-xl font-bold text-slate-800">{title}</Text>
                <Text className="max-w-xs text-center text-sm text-slate-500 dark:text-slate-400">{description}</Text>
            </View>
        </Animated.View>
    );
};

export default EmptyListNotice;
