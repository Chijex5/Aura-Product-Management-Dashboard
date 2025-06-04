import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import useProductApi from '@/hooks/useProductsApi';
import { Trash2, Edit, Plus, Search, Star, StarOff, X, Filter, Sparkles } from 'lucide-react';
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
  userPermissions
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
    type: ''
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
  const handleInputChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value
    }));
  };
  const handleImageChange = e => {
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
        if (response && response.success) {
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
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.name || !formData.brand || !formData.image) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Auto-generate a simple description if none provided
    const description = formData.description || `A premium ${formData.gender.toLowerCase() === 'unisex' ? 'unisex' : formData.gender.toLowerCase() === 'female' ? 'feminine' : 'masculine'} 
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
      type: formData.type
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
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="px-6 pb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h2>
          <ProductForm formData={formData} setFormData={setFormData} isEditingProduct={isEditMode} isLoading={isLoading} uploadingImage={uploadingImage} handleInputChange={handleInputChange} handleImageChange={handleImageChange} handleGenerateImageLink={handleGenerateImageLink} resetForm={onClose} handleSubmit={handleSubmit} onCancel={onClose} />
        </div>
      </div>
    </div>;
};

// Similarly for CollectionFormModal (optional - implement if needed)
const CollectionFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialCollection = null,
  isEditMode = false,
  products
}) => {
  // Similar implementation as ProductFormModal
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="px-6 pb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {isEditMode ? 'Edit Collection' : 'Add New Collection'}
          </h2>
          <CollectionForm isEditingCollection={isEditMode} currentCollection={initialCollection} products={products} isLoading={false} onSubmit={onSubmit} onCancel={onClose} setIsAddingCollection={() => {}} />
        </div>
      </div>
    </div>;
};
const Products = () => {
  const {
    user
  } = useAuth();
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [genderFilter, setGenderFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

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
  const openEditProductModal = id => {
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
  const handleDeleteProduct = id => {
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
  const openEditCollectionModal = id => {
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
  const handleCollectionSubmit = async collectionData => {
    if (isEditingCollection && currentCollection) {
      await updateCollection(currentCollection.id, collectionData);
      toast.success("Collection updated successfully!");
    } else {
      await addCollection(collectionData);
      toast.success("Collection created successfully!");
    }
  };
  const handleDeleteCollection = id => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      deleteCollection(id);
      toast.success("Collection deleted successfully!");
    }
  };
  const handleToggleFeature = (id, featured) => {
    updateCollection(id, {
      featured: !featured
    });
    toast.success(`Collection ${featured ? 'removed from' : 'added to'} featured successfully!`);
  };

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGender = genderFilter === 'all' || product.gender.toLowerCase() === genderFilter.toLowerCase();
      return matchesSearch && matchesGender;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'stock':
          return b.stock - a.stock;
        default:
          return 0;
      }
    });
  }, [products, searchTerm, genderFilter, sortBy]);
  const filteredCollections = collections.filter(collection => collection.name.toLowerCase().includes(collectionSearchTerm.toLowerCase()));

  // Function to render stock status with appropriate styling
  const renderStockStatus = stock => {
    if (stock > 10) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">In Stock ({stock})</span>;
    } else if (stock > 0) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Low Stock ({stock})</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Out of Stock</span>;
    }
  };

  // Product cards grid component with updated UI
  const ProductCards = () => <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
      {filteredAndSortedProducts.length > 0 ? filteredAndSortedProducts.map(product => viewMode === 'grid' ? <div key={product.id} className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
              <div className="relative h-56 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300" onError={e => {
          e.target.src = '/images/placeholder-perfume.jpg';
        }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-center">
                  <button onClick={e => {
            e.stopPropagation();
            openEditProductModal(product.id);
          }} className="p-2 bg-white/90 hover:bg-purple-100 rounded-lg shadow-sm transition-colors">
                    <Edit size={16} className="text-purple-700" />
                  </button>
                  <button onClick={e => {
            e.stopPropagation();
            handleDeleteProduct(product.id);
          }} className="p-2 bg-white/90 hover:bg-red-100 rounded-lg shadow-sm transition-colors">
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100/80 text-purple-800 rounded-full backdrop-blur-sm">
                    {product.gender}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-purple-600 mb-1">{product.brand}</p>
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-1">{product.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-lg font-bold text-gray-900">₦{product.price.toLocaleString()}</div>
                    <div className="flex gap-2 items-center">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{product.size}</span>
                      {renderStockStatus(product.stock)}
                    </div>
                  </div>
                </div>
              </div>
            </div> : <div key={product.id} className="group flex bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100">
              <div className="relative h-32 w-32 sm:h-36 sm:w-36 flex-shrink-0 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300" onError={e => {
          e.target.src = '/images/placeholder-perfume.jpg';
        }} />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100/80 text-purple-800 rounded-full backdrop-blur-sm">
                    {product.gender}
                  </span>
                </div>
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">{product.brand}</p>
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1 mt-1">{product.description}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-2 items-center">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{product.size}</span>
                    {renderStockStatus(product.stock)}
                  </div>
                  <div className="text-lg font-bold text-gray-900">₦{product.price.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-2 p-2 border-l border-gray-100">
                <button onClick={() => openEditProductModal(product.id)} className="p-2 hover:bg-purple-100 rounded-lg transition-colors" title="Edit product">
                  <Edit size={16} className="text-purple-700" />
                </button>
                <button onClick={() => handleDeleteProduct(product.id)} className="p-2 hover:bg-red-100 rounded-lg transition-colors" title="Delete product">
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>) : <div className="col-span-full flex flex-col justify-center items-center py-16">
          <Sparkles size={48} className="text-purple-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium">No products found matching your search.</p>
          <p className="text-gray-400 mt-2">Try adjusting your filters or search term.</p>
        </div>}
    </div>;

  // Collection cards grid component
  const CollectionCards = () => <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {filteredCollections.length > 0 ? filteredCollections.map(collection => <div key={collection.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-purple-100">
            <div className="relative h-48 overflow-hidden">
              <img src={collection.image} alt={collection.name} className="w-full h-full object-cover" onError={e => {
          e.target.src = '/images/placeholder-collection.jpg';
        }} />
              <div className="absolute top-2 left-2 flex space-x-2">
                <button onClick={() => handleToggleFeature(collection.id, collection.featured)} className="p-2 bg-white/90 hover:bg-yellow-100 rounded-full shadow-sm transition-colors" title={collection.featured ? "Remove from featured" : "Add to featured"}>
                  {collection.featured ? <Star size={16} className="text-yellow-500 fill-yellow-500" /> : <StarOff size={16} className="text-gray-500" />}
                </button>
              </div>
              <div className="absolute top-2 right-2 flex space-x-2">
                <button onClick={() => openEditCollectionModal(collection.id)} className="p-2 bg-white/90 hover:bg-purple-100 rounded-full shadow-sm transition-colors">
                  <Edit size={16} className="text-purple-700" />
                </button>
                <button onClick={() => handleDeleteCollection(collection.id)} className="p-2 bg-white/90 hover:bg-red-100 rounded-full shadow-sm transition-colors">
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900 truncate">{collection.name}</h3>
                <div className="text-sm font-medium text-purple-700">{collection.products.length} Products</div>
              </div>
              {collection.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{collection.description}</p>}
              <div className="mt-3 flex overflow-x-auto gap-1 pb-1">
                {collection.products.slice(0, 5).map(product => <div key={product.id} className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden border border-gray-200">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" onError={e => {
              e.target.src = '/images/placeholder-perfume.jpg';
            }} />
                  </div>)}
                {collection.products.length > 5 && <div className="w-8 h-8 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-700">
                    +{collection.products.length - 5}
                  </div>}
              </div>
            </div>
          </div>) : <div className="col-span-full flex justify-center items-center h-48">
          <p className="text-gray-500 text-lg">No collections found matching your search.</p>
        </div>}
    </div>;
  return <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 pb-16">
      {/* Decorative gradient elements */}
      <div className="absolute top-1/4 left-10 w-32 h-32 rounded-full bg-[#f6e6fa]/30 blur-3xl"></div>
      <div className="absolute bottom-1/3 right-20 w-40 h-40 rounded-full bg-[#9c6da5]/20 blur-3xl"></div>
      <div className="absolute top-2/3 left-1/4 w-24 h-24 rounded-full bg-[#f6e6fa]/40 blur-2xl"></div>
      
      <div className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
        <p className="text-gray-500 mb-8">Manage your products and collections from one place</p>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button onClick={() => setActiveTab('products')} className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'products' ? 'text-purple-700 border-b-2 border-purple-500 bg-purple-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'}`}>
            Products
          </button>
          <button onClick={() => setActiveTab('collections')} className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'collections' ? 'text-purple-700 border-b-2 border-purple-500 bg-purple-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'}`}>
            Collections
          </button>
        </div>
        
        {/* Products Tab Content */}
        {activeTab === 'products' && <div>
            {/* Top Controls Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <button onClick={openAddProductModal} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                <Plus size={18} />
                Add Product
              </button>
              
              <div className="flex flex-wrap gap-3 items-center">
                {/* View Mode Toggle */}
                <div className="flex rounded-lg overflow-hidden border border-gray-200">
                  <button onClick={() => setViewMode('grid')} className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-purple-100 text-purple-700 font-medium' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                    Grid View
                  </button>
                  <button onClick={() => setViewMode('list')} className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-purple-100 text-purple-700 font-medium' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                    List View
                  </button>
                </div>
                
                {/* Filter Button */}
                <div className="relative">
                  <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className="flex items-center gap-2 border border-gray-200 hover:border-purple-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
                    <Filter size={16} />
                    Filter & Sort
                  </button>
                  
                  {isFilterMenuOpen && <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 z-10 p-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm">
                          <option value="all">All Genders</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="unisex">Unisex</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm">
                          <option value="name">Name (A-Z)</option>
                          <option value="price-asc">Price (Low to High)</option>
                          <option value="price-desc">Price (High to Low)</option>
                          <option value="stock">Stock (High to Low)</option>
                        </select>
                      </div>
                    </div>}
                </div>
                
                {/* Search Products */}
                <div className="relative w-full md:w-64">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
                </div>
              </div>
            </div>
            
            {/* Products Summary */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{filteredAndSortedProducts.length}</span> of <span className="font-medium text-gray-900">{products.length}</span> products
                {genderFilter !== 'all' && <span> filtered by <span className="font-medium text-purple-700">{genderFilter}</span></span>}
                {searchTerm && <span> matching "<span className="font-medium text-purple-700">{searchTerm}</span>"</span>}
              </div>
            </div>
            
            {/* Product Cards */}
            {isLoading ? <div className="flex flex-col justify-center items-center py-20">
                <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full mb-4" />
                <p className="text-purple-600 font-medium">Loading products...</p>
              </div> : <ProductCards />}
          </div>}
        
        {/* Collections Tab Content */}
        {activeTab === 'collections' && <div>
            {/* Add Collection Button */}
            <div className="flex justify-between items-center mb-6">
              <button onClick={openAddCollectionModal} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                <Plus size={18} />
                Add Collection
              </button>
              
              {/* Search Collections */}
              <div className="relative w-64">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search collections..." value={collectionSearchTerm} onChange={e => setCollectionSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" />
              </div>
            </div>
            
            {/* Collection Cards */}
            {isLoading ? <div className="flex justify-center items-center h-64">
                <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full" />
              </div> : <CollectionCards />}
          </div>}
        
        {/* Modals - rendered conditionally but isolated from parent component */}
        <ProductFormModal isOpen={isProductModalOpen} onClose={closeProductModal} onSubmit={handleProductSubmit} initialProduct={currentProduct} isEditMode={isEditingProduct} uploadProductImage={uploadProductImage} userPermissions={user.permissions} />
        
        <CollectionFormModal isOpen={isCollectionModalOpen} onClose={closeCollectionModal} onSubmit={handleCollectionSubmit} initialCollection={currentCollection} isEditMode={isEditingCollection} products={products} />
      </div>
    </div>;
};
export default Products;