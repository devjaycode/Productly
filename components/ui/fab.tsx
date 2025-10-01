import { X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, GestureResponderEvent, Pressable, PressableProps, Text, View, ViewStyle } from "react-native";

type FABProps = PressableProps & {
    icon: React.ReactNode;
    onPress?: (e: GestureResponderEvent) => void;
    tooltip?: string;
    position?: "bottom-right" | "bottom-left";
    style?: ViewStyle;
};

/**
 * Floating Action Button (FAB) component with optional tooltip.
 *
 * @remarks
 * - Displays a floating button at the bottom-right or bottom-left of the screen.
 * - Shows a tooltip with animation on long press if `tooltip` prop is provided.
 * - Tooltip can be dismissed by pressing the close (X) icon.
 *
 * @param icon - The icon element to display inside the FAB.
 * @param onPress - Callback function invoked when the FAB is pressed.
 * @param tooltip - Optional tooltip text to display above the FAB.
 * @param position - Position of the FAB; either `"bottom-right"` or `"bottom-left"`. Defaults to `"bottom-right"`.
 * @param style - Optional custom style for the FAB container.
 * @param props - Additional props passed to the underlying Pressable component.
 *
 * @example
 * ```tsx
 * <FAB
 *   icon={<PlusIcon />}
 *   onPress={() => console.log('FAB pressed')}
 *   tooltip="Add new item"
 *   position="bottom-left"
 * />
 * ```
 */
export const FAB: React.FC<FABProps> = ({ icon, onPress, tooltip, position = "bottom-right", style, ...props }) => {
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: tooltipVisible ? 1 : 0,
            useNativeDriver: true,
        }).start();
    }, [scaleAnim, tooltipVisible]);

    const toggleTooltip = () => setTooltipVisible((prev) => !prev);

    const fabPositionClass = position === "bottom-right" ? "bottom-6 right-6" : "bottom-6 left-6";

    const tooltipAlignClass = position === "bottom-right" ? "right-0 items-end" : "left-0 items-start";

    const tooltipArrowClass = position === "bottom-right" ? "right-5" : "left-5";

    return (
        <View className={`absolute ${fabPositionClass}`} style={style}>
            {tooltip && (
                <Animated.View
                    style={{
                        transform: [{ scale: scaleAnim }],
                        opacity: scaleAnim,
                    }}
                    className={`absolute bottom-16 w-48 bg-black rounded-xl px-3 py-2 shadow-lg ${tooltipAlignClass}`}
                >
                    {/* Tooltip Arrow */}
                    <View
                        className={`absolute -bottom-1 bg-black rotate-45 rounded-sm ${tooltipArrowClass}`}
                        style={{ width: 12, height: 12 }}
                    />

                    {/* Tooltip Content */}
                    <View className="flex-row items-center justify-between">
                        <Text className="text-white text-sm flex-1 mr-2">{tooltip}</Text>
                        <Pressable onPress={toggleTooltip}>
                            <X size={16} color="white" />
                        </Pressable>
                    </View>
                </Animated.View>
            )}

            <Pressable
                onPress={(e) => {
                    onPress?.(e);
                }}
                onLongPress={tooltip ? toggleTooltip : undefined}
                className="bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg active:scale-95"
                {...props}
            >
                {icon}
            </Pressable>
        </View>
    );
};
