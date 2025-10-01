import * as Haptics from "expo-haptics";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Keyboard,
    Modal,
    PanResponder,
    Platform,
    Pressable,
    KeyboardEvent as RNKeyboardEvent,
    View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export type BottomSheetRef = {
    open: () => void;
    close: () => void;
    snapToIndex: (index: number) => void;
};

export type BottomSheetProps = {
    children: React.ReactNode;
    snapPoints?: number[];
    backdropColor?: string;
    enablePanDownToClose?: boolean;
    enableBackdropDismiss?: boolean;
    onClose?: () => void;
    onOpen?: () => void;
    accessibilityLabel?: string;
};

/**
 * A customizable bottom sheet component, supporting snap points, pan gestures, and backdrop dismiss.
 *
 * @remarks
 * - Uses `Animated` for smooth transitions and gestures.
 * - Supports haptic feedback on snap.
 * - Accessible with customizable labels and roles.
 * - Can be controlled imperatively via `ref` (open, close, snapToIndex).
 *
 * @param children - Content to render inside the bottom sheet.
 * @param snapPoints - Array of snap points (as fractions of screen height, e.g., [0.3, 0.6, 0.9]).
 * @param backdropColor - Color of the backdrop overlay.
 * @param enablePanDownToClose - If true, allows closing the sheet by panning down.
 * @param enableBackdropDismiss - If true, allows closing the sheet by tapping the backdrop.
 * @param onClose - Callback fired when the sheet is closed.
 * @param onOpen - Callback fired when the sheet is opened.
 * @param accessibilityLabel - Accessibility label for the sheet.
 * @param ref - Imperative handle with `open`, `close`, and `snapToIndex` methods.
 *
 * @example
 * ```tsx
 * const sheetRef = useRef<BottomSheetRef>(null);
 * <BottomSheet ref={sheetRef} snapPoints={[0.3, 0.6, 0.9]}>
 *   <Text>Sheet Content</Text>
 * </BottomSheet>
 * ```
 */
export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
    (
        {
            children,
            snapPoints = [0.3, 0.6, 0.9],
            backdropColor = "rgba(0,0,0,0.3)",
            enablePanDownToClose = true,
            enableBackdropDismiss = true,
            onClose,
            onOpen,
            accessibilityLabel = "Bottom Sheet",
        },
        ref
    ) => {
        const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
        const backdropOpacity = useRef(new Animated.Value(0)).current;
        const lastOffset = useRef(SCREEN_HEIGHT);
        const [visible, setVisible] = useState(false);
        const [currentSnapIndex, setCurrentSnapIndex] = useState(1);
        const isPanning = useRef(false);

        const snapHeights = snapPoints.map((point) => SCREEN_HEIGHT * (1 - point));

        const [keyboardHeight, setKeyboardHeight] = useState(0);

        useEffect(() => {
            const onKeyboardShow = (e: RNKeyboardEvent) => {
                setKeyboardHeight(e.endCoordinates.height);
            };
            const onKeyboardHide = () => setKeyboardHeight(0);

            const showSub = Keyboard.addListener(
                Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow",
                onKeyboardShow
            );
            const hideSub = Keyboard.addListener(
                Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide",
                onKeyboardHide
            );

            return () => {
                showSub.remove();
                hideSub.remove();
            };
        }, []);

        const triggerHaptic = useCallback(() => {
            if (Platform.OS !== "web") {
                try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch (error) {
                    console.warn("Haptics not available:", error);
                }
            }
        }, []);

        const animateTo = useCallback(
            (toValue: number, cb?: () => void) => {
                Animated.parallel([
                    Animated.spring(translateY, {
                        toValue,
                        useNativeDriver: true,
                        damping: 20,
                        stiffness: 150,
                        mass: 0.7,
                    }),
                    Animated.timing(backdropOpacity, {
                        toValue: toValue === SCREEN_HEIGHT ? 0 : 1,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]).start(({ finished }) => {
                    if (finished) {
                        lastOffset.current = toValue;
                        cb?.();
                    }
                });
            },
            [translateY, backdropOpacity]
        );

        const snapToIndex = useCallback(
            (index: number) => {
                if (index >= 0 && index < snapHeights.length) {
                    setCurrentSnapIndex(index);
                    animateTo(snapHeights[index], () => triggerHaptic());
                }
            },
            [animateTo, snapHeights, triggerHaptic]
        );

        const open = useCallback(() => {
            setVisible(true);
            setTimeout(() => {
                snapToIndex(1);
                onOpen?.();
            }, 50);
        }, [snapToIndex, onOpen]);

        const close = useCallback(() => {
            animateTo(SCREEN_HEIGHT, () => {
                setVisible(false);
                onClose?.();
            });
        }, [animateTo, onClose]);

        useImperativeHandle(ref, () => ({ open, close, snapToIndex }), [open, close, snapToIndex]);

        const findNearestSnap = useCallback(
            (position: number) => {
                let nearest = 0;
                let minDist = Math.abs(position - snapHeights[0]);

                snapHeights.forEach((height, index) => {
                    const dist = Math.abs(position - height);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = index;
                    }
                });

                return nearest;
            },
            [snapHeights]
        );

        const panResponder = useRef(
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: (_, gesture) => {
                    return Math.abs(gesture.dy) > 10 && Math.abs(gesture.dx) < 20;
                },
                onPanResponderGrant: () => {
                    if (isPanning.current) return;
                    isPanning.current = true;
                    translateY.stopAnimation((value) => {
                        lastOffset.current = value;
                    });
                    triggerHaptic();
                },
                onPanResponderMove: Animated.event([null, { dy: translateY }], {
                    useNativeDriver: false,
                    listener: ((_: any, gesture: any) => {
                        const newY = lastOffset.current + gesture.dy;

                        if (newY < snapHeights[0]) {
                            const resistance = (snapHeights[0] - newY) * 0.5;
                            translateY.setValue(snapHeights[0] - resistance);
                        } else if (newY > SCREEN_HEIGHT && enablePanDownToClose) {
                            const resistance = (newY - SCREEN_HEIGHT) * 0.2;
                            translateY.setValue(SCREEN_HEIGHT + resistance);
                        } else {
                            translateY.setValue(newY);
                        }
                    }) as any,
                }),
                onPanResponderRelease: (_, gesture) => {
                    isPanning.current = false;
                    const currentY = lastOffset.current + gesture.dy;
                    const velocity = gesture.vy;

                    if (enablePanDownToClose && gesture.dy > 200 && velocity > 0.7) {
                        close();
                        return;
                    }

                    if (Math.abs(velocity) > 0.7) {
                        const direction = velocity > 0 ? 1 : -1;
                        const nextIndex = Math.min(Math.max(currentSnapIndex + direction, 0), snapHeights.length - 1);
                        snapToIndex(nextIndex);
                    } else {
                        const nearestIndex = findNearestSnap(currentY);
                        snapToIndex(nearestIndex);
                    }
                },
                onPanResponderTerminate: () => {
                    isPanning.current = false;
                    const nearestIndex = findNearestSnap(lastOffset.current);
                    snapToIndex(nearestIndex);
                },
            })
        ).current;

        if (!visible) return null;

        return (
            <Modal
                transparent
                animationType="none"
                visible={visible}
                onRequestClose={close}
                statusBarTranslucent
                accessibilityViewIsModal
            >
                <View className="flex-1 justify-end">
                    <Animated.View
                        className="absolute inset-0"
                        style={{
                            backgroundColor: backdropColor,
                            opacity: backdropOpacity,
                        }}
                        accessible={enableBackdropDismiss}
                        accessibilityRole="button"
                        accessibilityLabel="Close bottom sheet"
                        accessibilityHint="Tap to dismiss the bottom sheet"
                    >
                        <Pressable onPress={enableBackdropDismiss ? close : undefined} className="flex-1" />
                    </Animated.View>

                    <Animated.View
                        style={{
                            transform: [{ translateY }],
                            height: SCREEN_HEIGHT - keyboardHeight,
                        }}
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl"
                        accessible
                        accessibilityLabel={accessibilityLabel}
                        accessibilityRole="alert"
                        accessibilityHint="Swipe down to close or drag to adjust size"
                    >
                        <View
                            {...panResponder.panHandlers}
                            className="w-full h-9 items-center justify-center py-3"
                            accessible
                            accessibilityRole="button"
                            accessibilityLabel="Drag to adjust bottom sheet"
                        >
                            <View className="w-10 h-1 rounded-lg bg-slate-200" />
                        </View>

                        <View className="flex-1">{children}</View>
                    </Animated.View>
                </View>
            </Modal>
        );
    }
);

BottomSheet.displayName = "BottomSheet";
