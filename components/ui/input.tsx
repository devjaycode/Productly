import React from "react";
import { TextInput as RNTextInput, Text, TextInputProps, View, ViewStyle } from "react-native";

type InputProps = TextInputProps & {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
};

/**
 * Input component for rendering a styled text input field with optional label and error message.
 *
 * @param {InputProps} props - The props for the Input component.
 * @param {string} [props.label] - Optional label to display above the input field.
 * @param {string} [props.error] - Optional error message to display below the input field.
 * @param {object} [props.containerStyle] - Optional style object for the container View.
 * @param {string} [props.className] - Additional Tailwind CSS classes for the input field.
 * @returns {JSX.Element} The rendered input component.
 */
export const Input: React.FC<InputProps> = ({ label, error, containerStyle, className = "", ...props }) => {
    return (
        <View style={containerStyle} className="mb-4 w-full">
            {label && <Text className="mb-2 text-slate-700 font-medium">{label}</Text>}
            <RNTextInput
                className={`border rounded-lg px-4 py-3 text-base border-primary/20 bg-white text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-primary ${className}`}
                placeholderTextColor="#9ca3af"
                {...props}
            />

            {error && <Text className="text-error mt-1 text-sm">{error}</Text>}
        </View>
    );
};
