import React from 'react';
import { Plus, X } from 'lucide-react';
interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  gender: string;
  size: string;
  brand: string;
  image: string;
  imageFile: File | null;
}
interface ProductFormProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  isEditingProduct: boolean;
  isLoading: boolean;
  uploadingImage: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGenerateImageLink: () => Promise<void>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}
const ProductForm: React.FC<ProductFormProps> = ({
  formData,
  setFormData,
  isEditingProduct,
  isLoading,
  uploadingImage,
  handleInputChange,
  handleImageChange,
  handleGenerateImageLink,
  handleSubmit,
  onCancel
}) => {
  return <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-6 mb-8 border border-purple-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          {isEditingProduct ? 'Edit Product' : 'Add New Product'}
        </h3>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name*
            </label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" required />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price*
              </label>
              <input type="number" name="price" value={formData.price} onChange={handleInputChange} min="0" step="0.01" className="w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock*
              </label>
              <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} min="0" className="w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" required />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
                <option value="unisex">Unisex</option>
                <option value="female">Feminine</option>
                <option value="male">Masculine</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size
              </label>
              <select name="size" value={formData.size} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
                <option value="25ml">25ml</option>
                <option value="30ml">30ml</option>
                <option value="35ml">35ml</option>
                <option value="50ml">50ml</option>
                <option value="80ml">80ml</option>
                <option value="90ml">90ml</option>
                <option value="100ml">100ml</option>
                <option value="110ml">110ml</option>
                <option value="200ml">200ml</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand*
            </label>
            <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" required />
          </div>
        </div>
        
        {/* Right Column - Image Upload */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image*
            </label>
            <div className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
              {formData.image ? <div className="relative w-full h-40">
                  <img src={formData.image} alt="Product preview" className="w-full h-full object-contain" />
                  <button type="button" onClick={() => setFormData(prev => ({
                ...prev,
                image: '',
                imageFile: null
              }))} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-100">
                    <X size={16} className="text-red-600" />
                  </button>
                </div> : <div className="text-center">
                  <div className="mt-2">
                    <input id="image-upload" name="image" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-3">
                        <Plus size={20} className="text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-purple-600">
                        Upload an image
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </label>
                  </div>
                </div>}
            </div>
            
            {formData.imageFile && !formData.image && <div className="mt-4">
                <button type="button" onClick={handleGenerateImageLink} disabled={uploadingImage} className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300">
                  {uploadingImage ? <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </> : 'Upload Image'}
                </button>
              </div>}
          </div>
        </div>
        
        {/* Form Actions - Full Width */}
        <div className="md:col-span-2 flex justify-end space-x-4 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
            Cancel
          </button>
          
          <button type="submit" disabled={isLoading || uploadingImage} className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300">
            {isLoading ? <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </> : isEditingProduct ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>;
};
export default ProductForm;