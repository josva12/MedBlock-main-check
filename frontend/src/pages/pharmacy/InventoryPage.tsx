import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { 
  fetchInventory, 
  createInventoryItem, 
  updateInventoryStock,
  deleteInventoryItem 
} from '../../features/pharmacy/pharmacySlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface InventoryItem {
  _id: string;
  name: string;
  genericName?: string;
  brandName?: string;
  medicationType: string;
  category: string;
  strength: {
    value: number;
    unit: string;
  };
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  costPrice: number;
  sellingPrice: number;
  batchNumber: string;
  expirationDate: string;
  status: string;
  supplier: {
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
  };
  requiresPrescription: boolean;
  controlledSubstance: boolean;
}

const InventoryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { inventory, isLoading, error } = useAppSelector((state) => state.pharmacy);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchInventory({ page: currentPage, limit: itemsPerPage }));
  }, [dispatch, currentPage, itemsPerPage]);

  const handleSearch = () => {
    dispatch(fetchInventory({ 
      page: 1, 
      limit: itemsPerPage, 
      search: searchTerm,
      category: categoryFilter,
      status: statusFilter
    }));
    setCurrentPage(1);
  };

  const handleAddItem = async (itemData: Partial<InventoryItem>) => {
    try {
      await dispatch(createInventoryItem(itemData)).unwrap();
      setShowAddModal(false);
      dispatch(fetchInventory({ page: currentPage, limit: itemsPerPage }));
    } catch (error) {
      console.error('Failed to add inventory item:', error);
    }
  };

  const handleUpdateStock = async (itemId: string, quantity: number, type: 'add' | 'subtract') => {
    try {
      await dispatch(updateInventoryStock({ itemId, quantity, type })).unwrap();
      dispatch(fetchInventory({ page: currentPage, limit: itemsPerPage }));
    } catch (error) {
      console.error('Failed to update stock:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await dispatch(deleteInventoryItem(itemId)).unwrap();
        dispatch(fetchInventory({ page: currentPage, limit: itemsPerPage }));
      } catch (error) {
        console.error('Failed to delete inventory item:', error);
      }
    }
  };

  const getStockStatusColor = (item: InventoryItem) => {
    if (item.currentStock === 0) return 'text-red-600 bg-red-100';
    if (item.currentStock <= item.minimumStock) return 'text-orange-600 bg-orange-100';
    if (item.currentStock >= item.maximumStock) return 'text-blue-600 bg-blue-100';
    return 'text-green-600 bg-green-100';
  };

  const getStockStatusText = (item: InventoryItem) => {
    if (item.currentStock === 0) return 'Out of Stock';
    if (item.currentStock <= item.minimumStock) return 'Low Stock';
    if (item.currentStock >= item.maximumStock) return 'Overstocked';
    return 'Normal';
  };

  const getExpirationStatus = (expirationDate: string) => {
    const today = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = expiration.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Expired', color: 'text-red-600 bg-red-100' };
    if (diffDays <= 30) return { text: 'Expiring Soon', color: 'text-orange-600 bg-orange-100' };
    if (diffDays <= 90) return { text: 'Expiring Soon', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'Valid', color: 'text-green-600 bg-green-100' };
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.genericName && item.genericName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  if (isLoading) return <LoadingSpinner size="large" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pharmacy Inventory</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or generic name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="antibiotic">Antibiotic</option>
              <option value="analgesic">Analgesic</option>
              <option value="antihypertensive">Antihypertensive</option>
              <option value="diabetic">Diabetic</option>
              <option value="cardiac">Cardiac</option>
              <option value="respiratory">Respiratory</option>
              <option value="gastrointestinal">Gastrointestinal</option>
              <option value="neurological">Neurological</option>
              <option value="psychiatric">Psychiatric</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="discontinued">Discontinued</option>
              <option value="recalled">Recalled</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Medication
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Expiration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedInventory.map((item) => {
                const expirationStatus = getExpirationStatus(item.expirationDate);
                return (
                  <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </div>
                        {item.genericName && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.genericName}
                          </div>
                        )}
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.strength.value} {item.strength.unit} • {item.medicationType}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {item.category}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {item.currentStock} units
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Min: {item.minimumStock} • Max: {item.maximumStock}
                      </div>
                      <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(item)}`}>
                        {getStockStatusText(item)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        ${item.sellingPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Cost: ${item.costPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Batch: {item.batchNumber}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(item.expirationDate).toLocaleDateString()}
                      </div>
                      <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${expirationStatus.color}`}>
                        {expirationStatus.text}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white capitalize">
                        {item.status.replace('_', ' ')}
                      </div>
                      {item.requiresPrescription && (
                        <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          Rx Required
                        </div>
                      )}
                      {item.controlledSubstance && (
                        <div className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                          Controlled
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredInventory.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredInventory.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal would go here */}
      {/* For now, we'll implement the basic functionality */}
    </div>
  );
};

export default InventoryPage; 