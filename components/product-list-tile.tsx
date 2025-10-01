import { Colors } from "@/constants/color";
import { useToast } from "@/contexts/toast-provider";
import { Product } from "@/types/product.type";
import { BlurView } from "expo-blur";
import { PencilIcon, Trash2Icon } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Image, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { Button } from "./ui/button";

const ANIMATION_CONFIG = {
    duration: 400,
    stagger: 100,
    spring: {
        friction: 8,
        tension: 40,
    },
    initial: {
        opacity: 0,
        translateY: 50,
        scale: 0.9,
    },
    final: {
        opacity: 1,
        translateY: 0,
        scale: 1,
    },
} as const;

const ICON_SIZES = {
    grid: 16,
    list: 18,
} as const;

const BUTTON_SIZE = 44;
const BLUR_INTENSITY = 90;

export type ViewMode = "grid" | "list";

interface ProductTileProps {
    product: Product;
    viewMode: ViewMode;
    index: number;
    onEdit?: (product: Product) => void;
    onDelete?: (product: Product) => void;
}

interface ActionButtonsProps {
    product: Product;
    viewMode: ViewMode;
    onEdit?: (product: Product) => void;
    onDelete?: (product: Product) => void;
}

interface AnimatedValues {
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
    scaleAnim: Animated.Value;
}

class PriceFormatter {
    static format(price: number): string {
        return `$${price.toFixed(2)}`;
    }
}

class AnimationService {
    static createAnimations(): AnimatedValues {
        return {
            fadeAnim: new Animated.Value(ANIMATION_CONFIG.initial.opacity),
            slideAnim: new Animated.Value(ANIMATION_CONFIG.initial.translateY),
            scaleAnim: new Animated.Value(ANIMATION_CONFIG.initial.scale),
        };
    }

    static animateEntry(animations: AnimatedValues, index: number): void {
        const delay = index * ANIMATION_CONFIG.stagger;

        Animated.parallel([
            Animated.timing(animations.fadeAnim, {
                toValue: ANIMATION_CONFIG.final.opacity,
                duration: ANIMATION_CONFIG.duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(animations.slideAnim, {
                toValue: ANIMATION_CONFIG.final.translateY,
                duration: ANIMATION_CONFIG.duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(animations.scaleAnim, {
                toValue: ANIMATION_CONFIG.final.scale,
                delay,
                friction: ANIMATION_CONFIG.spring.friction,
                tension: ANIMATION_CONFIG.spring.tension,
                useNativeDriver: true,
            }),
        ]).start();
    }

    static getAnimatedStyle(animations: AnimatedValues): ViewStyle {
        return {
            opacity: animations.fadeAnim,
            transform: [{ translateY: animations.slideAnim }, { scale: animations.scaleAnim }],
        };
    }
}

function useProductAnimation(index: number) {
    const animationsRef = useRef<AnimatedValues>(AnimationService.createAnimations());

    useEffect(() => {
        AnimationService.animateEntry(animationsRef.current, index);
    }, [index]);

    return AnimationService.getAnimatedStyle(animationsRef.current);
}

const ProductImage: React.FC<{ uri: string; className: string }> = React.memo(({ uri, className }) => (
    <Image source={{ uri }} className={className} resizeMode="cover" />
));

ProductImage.displayName = "ProductImage";

const BlurActionButton: React.FC<{
    icon: React.ReactNode;
    onPress: () => void;
}> = React.memo(({ icon, onPress }) => (
    <TouchableOpacity className="rounded-full overflow-hidden" onPress={onPress} activeOpacity={0.7}>
        <BlurView intensity={BLUR_INTENSITY} tint="light" className="w-9 h-9 justify-center items-center">
            {icon}
        </BlurView>
    </TouchableOpacity>
));

BlurActionButton.displayName = "BlurActionButton";

const RoundButton: React.FC<{
    icon: React.ReactNode;
    onPress: () => void;
    className: string;
}> = React.memo(({ icon, onPress, className }) => (
    <Button className={className} style={{ borderRadius: BUTTON_SIZE / 2 }} onPress={onPress}>
        {icon}
    </Button>
));

RoundButton.displayName = "RoundButton";

const GridActionButtons: React.FC<ActionButtonsProps> = React.memo(({ product, onEdit, onDelete }) => (
    <View className="absolute top-3 right-3 flex-row gap-2">
        <BlurActionButton
            icon={<PencilIcon size={ICON_SIZES.grid} color={Colors.gray[800]} />}
            onPress={() => onEdit?.(product)}
        />
        <BlurActionButton
            icon={<Trash2Icon size={ICON_SIZES.grid} color={Colors.red} />}
            onPress={() => onDelete?.(product)}
        />
    </View>
));

GridActionButtons.displayName = "GridActionButtons";

const ListActionButtons: React.FC<ActionButtonsProps> = React.memo(({ product, onEdit, onDelete }) => (
    <View className="flex-row gap-2.5 ml-3">
        <RoundButton
            className="w-11 h-11 !bg-blue-50 justify-center items-center"
            icon={<PencilIcon size={ICON_SIZES.list} color={Colors.blue[500]} />}
            onPress={() => onEdit?.(product)}
        />
        <RoundButton
            className="w-11 h-11 !bg-red-50 justify-center items-center"
            icon={<Trash2Icon size={ICON_SIZES.list} color={Colors.red} />}
            onPress={() => onDelete?.(product)}
        />
    </View>
));

ListActionButtons.displayName = "ListActionButtons";

const ProductInfo: React.FC<{
    name: string;
    price: number;
    variant: "grid" | "list";
}> = React.memo(({ name, price, variant }) => {
    const isGrid = variant === "grid";

    return (
        <View className={isGrid ? "p-4" : "flex-1 ml-4 justify-center"}>
            <Text
                className={
                    isGrid
                        ? "text-lg font-medium text-gray-900 mb-2 leading-6"
                        : "text-lg font-medium text-gray-900 mb-1.5"
                }
                numberOfLines={2}
            >
                {name}
            </Text>
            <Text className={isGrid ? "text-xl font-bold text-primary" : "text-base font-semibold text-gray-500"}>
                {PriceFormatter.format(price)}
            </Text>
        </View>
    );
});

ProductInfo.displayName = "ProductInfo";

const GridView: React.FC<ProductTileProps & { animatedStyle: ViewStyle }> = React.memo(
    ({ product, onEdit, onDelete, animatedStyle }) => {
        const { showToast } = useToast();

        return (
            <Animated.View className="flex-1 mb-4" style={animatedStyle}>
                <TouchableOpacity
                    activeOpacity={0.85}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-100"
                    onPress={() => showToast(`${product.name} got tapped!`)}
                >
                    <View className="relative w-full h-44 bg-gray-100">
                        <ProductImage uri={product.thumbnail} className="w-full h-full" />
                        <GridActionButtons product={product} viewMode="grid" onEdit={onEdit} onDelete={onDelete} />
                    </View>
                    <ProductInfo name={product.name} price={product.price} variant="grid" />
                </TouchableOpacity>
            </Animated.View>
        );
    }
);

GridView.displayName = "GridView";

const ListView: React.FC<ProductTileProps & { animatedStyle: ViewStyle }> = React.memo(
    ({ product, onEdit, onDelete, animatedStyle }) => {
        const { showToast } = useToast();

        return (
            <Animated.View className="mb-3" style={animatedStyle}>
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => showToast(`${product.name} got tapped!`)}
                    className="bg-white rounded-2xl flex-row items-center p-3 border border-slate-100"
                >
                    <ProductImage uri={product.thumbnail} className="w-20 h-20 rounded-xl bg-gray-100" />
                    <ProductInfo name={product.name} price={product.price} variant="list" />
                    <ListActionButtons product={product} viewMode="list" onEdit={onEdit} onDelete={onDelete} />
                </TouchableOpacity>
            </Animated.View>
        );
    }
);

ListView.displayName = "ListView";

/**
 * ProductListTile Component
 *
 * @remarks
 * - Displays a single product in either **grid** or **list** view.
 * - Supports animated entry with fade, slide, and scale transitions.
 * - Includes product image, name, and formatted price.
 * - Provides action buttons for **edit** and **delete** (with different layouts depending on view mode).
 * - Shows a toast when the product is tapped.
 *
 * @param product - The product object to render. Must include `name`, `price`, and `thumbnail`.
 * @param viewMode - Layout mode; either `"grid"` or `"list"`.
 * @param index - Position index of the product in the list (used to stagger animations).
 * @param onEdit - Optional callback invoked when the edit button is pressed.
 * @param onDelete - Optional callback invoked when the delete button is pressed.
 *
 * @example
 * ```tsx
 * <ProductListTile
 *   product={[{
 *     name: "Smartphone",
 *     price: 599.99,
 *     thumbnail: "https://example.com/image.png"
 *   }]}
 *   viewMode="grid"
 *   index={0}
 *   onEdit={(p) => console.log("Edit", p)}
 *   onDelete={(p) => console.log("Delete", p)}
 * />
 * ```
 */

export const ProductListTile: React.FC<ProductTileProps> = React.memo(
    ({ product, viewMode, onEdit, onDelete, index }) => {
        const animatedStyle = useProductAnimation(index);

        const ViewComponent = viewMode === "grid" ? GridView : ListView;

        return (
            <ViewComponent
                product={product}
                viewMode={viewMode}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                animatedStyle={animatedStyle}
            />
        );
    }
);

ProductListTile.displayName = "ProductListTile";
