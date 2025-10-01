import AddProductBottomSheet, { AddProductBottomSheetRef } from "@/components/modal/add-product-bottom-sheet";
import { ProductListTile } from "@/components/product-list-tile";
import EmptyListNotice from "@/components/ui/empty-list";
import { FAB } from "@/components/ui/fab";
import { SearchBar } from "@/components/ui/search-bar";
import { ALERT_TYPE } from "@/components/ui/toast";
import { ViewSwitcher } from "@/components/ui/view-switcher";
import { Colors } from "@/constants/color";
import { useProducts } from "@/contexts/products-provider";
import { useToast } from "@/contexts/toast-provider";
import { Product } from "@/types/product.type";
import { Plus } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, ListRenderItem, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const APP_TITLE = "Productly";
const GRID_COLUMNS = 2;
const GRID_GAP = 12;
const CONTENT_PADDING_BOTTOM = 100;
const ICON_SIZE = 24;

const BOTTOM_SHEET_CONFIG = {
    snapPoints: [0.25, 0.75, 0.95],
    enableBackdropDismiss: true,
};

const FAB_CONFIG = {
    tooltip: "Click here to add a new product",
    position: "bottom-right" as const,
    accessibilityLabel: "Add Product",
};

type ViewMode = "list" | "grid";

interface ProductListConfig {
    mode: ViewMode;
    numColumns: number;
    columnWrapperStyle?: { gap: number };
}

class ProductSearchService {
    static filter(products: Product[], query: string): Product[] {
        if (!query.trim()) {
            return products;
        }

        const normalizedQuery = query.toLowerCase().trim();
        return products.filter((product) => product.name.toLowerCase().includes(normalizedQuery));
    }
}

class ProductListConfigFactory {
    static create(mode: ViewMode): ProductListConfig {
        return {
            mode,
            numColumns: mode === "grid" ? GRID_COLUMNS : 1,
            columnWrapperStyle: mode === "grid" ? { gap: GRID_GAP } : undefined,
        };
    }
}

function useProductSearch(products: Product[], searchQuery: string) {
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

    useEffect(() => {
        const filtered = ProductSearchService.filter(products, searchQuery);
        setFilteredProducts(filtered);
    }, [products, searchQuery]);

    return filteredProducts;
}

function useProductActions() {
    const { showToast } = useToast();
    const { deleteProduct } = useProducts();
    const addProductRef = useRef<AddProductBottomSheetRef>(null);

    const handleDelete = useCallback(
        (product: Product) => {
            deleteProduct(product.id);
            showToast(`${product.name} has been deleted.`, ALERT_TYPE.SUCCESS);
        },
        [deleteProduct, showToast]
    );

    const handleEdit = useCallback((product: Product) => {
        addProductRef.current?.openEdit(product);
    }, []);

    const handleAdd = useCallback(() => {
        addProductRef.current?.open();
    }, []);

    const handleProductAdded = useCallback((product: Product) => {
        console.log("Product added:", product);
    }, []);

    const handleBottomSheetClose = useCallback(() => {
        console.log("Closed");
    }, []);

    return {
        addProductRef,
        handleDelete,
        handleEdit,
        handleAdd,
        handleProductAdded,
        handleBottomSheetClose,
    };
}

const Header: React.FC = () => (
    <View className="p-4 rounded-lg">
        <Text className="text-gray-900 text-2xl font-semibold">{APP_TITLE}</Text>
    </View>
);

const SearchAndViewControls: React.FC<{
    mode: ViewMode;
    onModeChange: (mode: ViewMode) => void;
    onSearch: (query: string) => void;
}> = ({ mode, onModeChange, onSearch }) => (
    <View className="p-4 flex-row">
        <View className="flex-1 mr-4">
            <SearchBar onSearch={onSearch} />
        </View>
        <ViewSwitcher value={mode} onChange={onModeChange} />
    </View>
);

const ProductList: React.FC<{
    products: Product[];
    mode: ViewMode;
    onDelete: (product: Product) => void;
    onEdit: (product: Product) => void;
}> = ({ products, mode, onDelete, onEdit }) => {
    const config = ProductListConfigFactory.create(mode);

    const renderItem: ListRenderItem<Product> = useCallback(
        ({ item, index }) => (
            <ProductListTile product={item} viewMode={mode} index={index} onDelete={onDelete} onEdit={onEdit} />
        ),
        [mode, onDelete, onEdit]
    );

    const keyExtractor = useCallback((item: Product) => item.id, []);

    return (
        <FlatList
            className="p-4"
            data={products}
            key={config.mode}
            keyExtractor={keyExtractor}
            numColumns={config.numColumns}
            columnWrapperStyle={config.columnWrapperStyle}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: CONTENT_PADDING_BOTTOM }}
            ListEmptyComponent={EmptyListNotice}
        />
    );
};

const AddProductFAB: React.FC<{ onPress: () => void }> = ({ onPress }) => (
    <FAB
        icon={<Plus size={ICON_SIZE} color="white" />}
        tooltip={FAB_CONFIG.tooltip}
        onPress={onPress}
        position={FAB_CONFIG.position}
        accessibilityLabel={FAB_CONFIG.accessibilityLabel}
    />
);

export default function Index() {
    const [mode, setMode] = useState<ViewMode>("list");
    const [searchQuery, setSearchQuery] = useState("");

    const { products } = useProducts();
    const filteredProducts = useProductSearch(products, searchQuery);
    const { addProductRef, handleDelete, handleEdit, handleAdd, handleProductAdded, handleBottomSheetClose } =
        useProductActions();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Header />

            <SearchAndViewControls mode={mode} onModeChange={setMode} onSearch={setSearchQuery} />

            <ProductList products={filteredProducts} mode={mode} onDelete={handleDelete} onEdit={handleEdit} />

            <AddProductFAB onPress={handleAdd} />

            <AddProductBottomSheet
                ref={addProductRef}
                snapPoints={BOTTOM_SHEET_CONFIG.snapPoints}
                enableBackdropDismiss={BOTTOM_SHEET_CONFIG.enableBackdropDismiss}
                onClose={handleBottomSheetClose}
                onProductAdded={handleProductAdded}
            />

            <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        </SafeAreaView>
    );
}
