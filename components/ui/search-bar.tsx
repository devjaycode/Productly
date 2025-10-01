import { Colors } from "@/constants/color";
import { Search, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, TextInput, TextInputProps, View } from "react-native";

type SearchBarProps = TextInputProps & {
    onSearch?: (text: string) => void;
    className?: string;
};

/**
 * SearchBar component provides a styled search input with animated clear (X) icon.
 *
 * @remarks
 * - Displays a search icon on the left and a text input for user queries.
 * - Shows an animated clear (X) icon when there is text in the input, allowing users to quickly clear the search.
 * - Calls the `onSearch` callback with the trimmed input value on every change.
 * - Accepts additional props for the underlying TextInput.
 *
 * @param props - Component props.
 * @param props.onSearch - Optional callback invoked with the trimmed search text whenever the input changes or is cleared.
 * @param props.className - Optional additional class names for styling the container.
 * @returns A React functional component rendering a search bar with animated clear functionality.
 */
export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, className = "", ...props }) => {
    const [text, setText] = useState("");

    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (text.trim().length > 0) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [scaleAnim, text]);

    return (
        <View
            className={`relative flex-row items-center gap-x-1 w-full rounded-lg border-none bg-slate-200/60 py-1 px-3 ${className}`}
        >
            {/* Search Icon */}
            <Search size={20} color={Colors.slate[400]} />

            <TextInput
                value={text}
                onChangeText={(val) => {
                    setText(val);
                    onSearch?.(val.trim());
                }}
                placeholder="Search products"
                placeholderTextColor={Colors.slate[400]}
                className="text-slate-800 focus:outline-none flex-1"
                {...props}
            />

            {/* Clear Icon */}
            <View className="absolute right-1 top-1/2 mt-1 -translate-x-1/2 -translate-y-1/2">
                <Animated.View
                    style={{
                        transform: [{ scale: scaleAnim }],
                        opacity: scaleAnim,
                    }}
                >
                    <Pressable
                        onPress={() => {
                            setText("");
                            onSearch?.("");
                        }}
                    >
                        <X size={18} color={Colors.slate[400]} className="bg-red-500" />
                    </Pressable>
                </Animated.View>
            </View>
        </View>
    );
};

SearchBar.displayName = "SearchBar";
