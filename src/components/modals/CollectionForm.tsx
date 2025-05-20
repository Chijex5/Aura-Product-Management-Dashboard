import React, { useState, useEffect } from 'react';
import { Search, X, Check, Plus } from 'lucide-react';
type Product = {
  id: number;
  name: string;
  price: number;
  brand?: string;
  type?: string;
  image: string;
  description?: string;
};
type CollectionData = {
  name: string;
  description?: string;
  image: string;
  featured: boolean;
  products: Product[];
  mainProductId?: number;
};
interface CollectionFormProps {
  isEditingCollection: boolean;
  currentCollection?: {
    id: number;
    name: string;
    description?: string;
    image: string;
    featured: boolean;
    products: Product[];
    mainProductId?: number;
  } | null;
  products: Product[];
  isLoading: boolean;
  onSubmit: (data: CollectionData) => void;
  onCancel: () => void;
}
const CollectionForm: React.FC<CollectionFormProps> = ({
  isEditingCollection,
  currentCollection,
  products,
  isLoading,
  onSubmit,
  onCancel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mainProductId, setMainProductId] = useState<number | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [featured, setFeatured] = useState(false);

  // Initialize form data when editing
  useEffect(() => {
    if (isEditingCollection && currentCollection) {
      setMainProductId(currentCollection.mainProductId || null);
      setSelectedProductIds(currentCollection.products.filter(p => p.id !== currentCollection.mainProductId).map(p => p.id));
      setFeatured(currentCollection.featured);
    }
  }, [isEditingCollection, currentCollection]);
  console.log(currentCollection);
  // Get the main product object
  const mainProduct = mainProductId ? products.find(p => p.id === mainProductId) : null;
  const handleProductSelection = (productId: number) => {
    if (mainProductId === productId) {
      return; // Don't allow deselecting the main product this way
    }
    setSelectedProductIds(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };
  const handleSetMainProduct = (productId: number) => {
    // If this product was previously in the selection, remove it
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(prev => prev.filter(id => id !== productId));
    }

    // If there was a previous main produact, add it to the selection
    if (mainProductId && mainProductId !== productId) {
      setSelectedProductIds(prev => [...prev, mainProductId]);
    }
    setMainProductId(productId);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainProduct) return;

    // Get selected products excluding the main product
    const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));

    // Create the collection data
    const collectionData: CollectionData = {
      name: mainProduct.name,
      description: mainProduct.description || '',
      image: mainProduct.image,
      featured: featured,
      products: [mainProduct, ...selectedProducts],
      mainProductId: mainProduct.id
    };
    onSubmit(collectionData);
  };
  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.brand?.toLowerCase().includes(searchTerm.toLowerCase()));

  // Check if we have valid selections (1 main + 1-3 additional products)
  const isValid = mainProductId !== null && selectedProductIds.length >= 1 && selectedProductIds.length <= 3;
  return <div className="bg-white rounded-lg p-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Main Product Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Product*
            </label>
            <p className="text-sm text-gray-500 mb-4">
              This product will provide the collection name, image, and description
            </p>
            
            {mainProduct ? <div className="border border-purple-200 bg-purple-50 rounded-lg p-4 relative">
                <button type="button" onClick={() => setMainProductId(null)} className="absolute top-2 right-2 p-1 bg-white hover:bg-gray-100 rounded-full">
                  <X size={16} className="text-gray-500" />
                </button>
                
                <div className="flex items-center">
                  <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden mr-4 border border-gray-200">
                    <img src={mainProduct.image} alt={mainProduct.name} className="h-full w-full object-cover" onError={e => {
                  (e.target as HTMLImageElement).src = '/images/placeholder-perfume.jpg';
                }} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{mainProduct.name}</h4>
                    <p className="text-sm text-gray-500">{mainProduct.brand} • ₦{mainProduct.price}</p>
                  </div>
                </div>
                
                {mainProduct.description && <div className="mt-3">
                    <p className="text-sm text-gray-700 line-clamp-3">{mainProduct.description}</p>
                  </div>}
              </div> : <div className="border border-gray-200 bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-500">No main product selected</p>
                <p className="text-sm text-gray-400 mt-1">Select a product from the list on the right</p>
              </div>}
          </div>
          
          <div className="flex items-center">
            <input type="checkbox" id="featured" checked={featured} onChange={e => setFeatured(e.target.checked)} className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
              Featured Collection
            </label>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Products</h4>
            <p className="text-sm text-gray-500 mb-4">
              Select 2-4 products total (including main product)
            </p>
            
            {selectedProductIds.length > 0 ? <div className="flex flex-wrap gap-2">
                {selectedProductIds.map(id => {
              const product = products.find(p => p.id === id);
              if (!product) return null;
              return <div key={id} className="flex items-center bg-gray-100 px-2 py-1 rounded-lg">
                      <div className="h-8 w-8 flex-shrink-0 rounded-md overflow-hidden mr-2">
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" onError={e => {
                    (e.target as HTMLImageElement).src = '/images/placeholder-perfume.jpg';
                  }} />
                      </div>
                      <span className="text-sm">{product.name}</span>
                      <button type="button" onClick={() => handleProductSelection(id)} className="ml-1 p-1 text-gray-500 hover:text-gray-700">
                        <X size={14} />
                      </button>
                    </div>;
            })}
              </div> : <p className="text-sm text-gray-500">No additional products selected</p>}
            
            <div className="mt-2 text-sm">
              <span className={`font-medium ${mainProductId && selectedProductIds.length >= 1 && selectedProductIds.length <= 3 ? 'text-green-600' : 'text-gray-500'}`}>
                Total: {(mainProductId ? 1 : 0) + selectedProductIds.length} products
              </span>
              {mainProductId && selectedProductIds.length >= 1 && selectedProductIds.length <= 3 && <span className="ml-2 text-green-600">✓ Valid selection</span>}
              {(!mainProductId || selectedProductIds.length < 1 || selectedProductIds.length > 3) && <span className="ml-2 text-amber-600">
                  {!mainProductId ? 'Select a main product' : selectedProductIds.length < 1 ? 'Select at least 1 additional product' : 'Maximum 3 additional products allowed'}
                </span>}
            </div>
          </div>
        </div>
        
        {/* Right Column - Product List */}
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Available Products
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
            </div>
          </div>
          
          <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 p-2">
            {filteredProducts.length > 0 ? filteredProducts.map(product => {
            const isMainProduct = mainProductId === product.id;
            const isSelected = selectedProductIds.includes(product.id);
            return <div key={product.id} className={`flex items-center p-2 rounded-lg mb-2 cursor-pointer hover:bg-gray-100 ${isMainProduct ? 'bg-purple-100 border border-purple-300' : isSelected ? 'bg-blue-50 border border-blue-200' : 'bg-white border border-gray-100'}`}>
                    <div className="h-12 w-12 flex-shrink-0 rounded-md overflow-hidden mr-3 border border-gray-200">
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" onError={e => {
                  (e.target as HTMLImageElement).src = '/images/placeholder-perfume.jpg';
                }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.brand} • ₦{product.price}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleSetMainProduct(product.id)} className={`p-1.5 rounded-full ${isMainProduct ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-purple-100'}`} title={isMainProduct ? 'Main product' : 'Set as main product'}>
                        <Check size={16} />
                      </button>
                      <button type="button" onClick={() => handleProductSelection(product.id)} disabled={isMainProduct} className={`p-1.5 rounded-full ${isSelected ? 'bg-blue-600 text-white' : isMainProduct ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-gray-100 text-gray-500 hover:bg-blue-100'}`} title={isMainProduct ? 'Main product cannot be selected here' : isSelected ? 'Remove from selection' : 'Add to selection'}>
                        {isSelected ? <Check size={16} /> : <Plus size={16} />}
                      </button>
                    </div>
                  </div>;
          }) : <div className="flex justify-center items-center h-full">
                <p className="text-gray-500">No products found matching your search.</p>
              </div>}
          </div>
        </div>
        
        {/* Form Actions - Full Width */}
        <div className="md:col-span-2 flex justify-end space-x-4 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
            Cancel
          </button>
          
          <button type="submit" disabled={isLoading || !isValid} className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300">
            {isLoading ? <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </> : isEditingCollection ? 'Update Collection' : 'Add Collection'}
          </button>
        </div>
      </form>
    </div>;
};
export default CollectionForm;