import { Colors } from "@/constants/color";
import { X } from "lucide-react-native";
import { memo } from "react";
import { Image, TouchableOpacity, View, ViewStyle } from "react-native";

const ICON_SIZE = 18;
const IMAGE_HEIGHT = 160;
const REMOVE_BUTTON_ACCESSIBILITY = {
    role: "button" as const,
    label: "Remove image",
};

interface ImagePreviewProps {
    imageUri: string;
    onImageRemove: () => void;
    imageHeight?: number;
    containerClassName?: string;
    imageClassName?: string;
}

interface RemoveButtonProps {
    onPress: () => void;
    size?: number;
}

const RemoveButton: React.FC<RemoveButtonProps> = memo(({ onPress, size = ICON_SIZE }) => (
    <TouchableOpacity
        className="absolute right-2 top-2 z-10 items-center justify-center bg-red-500 p-2 rounded-full shadow"
        onPress={onPress}
        accessibilityRole={REMOVE_BUTTON_ACCESSIBILITY.role}
        accessibilityLabel={REMOVE_BUTTON_ACCESSIBILITY.label}
        activeOpacity={0.8}
    >
        <X size={size} color={Colors.white} />
    </TouchableOpacity>
));

RemoveButton.displayName = "RemoveButton";

/**
 * A component to preview an image with a removable action button.
 * - Displays an image in a styled container.
 * - Provides an accessible remove button overlay.
 * - Supports custom dimensions and class styling.
 */
export const ImagePreview: React.FC<ImagePreviewProps> = memo(
    ({
        imageUri,
        onImageRemove,
        imageHeight = IMAGE_HEIGHT,
        containerClassName = "rounded-2xl border border-slate-200",
        imageClassName = "h-full w-full",
    }) => {
        if (!imageUri) return null;

        const imageContainerStyle: ViewStyle = {
            height: imageHeight,
        };

        return (
            <View className={containerClassName}>
                <View className="relative m-1 flex-1 overflow-hidden rounded-xl" style={imageContainerStyle}>
                    <RemoveButton onPress={onImageRemove} />
                    <Image
                        source={{ uri: imageUri }}
                        className={imageClassName}
                        resizeMode="cover"
                        accessibilityLabel="Product preview image"
                    />
                </View>
            </View>
        );
    }
);

ImagePreview.displayName = "ImagePreview";
