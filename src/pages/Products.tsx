import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import useProductApi from '@/hooks/useProductsApi';
import { Trash2, Edit, Plus, Search, Star, StarOff, X } from 'lucide-react';
import ProductForm from '@/components/modals/Productform';
import CollectionForm from '@/components/modals/CollectionForm';
import { toast } from 'react-hot-toast';

// Separate this into its own component to prevent re-renders
const ProductFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialProduct = null, 
  isEditMode = false,
  uploadProductImage,
  userPermissions,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    gender: 'Unisex',
    imageId: '',
    size: '50ml',
    brand: '',
    image: '',
    imageFile: null,
    type: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Initialize form data if editing
  useEffect(() => {
    if (isEditMode && initialProduct) {
      setFormData({
        name: initialProduct.name || '',
        description: initialProduct.description || '',
        price: initialProduct.price || 0,
        stock: initialProduct.stock || 0,
        gender: initialProduct.gender || 'Unisex',
        size: initialProduct.size || '50ml',
        brand: initialProduct.brand || '',
        image: initialProduct.image || '',
        imageId: initialProduct.imageId || '',
        type: initialProduct.type || '',
        imageFile: null
      });
    }
  }, [isEditMode, initialProduct]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value
    }));
  };
  
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        imageFile: e.target.files ? e.target.files[0] : null
      }));
    }
  };
  
  const handleGenerateImageLink = async () => {
    if (formData.imageFile) {
      setUploadingImage(true);
      try {
        const response = await uploadProductImage(formData.imageFile, userPermissions);
        if (response && response.success){
          setFormData(prev => ({
            ...prev,
            image: response.image,
            imageId: response.imageId
          }));
          toast.success(response.message);
        }
      } catch (error) {
        toast.error("Failed to upload image");
      } finally {
        setUploadingImage(false);
      }
    } else {
      toast.error("Please select an image first");
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.brand || !formData.image) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Auto-generate a simple description if none provided
    const description = formData.description || 
      `A premium ${formData.gender.toLowerCase() === 'unisex' ? 'unisex' : 
        formData.gender.toLowerCase() === 'female' ? 'feminine' : 'masculine'} 
        fragrance by ${formData.brand}. Available in ${formData.size}.`;
    
    const productData = {
      name: formData.name,
      description,
      price: formData.price,
      stock: formData.stock,
      gender: formData.gender,
      size: formData.size,
      brand: formData.brand,
      image: formData.image,
      imageId: formData.imageId,
      type: formData.type,
    };
    
    setIsLoading(true);
    try {
      await onSubmit(productData, formData);
      onClose();
    } catch (error) {
      toast.error("Failed to save product");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end p-4">
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="px-6 pb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h2>
          <ProductForm
            formData={formData}
            setFormData={setFormData}
            isEditingProduct={isEditMode}
            isLoading={isLoading}
            uploadingImage={uploadingImage}
            handleInputChange={handleInputChange}
            handleImageChange={handleImageChange}
            handleGenerateImageLink={handleGenerateImageLink}
            resetForm={onClose}
            handleSubmit={handleSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

// Similarly for CollectionFormModal (optional - implement if needed)
const CollectionFormModal = ({ isOpen, onClose, onSubmit, initialCollection = null, isEditMode = false, products }) => {
  // Similar implementation as ProductFormModal
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end p-4">
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="px-6 pb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {isEditMode ? 'Edit Collection' : 'Add New Collection'}
          </h2>
          <CollectionForm 
            isEditingCollection={isEditMode}
            currentCollection={initialCollection}
            products={products}
            isLoading={false}
            onSubmit={onSubmit}
            onCancel={onClose}
            setIsAddingCollection={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

const Products = () => {
  const { user } = useAuth();
  const { 
    products,
    collections, 
    addCollection, 
    deleteCollection, 
    updateCollection,
    loadProducts, 
    isLoading, 
    error, 
    createProduct, 
    editProduct, 
    removeProduct, 
    removeProductImage,
    uploadProductImage  
  } = useProductApi();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('products');
  
  // Product states
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  
  // Collection states
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isEditingCollection, setIsEditingCollection] = useState(false);
  const [currentCollection, setCurrentCollection] = useState(null);
  const [collectionSearchTerm, setCollectionSearchTerm] = useState('');
  
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    loadProducts(user.permissions);
  }, []);
  
  // Product handlers
  const openAddProductModal = () => {
    setCurrentProduct(null);
    setIsEditingProduct(false);
    setIsProductModalOpen(true);
  };
  
  const openEditProductModal = (id) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setCurrentProduct(product);
      setIsEditingProduct(true);
      setIsProductModalOpen(true);
    }
  };
  
  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setCurrentProduct(null);
    setIsEditingProduct(false);
  };
  
  const handleProductSubmit = async (productData, formData) => {
    let response;
    if (isEditingProduct && currentProduct) {
      response = await editProduct(currentProduct.id, user.permissions, productData);
      toast.success("Product updated successfully!");
    } else {
      response = await createProduct(user.permissions, productData);
      toast.success("Product added successfully!");
    }
    return response;
  };
  
  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      removeProduct(id, user.permissions);
      toast.success("Product deleted successfully!");
    }
  };
  
  // Collection handlers
  const openAddCollectionModal = () => {
    setCurrentCollection(null);
    setIsEditingCollection(false);
    setIsCollectionModalOpen(true);
  };
  
  const openEditCollectionModal = (id) => {
    const collection = collections.find(c => c.id === id);
    if (collection) {
      setCurrentCollection(collection);
      setIsEditingCollection(true);
      setIsCollectionModalOpen(true);
    }
  };
  
  const closeCollectionModal = () => {
    setIsCollectionModalOpen(false);
    setCurrentCollection(null);
    setIsEditingCollection(false);
  };
  
  const handleCollectionSubmit = async (collectionData) => {
    if (isEditingCollection && currentCollection) {
      await updateCollection(currentCollection.id, collectionData);
      toast.success("Collection updated successfully!");
    } else {
      await addCollection(collectionData);
      toast.success("Collection created successfully!");
    }
  };
  
  const handleDeleteCollection = (id) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      deleteCollection(id);
      toast.success("Collection deleted successfully!");
    }
  };
  
  const handleToggleFeature = (id, featured) => {
    updateCollection(id, { featured: !featured });
    toast.success(`Collection ${featured ? 'removed from' : 'added to'} featured successfully!`);
  };
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredCollections = collections.filter(collection => 
    collection.name.toLowerCase().includes(collectionSearchTerm.toLowerCase())
  );
  
  // Product cards grid component
  const ProductCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.length > 0 ? (
        filteredProducts.map(product => (
          <div key={product.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-purple-100">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/images/placeholder-perfume.jpg';
                }}
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                <button 
                  onClick={() => openEditProductModal(product.id)}
                  className="p-2 bg-white/90 hover:bg-purple-100 rounded-full shadow-sm transition-colors"
                >
                  <Edit size={16} className="text-purple-700" />
                </button>
                <button 
                  onClick={() => handleDeleteProduct(product.id)}
                  className="p-2 bg-white/90 hover:bg-red-100 rounded-full shadow-sm transition-colors"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900 truncate">{product.name}</h3>
                <div className="text-lg font-semibold text-purple-700">₦{product.price}</div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{product.brand}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{product.gender}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{product.size}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  product.stock > 10 ? "bg-green-100 text-green-800" : 
                  product.stock > 0 ? "bg-yellow-100 text-yellow-800" : 
                  "bg-red-100 text-red-800"
                }`}>
                  {product.stock > 0 ? `Stock: ${product.stock}` : "Out of Stock"}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full flex justify-center items-center h-48">
          <p className="text-gray-500 text-lg">No products found matching your search.</p>
        </div>
      )}
    </div>
  );
  
  // Collection cards grid component
  const CollectionCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {filteredCollections.length > 0 ? (
        filteredCollections.map(collection => (
          <div key={collection.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-purple-100">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={collection.image} 
                alt={collection.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/images/placeholder-collection.jpg';
                }}
              />
              <div className="absolute top-2 left-2 flex space-x-2">
                <button
                  onClick={() => handleToggleFeature(collection.id, collection.featured)}
                  className="p-2 bg-white/90 hover:bg-yellow-100 rounded-full shadow-sm transition-colors"
                  title={collection.featured ? "Remove from featured" : "Add to featured"}
                >
                  {collection.featured ? (
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  ) : (
                    <StarOff size={16} className="text-gray-500" />
                  )}
                </button>
              </div>
              <div className="absolute top-2 right-2 flex space-x-2">
                <button 
                  onClick={() => openEditCollectionModal(collection.id)}
                  className="p-2 bg-white/90 hover:bg-purple-100 rounded-full shadow-sm transition-colors"
                >
                  <Edit size={16} className="text-purple-700" />
                </button>
                <button 
                  onClick={() => handleDeleteCollection(collection.id)}
                  className="p-2 bg-white/90 hover:bg-red-100 rounded-full shadow-sm transition-colors"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900 truncate">{collection.name}</h3>
                <div className="text-sm font-medium text-purple-700">{collection.products.length} Products</div>
              </div>
              {collection.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{collection.description}</p>
              )}
              <div className="mt-3 flex overflow-x-auto gap-1 pb-1">
                {collection.products.slice(0, 5).map(product => (
                  <div key={product.id} className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden border border-gray-200">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/placeholder-perfume.jpg';
                      }}
                    />
                  </div>
                ))}
                {collection.products.length > 5 && (
                  <div className="w-8 h-8 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700">
                    +{collection.products.length - 5}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full flex justify-center items-center h-48">
          <p className="text-gray-500 text-lg">No collections found matching your search.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white pb-16">
      {/* Decorative gradient elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 rounded-full bg-[#f6e6fa]/30 blur-xl"></div>
      <div className="absolute bottom-1/3 right-20 w-32 h-32 rounded-full bg-[#9c6da5]/20 blur-xl"></div>
      <div className="absolute top-2/3 left-1/4 w-16 h-16 rounded-full bg-[#f6e6fa]/40 blur-lg"></div>
      
      <div className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Product Management</h1>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'products'
                ? 'text-purple-700 border-b-2 border-purple-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'collections'
                ? 'text-purple-700 border-b-2 border-purple-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Collections
          </button>
        </div>
        
        {/* Products Tab Content */}
        {activeTab === 'products' && (
          <div>
            {/* Add Product Button */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={openAddProductModal}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <Plus size={18} />
                Add Product
              </button>
              
              {/* Search Products */}
              <div className="relative w-64">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
            
            {/* Product Cards */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full" />
              </div>
            ) : (
              <ProductCards />
            )}
          </div>
        )}
        
        {/* Collections Tab Content */}
        {activeTab === 'collections' && (
          <div>
            {/* Add Collection Button */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={openAddCollectionModal}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <Plus size={18} />
                Add Collection
              </button>
              
              {/* Search Collections */}
              <div className="relative w-64">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search collections..."
                  value={collectionSearchTerm}
                  onChange={(e) => setCollectionSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
            
            {/* Collection Cards */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full" />
              </div>
            ) : (
              <CollectionCards />
            )}
          </div>
        )}
        
        {/* Modals - rendered conditionally but isolated from parent component */}
        <ProductFormModal
          isOpen={isProductModalOpen}
          onClose={closeProductModal}
          onSubmit={handleProductSubmit}
          initialProduct={currentProduct}
          isEditMode={isEditingProduct}
          uploadProductImage={uploadProductImage}
          userPermissions={user.permissions}
        />
        
        <CollectionFormModal
          isOpen={isCollectionModalOpen}
          onClose={closeCollectionModal}
          onSubmit={handleCollectionSubmit}
          initialCollection={currentCollection}
          isEditMode={isEditingCollection}
          products={products}
        />
      </div>
    </div>
  );
};

export default Products;