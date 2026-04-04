import { useState, useEffect } from 'react';
import axios from 'axios';
import { CloudUpload, RefreshCw, AlertCircle, PackageSearch, ShieldCheck, Edit2, Trash2, Plus } from 'lucide-react';
import { Button, Badge } from '../components/ui';
import { Modal } from '../components/Modal';
import collection1Data from '../data/collection-1.json';

interface Product {
  sku: string;
  name: string;
  price: number;
  inStock: boolean;
  image: string;
}

interface Collection {
  id: string;
  name: string;
  items: Product[];
}

const GITHUB_CONFIG = {
  owner: 'exoticdx',
  repo: 'RC-Website-Whatsapp-Bot',
  path: 'src/data/collection-1.json',
  branch: 'main'
};

const AdminPage = () => {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [draftItems, setDraftItems] = useState<Product[] | null>(null);
  const [isPushing, setIsPushing] = useState(false);
  const [githubPat, setGithubPat] = useState(() => localStorage.getItem('gh_pat') || '');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  const [modalState, setModalState] = useState<{ isOpen: boolean; product: Product | null; isNew: boolean }>({
    isOpen: false,
    product: null,
    isNew: false
  });

  useEffect(() => {
    // In a real app, this might fetch from the GitHub API directly to ensure it's the absolute latest
    setCollection(collection1Data);
    setDraftItems(JSON.parse(JSON.stringify(collection1Data.items))); // deep copy
  }, []);

  const hasChanges = JSON.stringify(collection?.items) !== JSON.stringify(draftItems);

  const handleToggleStock = (sku: string) => {
    setDraftItems(prev => prev ? prev.map(item => item.sku === sku ? { ...item, inStock: !item.inStock } : item) : null);
  };

  const handleDelete = (sku: string) => {
    if (confirm(`Are you sure you want to delete SKU ${sku}?`)) {
      setDraftItems(prev => prev ? prev.filter(item => item.sku !== sku) : null);
    }
  };

  const handleOpenAdd = () => {
    setModalState({
      isOpen: true,
      product: { sku: '', name: '', price: 0, inStock: true, image: 'v1234567/placeholder' },
      isNew: true
    });
  };

  const handleOpenEdit = (product: Product) => {
    setModalState({
      isOpen: true,
      product: { ...product },
      isNew: false
    });
  };

  const handleSaveModal = () => {
    if (!modalState.product || !modalState.product.sku || !modalState.product.name) {
      alert("SKU and Name are required.");
      return;
    }

    setDraftItems(prev => {
      if (!prev) return null;
      if (modalState.isNew) {
        // Prevent duplicate SKU
        if (prev.find(i => i.sku === modalState.product!.sku)) {
          alert("An item with this SKU already exists.");
          return prev;
        }
        return [...prev, modalState.product!];
      } else {
        return prev.map(item => item.sku === modalState.product!.sku ? modalState.product! : item);
      }
    });

    setModalState({ isOpen: false, product: null, isNew: false });
  };

  const handlePushToLive = async () => {
    if (!githubPat) {
      setStatus({ type: 'error', message: 'Please provide a GitHub Personal Access Token' });
      return;
    }

    setIsPushing(true);
    setStatus({ type: 'info', message: 'Pushing changes to GitHub...' });

    try {
      const getFileRes = await axios.get(
        `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}?ref=${GITHUB_CONFIG.branch}`,
        { headers: { Authorization: `token ${githubPat}` } }
      );

      const { sha, content } = getFileRes.data;
      const currentJson = JSON.parse(atob(content));

      const updatedJson = { ...currentJson, items: draftItems };

      await axios.put(
        `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`,
        {
          message: `Admin: Updated inventory catalog`,
          content: btoa(JSON.stringify(updatedJson, null, 2)),
          sha,
          branch: GITHUB_CONFIG.branch
        },
        { headers: { Authorization: `token ${githubPat}` } }
      );

      setStatus({ type: 'success', message: 'Successfully pushed to live! Deployment triggered.' });
      setCollection(updatedJson);
      setDraftItems(JSON.parse(JSON.stringify(updatedJson.items)));
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: `Failed to push: ${err.response?.data?.message || err.message}` });
    } finally {
      setIsPushing(false);
    }
  };

  const savePat = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGithubPat(val);
    localStorage.setItem('gh_pat', val);
  };

  if (!collection || !draftItems) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] pb-32">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="font-bold text-zinc-900 tracking-tight">Ops Dashboard</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group hidden sm:block">
              <input
                type="password"
                placeholder="GitHub PAT"
                value={githubPat}
                onChange={savePat}
                className="px-4 py-2 border border-zinc-200 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all bg-zinc-50 focus:bg-white"
              />
            </div>
            <Button 
              onClick={handlePushToLive} 
              disabled={!hasChanges || isPushing}
              className="flex items-center gap-2 whitespace-nowrap shadow-sm"
            >
              {isPushing ? <RefreshCw size={16} className="animate-spin" /> : <CloudUpload size={16} />}
              Push to Live
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 lg:px-6">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Inventory Management</h1>
            <p className="text-zinc-500">Manage products and stock levels for <strong className="text-zinc-700">{collection.name}</strong></p>
          </div>
          <Button onClick={handleOpenAdd} className="flex items-center gap-2">
            <Plus size={18} />
            Add New Product
          </Button>
        </header>

        {status && (
          <div className={`mb-8 p-4 rounded-xl flex items-start gap-3 border shadow-sm ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 
            status.type === 'error' ? 'bg-red-50 text-red-900 border-red-200' : 
            'bg-blue-50 text-blue-900 border-blue-200'
          }`}>
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}

        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-200">
                  <th className="px-6 py-4 font-semibold text-xs text-zinc-500 uppercase tracking-wider">Product Info</th>
                  <th className="px-6 py-4 font-semibold text-xs text-zinc-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 font-semibold text-xs text-zinc-500 uppercase tracking-wider text-center">Live Status</th>
                  <th className="px-6 py-4 font-semibold text-xs text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {draftItems.map(item => {
                  const originalItem = collection.items.find(i => i.sku === item.sku);
                  const isDirty = !originalItem || JSON.stringify(originalItem) !== JSON.stringify(item);

                  return (
                    <tr key={item.sku} className={`transition-colors hover:bg-zinc-50/50 ${isDirty ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center border border-zinc-200/60 overflow-hidden shrink-0">
                            <PackageSearch size={20} className="text-zinc-400" />
                          </div>
                          <div>
                            <span className="font-bold text-zinc-900 block leading-tight">{item.name}</span>
                            <span className="text-sm text-zinc-500">₹{item.price}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 bg-zinc-100 text-zinc-600 rounded-md text-xs font-mono border border-zinc-200">
                          {item.sku}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={item.inStock ? 'success' : 'danger'}>
                          {item.inStock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant={item.inStock ? 'outline' : 'primary'}
                            size="sm"
                            onClick={() => handleToggleStock(item.sku)}
                            className="mr-2"
                          >
                            {item.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Edit2 size={18} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.sku)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {draftItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                      No products found. Add one to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-zinc-500 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm gap-4">
          <div className="flex items-center gap-2">
            {hasChanges ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-700 font-medium">You have unsaved changes</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>All items are synchronized with the live catalog.</span>
              </>
            )}
          </div>
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Changes require a push to live</p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, product: null, isNew: false })}
        title={modalState.isNew ? "Add New Product" : "Edit Product"}
        onConfirm={handleSaveModal}
        confirmText="Save to Draft"
      >
        {modalState.product && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">SKU</label>
              <input 
                type="text" 
                value={modalState.product.sku} 
                onChange={e => setModalState(prev => ({ ...prev, product: { ...prev.product!, sku: e.target.value } }))}
                disabled={!modalState.isNew}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none disabled:bg-zinc-100 disabled:text-zinc-500"
                placeholder="e.g., S26-004"
              />
              {!modalState.isNew && <p className="text-xs text-zinc-500 mt-1">SKU cannot be changed after creation.</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Product Name</label>
              <input 
                type="text" 
                value={modalState.product.name} 
                onChange={e => setModalState(prev => ({ ...prev, product: { ...prev.product!, name: e.target.value } }))}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none"
                placeholder="e.g., Summer Hat"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Price (₹)</label>
              <input 
                type="number" 
                value={modalState.product.price} 
                onChange={e => setModalState(prev => ({ ...prev, product: { ...prev.product!, price: parseInt(e.target.value) || 0 } }))}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Cloudinary Image ID</label>
              <input 
                type="text" 
                value={modalState.product.image} 
                onChange={e => setModalState(prev => ({ ...prev, product: { ...prev.product!, image: e.target.value } }))}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none"
                placeholder="e.g., v1234567/my-image"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="inStockCheck"
                checked={modalState.product.inStock} 
                onChange={e => setModalState(prev => ({ ...prev, product: { ...prev.product!, inStock: e.target.checked } }))}
                className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
              />
              <label htmlFor="inStockCheck" className="text-sm font-medium text-zinc-700 cursor-pointer">
                Currently In Stock
              </label>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPage;
