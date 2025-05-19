import axiosInstance, { uploadFile } from '@/utils/axios';
import { useStore } from '@/stores/productStore';
import canI from '@/function/CanI';

export interface ProductData{
    name: string;
    description: string;
    price: number;
    stock: number;
    gender: string;
    size: string;
    brand: string;
    image: string;
    type: string;
    imageId: string;
}
 export interface ProductResponse{
    id: number
    name: string;
    description: string;
    price: number;
    stock: number;
    gender: string;
    size: string;
    brand: string;
    image: string;
    type: string;
    imageId: string;
    best_seller: boolean;
 }

 const transformProductData = (productData: ProductResponse) => {
   return {
    id: productData.id,
    name: productData.name,
    description: productData.description,
    price: productData.price,
    stock: productData.stock,
    gender: productData.gender,
    size: productData.size,
    brand: productData.brand,
    image: productData.image,
    type: productData.type,
    imageId: productData.imageId,
    bestSeller: productData.best_seller
   }
}

export const productService = {
   fetchProducts: async (permissions: string[]) => {
    const store = useStore.getState();
    const ICan = canI(permissions, 'products.view');
        if(!ICan) {
            store.setError('You do not have permission to view products');
             return{
              success: false,
              message: "You do not have permission to view product list",
            };
        }
    try {
        store.setIsLoading(true)
        store.setError(null)
        const response = await axiosInstance.get('/product/list')
        if (response.data && response.data.productList) {
            // Fix: Map through each product in the array and transform it
            const transformedProducts = response.data.productList.map((product: ProductResponse) => 
                transformProductData(product)
            );
            // Add all transformed products to the store
            store.setProducts(transformedProducts);
        }
        return response.data
    } catch (error: any){
        const errorMessage = error.response?.data?.error || 'Failed to fetch products';
        store.setError(errorMessage);
        throw error;
    } finally{
        store.setIsLoading(false);
    }
   },
   createProduct: async (permissions: string[], productData: ProductData) => {
    const store = useStore.getState();
    const ICan = canI(permissions, 'products.create');
    if(!ICan) {
        store.setError('You do not have permission to view products');
        return{
            success: false,
            message: "You do not have permission to view product list",
        };
    }
    try{
        store.setIsLoading(true);
        store.setError(null);
        const response = await axiosInstance.post('/product/create', productData);
        await productService.fetchProducts(permissions);
        return{
            success: true,
            message: "created product successfully",
            data: response.data
        }
    } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Failed to fetch products';
        store.setError(errorMessage);
        throw error;
    } finally{
        store.setIsLoading(false)
    }
   },
   updateProduct: async(id: number, permissions: string[], updates: Partial<ProductData>) => {
    const store = useStore.getState();
    const ICan = canI(permissions, 'products.edit');
    if (!ICan){
        store.setError("You are not allowed to edit products")
        return{
            success: false,
            message: "Not enough permissions to edit products"
        }
    }
    try{
        store.setIsLoading(true);
        store.setError(null);
        const response = await axiosInstance.put(`/products/update/${id}`, updates);
        if (response.status == 200 && response.data){
            const updatedProduct = transformProductData(response.data.product);
            store.updateProduct(id, updatedProduct)
            return{
                success: true,
                message: 'Updated product successfully',
                data: response.data
            }
        }else {
            
            return{
                success: false,
                message: "failed to Update producs"
            }
        }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to Update products';
            store.setError(errorMessage);
            throw error;
        } finally{
            store.setIsLoading(false)
        }
   },
   deleteProduct: async(id: number, permissions: string[]) => {
    const store = useStore.getState();
    const ICan = canI(permissions, 'products.delete');
    if (!ICan){
        store.setError("You do not have permission to delete products");
        return{
            success: false,
            message: "You do not have permission to delete products"
        }
    } try {
        store.setIsLoading(true);
        store.setError(null);
        const response = await axiosInstance.delete(`/products/delete/${id}`);
        if (response.status == 200) {
            store.deleteProduct(id);
            return{
                success: true,
                message: "Product deleted successfully"
            }
        }
        return response.data
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to delete products';
            store.setError(errorMessage);
            throw error;
        } finally{
            store.setIsLoading(false)
        }
   },
   generateImageLink: async (file: File, permissions: string[]) => {
    const store = useStore.getState();
    const ICan = canI(permissions, 'products.edit');
    if (!ICan){
        store.setError("You are not allowed to edit products")
        return{
            success: false,
            message: "Not enough permissions to edit products"
        }
    }
    try{
        store.setIsLoading(true);
        store.setError(null);
        const response = await uploadFile('/upload-image', file);
        if (response.status ==201 && response.data) {
            return{
                success: true,
                image: response.data.image_url,
                imageId: response.data.public_id,
                message: response.data.message
            }
        }
    } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Failed to Upload image';
        store.setError(errorMessage);
        throw error;
    } finally{
        store.setIsLoading(false)
    }
   },
   deleteImageLink: async(imageId: string, permissions: string[]) => {
    const store = useStore.getState();
    const ICan = canI(permissions, 'products.edit');
    if (!ICan){
        store.setError("You do not have permission to delete products");
        return{
            success: false,
            message: "You do not have permission to edit products"
        }
    } try {
        store.setIsLoading(true);
        store.setError(null);
        const response = await axiosInstance.delete(`/delete-image/${imageId}`);
        if (response.status == 200) {

            return{
                success: true,
                message: "Image removed successfully"
            }
        }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to Update products';
            store.setError(errorMessage);
            throw error;
        } finally{
            store.setIsLoading(false)
        }
   }
};
export default productService;