import { Colors } from "@/constants/color";
import { useProducts } from "@/contexts/products-provider";
import { useToast } from "@/contexts/toast-provider";
import { Product } from "@/types/product.type";
import * as ExpoImagePicker from "expo-image-picker";
import { ImageUpIcon, X } from "lucide-react-native";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ImagePreview } from "../image-preview";
import { BottomSheet, BottomSheetProps, BottomSheetRef } from "../ui/bottom-sheet";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ALERT_TYPE } from "../ui/toast";

const MAX_PRODUCTS = 5;
const SNAP_POINTS = [0.25, 0.75, 0.95];
const KEYBOARD_OFFSET = { ios: 60, android: 20 };
const SIMULATED_DELAY = 2000;

interface AddProductBottomSheetProps extends Omit<BottomSheetProps, "children"> {
    onCancel?: () => void;
    onProductAdded?: (product: Product) => void;
}

export interface AddProductBottomSheetRef extends BottomSheetRef {
    openEdit: (product: Product) => void;
}

interface FormErrors {
    name: string;
    price: string;
}

function useProductForm() {
    const [productName, setProductName] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [productThumbnail, setProductThumbnail] = useState("");
    const [errors, setErrors] = useState<FormErrors>({ name: "", price: "" });
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const resetForm = () => {
        setProductName("");
        setProductPrice("");
        setProductThumbnail("");
        setErrors({ name: "", price: "" });
    };

    const loadProduct = (product: Product) => {
        setProductName(product.name);
        setProductPrice(product.price.toString());
        setProductThumbnail(product.thumbnail);
        setErrors({ name: "", price: "" });
    };

    const isEditing = !!editingProduct;

    return {
        productName,
        setProductName,
        productPrice,
        setProductPrice,
        productThumbnail,
        setProductThumbnail,
        errors,
        setErrors,
        editingProduct,
        setEditingProduct,
        resetForm,
        loadProduct,
        isEditing,
    };
}

class ProductValidator {
    static validate(name: string, price: string): { valid: boolean; errors: FormErrors } {
        const errors: FormErrors = { name: "", price: "" };
        let valid = true;

        if (!name.trim()) {
            errors.name = "Product name is required.";
            valid = false;
        }

        if (!price.trim() || isNaN(Number(price))) {
            errors.price = "Valid price is required.";
            valid = false;
        }

        return { valid, errors };
    }
}

class ImagePickerService {
    static async pickImage(): Promise<string | null> {
        const result = await ExpoImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 1,
        });

        if (!result.canceled && result.assets?.length > 0) {
            return result.assets[0].uri;
        }

        return null;
    }
}

class ProductService {
    static canAddProduct(currentCount: number): boolean {
        return currentCount < MAX_PRODUCTS;
    }

    static createProduct(name: string, price: number, thumbnail: string): Product {
        return {
            id: Date.now().toString(),
            name,
            price,
            thumbnail,
        };
    }

    static async simulateDelay(): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY));
    }
}

/**
 * A bottom sheet component for adding or editing products.
 * - Allows input of product name, price, and thumbnail.
 * - Supports editing an existing product.
 * - Provides validation and max product limit enforcement.
 * - Uses Toast for error/success notifications.
 */

const AddProductBottomSheet = forwardRef<AddProductBottomSheetRef, AddProductBottomSheetProps>(
    ({ onCancel, onProductAdded, ...props }, ref) => {
        const {
            productName,
            setProductName,
            productPrice,
            setProductPrice,
            productThumbnail,
            setProductThumbnail,
            errors,
            setErrors,
            editingProduct,
            setEditingProduct,
            resetForm,
            loadProduct,
            isEditing,
        } = useProductForm();

        const [isSubmitting, setIsSubmitting] = useState(false);

        const { showToast } = useToast();
        const { products, addProduct, updateProduct } = useProducts();
        const bottomSheetRef = useRef<BottomSheetRef>(null);

        const open = () => {
            if (editingProduct) setEditingProduct(null);
            bottomSheetRef.current?.open?.();
        };

        const close = () => bottomSheetRef.current?.close?.();

        const snapToIndex = (index: number) => bottomSheetRef.current?.snapToIndex?.(index);

        const openEdit = (product: Product) => {
            setEditingProduct(product);
            bottomSheetRef.current?.open?.();
        };

        useImperativeHandle(ref, () => ({ open, close, snapToIndex, openEdit }));

        const handlePickThumbnail = async () => {
            const imageUri = await ImagePickerService.pickImage();
            if (imageUri) {
                setProductThumbnail(imageUri);
            }
        };

        const validateForm = (): boolean => {
            const { valid, errors: validationErrors } = ProductValidator.validate(productName, productPrice);
            setErrors(validationErrors);

            if (!valid) {
                showToast("Please fix the errors in the form.", ALERT_TYPE.ERROR);
            }

            return valid;
        };

        const checkThumbnail = (): boolean => {
            if (!productThumbnail) {
                showToast("Please upload a product thumbnail.", ALERT_TYPE.ERROR);
                return false;
            }
            return true;
        };

        const checkProductLimit = (): boolean => {
            if (!ProductService.canAddProduct(products.length)) {
                showToast(`You have reached the maximum limit of ${MAX_PRODUCTS} products.`, ALERT_TYPE.INFO);
                return false;
            }
            return true;
        };

        const handleUpdateProduct = async () => {
            if (!editingProduct) return;

            const updatedProduct = {
                name: productName,
                price: Number(productPrice),
                thumbnail: productThumbnail,
            };

            await updateProduct(editingProduct.id, updatedProduct);
            showToast("Product updated successfully!", ALERT_TYPE.SUCCESS);
            setEditingProduct(null);
        };

        const handleCreateProduct = async () => {
            const newProduct = ProductService.createProduct(productName, Number(productPrice), productThumbnail);

            await addProduct(newProduct);
            showToast("Product added successfully!", ALERT_TYPE.SUCCESS);
            onProductAdded?.(newProduct);
        };

        const handleSubmit = async () => {
            if (isSubmitting || !validateForm() || !checkThumbnail()) return;

            if (!isEditing && !checkProductLimit()) return;

            setIsSubmitting(true);

            await ProductService.simulateDelay();

            if (isEditing) {
                await handleUpdateProduct();
            } else {
                await handleCreateProduct();
            }

            resetForm();
            setIsSubmitting(false);
            close();
        };

        const handleCancel = () => {
            close();
            onCancel?.();
        };

        useEffect(() => {
            if (editingProduct) {
                loadProduct(editingProduct);
            } else {
                resetForm();
            }
        }, [editingProduct, loadProduct, resetForm]);

        const keyboardOffset = Platform.OS === "ios" ? KEYBOARD_OFFSET.ios : KEYBOARD_OFFSET.android;
        const keyboardBehavior = Platform.OS === "ios" ? "padding" : "height";

        return (
            <BottomSheet ref={bottomSheetRef} snapPoints={SNAP_POINTS} enableBackdropDismiss={true} {...props}>
                <KeyboardAvoidingView
                    className="flex-1"
                    keyboardVerticalOffset={keyboardOffset}
                    behavior={keyboardBehavior}
                >
                    <ScrollView showsVerticalScrollIndicator={false} className="p-4">
                        {/* Header */}
                        <View className="flex-row justify-between">
                            <Text className="text-xl font-bold text-slate-800">
                                {isEditing ? "Edit" : "Add New"} Product
                            </Text>
                            <TouchableOpacity activeOpacity={0.8} onPress={close}>
                                <X size={24} color={Colors.slate[500]} />
                            </TouchableOpacity>
                        </View>

                        {/* Form */}
                        <View className="my-6 gap-x-4">
                            <Input
                                label="Product Name"
                                placeholder="Enter product name"
                                value={productName}
                                onChangeText={setProductName}
                                error={errors.name}
                            />

                            <Input
                                label="Price"
                                placeholder="$ 0.00"
                                value={productPrice}
                                keyboardType="numeric"
                                onChangeText={setProductPrice}
                                error={errors.price}
                            />

                            <View>
                                <Text className="mb-2 text-slate-700 font-medium">Upload Thumbnail</Text>

                                {!productThumbnail ? (
                                    <Button
                                        className="rounded-lg border border-dashed border-primary/20 bg-primary/5 px-8 py-8 text-center"
                                        onPress={handlePickThumbnail}
                                    >
                                        <View className="flex items-center justify-center gap-y-2">
                                            <ImageUpIcon size={28} color={Colors.primary} />
                                            <Text className="font-semibold text-primary">Tap to upload</Text>
                                            <Text className="text-xs text-slate-500">PNG, JPG up to 10MB</Text>
                                        </View>
                                    </Button>
                                ) : (
                                    <ImagePreview
                                        imageUri={productThumbnail}
                                        onImageRemove={() => setProductThumbnail("")}
                                    />
                                )}
                            </View>
                        </View>

                        {/* Actions */}
                        <View className="mt-8 flex-row gap-4 pb-6">
                            <Button
                                onPress={handleCancel}
                                containerClassName="flex-1"
                                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center shadow-sm justify-center items-center"
                            >
                                <Text className="font-semibold text-slate-700">Cancel</Text>
                            </Button>
                            <Button
                                onPress={handleSubmit}
                                containerClassName="flex-1"
                                loading={isSubmitting}
                                className="rounded-lg bg-primary px-4 py-3 text-center shadow-sm justify-center items-center"
                            >
                                <Text className="font-semibold text-white">{isEditing ? "Update" : "Add"} Product</Text>
                            </Button>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </BottomSheet>
        );
    }
);

AddProductBottomSheet.displayName = "AddProductBottomSheet";

export default AddProductBottomSheet;
