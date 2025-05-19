import { useStore } from "@/stores/productStore";
import productService, { ProductData, ProductResponse } from "@/services/productService";

export const useProductApi = () => {
    const {
        products,
        collections,
        isLoading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        addCollection,
        updateCollection,
        deleteCollection,
        setError,
        setIsLoading
    } = useStore();

    const loadProducts = async (permissions: string[]) => {
        try {
            return await productService.fetchProducts(permissions);
        } catch (error) {
            console.error("Error loading products:", error);
            return { success: false, message: "Failed to load products" };
        }
    };

    const createProduct = async (permissions: string[], productData: ProductData) => {
        try {
            return await productService.createProduct(permissions, productData);
        } catch (error) {
            console.error("Error creating product:", error);
            return { success: false, message: "Failed to create product" };
        }
    };

    const editProduct = async (id: number, permissions: string[], updates: Partial<ProductData>) => {
        try {
            return await productService.updateProduct(id, permissions, updates);
        } catch (error) {
            console.error("Error updating product:", error);
            return { success: false, message: "Failed to update product" };
        }
    };

    const removeProduct = async (id: number, permissions: string[]) => {
        try {
            return await productService.deleteProduct(id, permissions);
        } catch (error) {
            console.error("Error deleting product:", error);
            return { success: false, message: "Failed to delete product" };
        }
    };

    const uploadProductImage = async (file: File, permissions: string[]) => {
        try {
            return await productService.generateImageLink(file, permissions);
        } catch (error) {
            console.error("Error uploading image:", error);
            return { success: false, message: "Failed to upload image" };
        }
    };

    const removeProductImage = async (imageId: string, permissions: string[]) => {
        try {
            return await productService.deleteImageLink(imageId, permissions);
        } catch (error) {
            console.error("Error removing image:", error);
            return { success: false, message: "Failed to remove image" };
        }
    };

    // Return all the state and functions needed to work with products
    return {
        // State from store
        products,
        collections,
        isLoading,
        error,

        // Service operations
        loadProducts,
        createProduct,
        editProduct,
        removeProduct,
        uploadProductImage,
        removeProductImage,
        addCollection,
        updateCollection,
        deleteCollection,

        
        // Additional store operations that might be needed
        setError,
        setIsLoading
    };
};

export default useProductApi;