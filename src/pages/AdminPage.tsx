import { useState, useEffect } from 'react';
import axios from 'axios';
import { CloudUpload, RefreshCw, AlertCircle, PackageSearch, ShieldCheck } from 'lucide-react';
import { Button, Badge } from '../components/ui';
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
  owner: 'YOUR_GITHUB_USERNAME',
  repo: 'YOUR_REPO_NAME',
  path: 'src/data/collection-1.json',
  branch: 'main'
};

const AdminPage = () => {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [localChanges, setLocalChanges] = useState<Record<string, boolean>>({});
  const [isPushing, setIsPushing] = useState(false);
  const [githubPat, setGithubPat] = useState(() => localStorage.getItem('gh_pat') || '');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);

  useEffect(() => {
    setCollection(collection1Data);
  }, []);

  const handleToggleStock = (sku: string, currentStock: boolean) => {
    setLocalChanges(prev => ({
      ...prev,
      [sku]: !((sku in prev) ? prev[sku] : currentStock)
    }));
  };

  const hasChanges = Object.keys(localChanges).length > 0;

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
        {
          headers: { Authorization: `token ${githubPat}` }
        }
      );

      const { sha, content } = getFileRes.data;
      const currentJson = JSON.parse(atob(content));

      const updatedItems = currentJson.items.map((item: Product) => ({
        ...item,
        inStock: item.sku in localChanges ? localChanges[item.sku] : item.inStock
      }));

      const updatedJson = { ...currentJson, items: updatedItems };

      await axios.put(
        `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`,
        {
          message: `Admin: Update stock status for ${Object.keys(localChanges).join(', ')}`,
          content: btoa(JSON.stringify(updatedJson, null, 2)),
          sha,
          branch: GITHUB_CONFIG.branch
        },
        {
          headers: { Authorization: `token ${githubPat}` }
        }
      );

      setStatus({ type: 'success', message: 'Successfully pushed to live! Deployment triggered.' });
      setLocalChanges({});
      setCollection(updatedJson);
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

  if (!collection) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] pb-32">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-30">
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
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Inventory Management</h1>
          <p className="text-zinc-500">Quickly toggle stock levels for <strong className="text-zinc-700">{collection.name}</strong></p>
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
                  <th className="px-6 py-4 font-semibold text-xs text-zinc-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {collection.items.map(item => {
                  const currentStock = item.sku in localChanges ? localChanges[item.sku] : item.inStock;
                  const isDirty = item.sku in localChanges;

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
                        <Badge variant={currentStock ? 'success' : 'danger'}>
                          {currentStock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant={currentStock ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => handleToggleStock(item.sku, item.inStock)}
                        >
                          {currentStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-zinc-500 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm gap-4">
          <div className="flex items-center gap-2">
            {hasChanges ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-700 font-medium">{Object.keys(localChanges).length} unsaved changes</span>
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
    </div>
  );
};

export default AdminPage;
