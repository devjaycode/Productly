import { Colors } from "@/constants/color";
import { LayoutGrid, List } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View, ViewStyle } from "react-native";

type Mode = "list" | "grid";

type ViewSwitcherProps = {
    value: Mode;
    onChange: (mode: Mode) => void;
    style?: ViewStyle;
    className?: string;
};

/**
 * A toggle switch component for switching between "list" and "grid" views with animated transitions.
 *
 * @param value - The current view mode, either "list" or "grid".
 * @param onChange - Callback function invoked when the view mode changes.
 * @param style - Optional style object for the root container.
 * @param className - Optional additional class names for the root container.
 *
 * The component displays two buttons (list and grid), and an animated indicator that slides and scales
 * to highlight the active view. The indicator and icon transitions are handled using React Native's Animated API.
 */
export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ value, onChange, style, className = "" }) => {
    const slideAnim = useRef(new Animated.Value(value === "list" ? 0 : 1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: value === "list" ? 0 : 1,
                useNativeDriver: true,
                tension: 80,
                friction: 10,
            }),
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 0.92,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [scaleAnim, slideAnim, value]);

    const indicatorTranslate = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 40],
    });

    const handlePress = (mode: Mode) => {
        if (mode !== value) {
            onChange(mode);
        }
    };

    return (
        <View style={style} className={`flex-row items-center rounded-xl bg-slate-200/60 p-1 relative ${className}`}>
            {/* Animated indicator with scale */}
            <Animated.View
                style={[
                    styles.indicator,
                    {
                        transform: [{ translateX: indicatorTranslate }, { scale: scaleAnim }],
                    },
                ]}
            />

            {/* List Button */}
            <Pressable
                onPress={() => handlePress("list")}
                className="w-11 h-11 items-center justify-center z-10"
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
                <AnimatedIcon Icon={List} isActive={value === "list"} slideAnim={slideAnim} isLeft />
            </Pressable>

            {/* Grid Button */}
            <Pressable
                onPress={() => handlePress("grid")}
                className="w-11 h-11 items-center justify-center z-10"
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
                <AnimatedIcon Icon={LayoutGrid} isActive={value === "grid"} slideAnim={slideAnim} isLeft={false} />
            </Pressable>
        </View>
    );
};

const AnimatedIcon: React.FC<{
    Icon: React.ComponentType<any>;
    isActive: boolean;
    slideAnim: Animated.Value;
    isLeft: boolean;
}> = ({ Icon, isActive, slideAnim, isLeft }) => {
    const iconScale = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: isLeft ? [1.1, 0.9] : [0.9, 1.1],
    });

    const iconOpacity = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: isLeft ? [1, 0.6] : [0.6, 1],
    });

    return (
        <Animated.View
            style={{
                transform: [{ scale: iconScale }],
                opacity: iconOpacity,
            }}
        >
            <Icon size={22} color={isActive ? Colors.primary : Colors.gray[500]} strokeWidth={isActive ? 2.5 : 2} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    indicator: {
        position: "absolute",
        width: 42,
        height: 42,
        borderRadius: 8,
        backgroundColor: "white",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
});
