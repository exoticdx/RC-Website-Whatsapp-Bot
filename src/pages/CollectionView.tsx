import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Download, ArrowLeft, Trash2, Check, PackageX } from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { Modal } from '../components/Modal';
import { useCart } from '../hooks/useCart';
import { getCloudinaryUrl } from '../utils/cloudinary';
import { generateWhatsAppLink, generateCollectionRequestLink } from '../utils/whatsapp';

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

const OPERATIONS_NUMBER = "918238443377";

const CollectionView = () => {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cart, addToCart, removeFromCart, totalItems } = useCart();

  useEffect(() => {
    import(`../data/${id}.json`)
      .then(data => setCollection(data.default))
      .catch(err => console.error("Collection not found", err));
  }, [id]);

  if (!collection) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
    </div>
  );

  const handleDownloadConfirm = () => {
    const link = generateCollectionRequestLink(collection.id, OPERATIONS_NUMBER);
    window.open(link, '_blank');
    setIsModalOpen(false);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const link = generateWhatsAppLink(cart, OPERATIONS_NUMBER);
    window.open(link, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-40">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 border-b border-zinc-200 pb-8">
          <div>
            <Link to="/" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-6 group">
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Collections
            </Link>
            <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">{collection.name}</h1>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 whitespace-nowrap bg-white"
            onClick={() => setIsModalOpen(true)}
          >
            <Download size={18} />
            Download Assets
          </Button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
          {collection.items.map(item => {
            const inCart = cart.find(c => c.sku === item.sku);
            
            return (
              <Card key={item.sku} className="flex flex-col group border-transparent hover:border-zinc-200 transition-all duration-300">
                <div className="aspect-[4/5] bg-zinc-100 overflow-hidden relative">
                  <img
                    src={getCloudinaryUrl(item.image, { width: 600, height: 750, crop: 'fill' })}
                    alt={item.name}
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${!item.inStock ? 'opacity-40 grayscale' : ''}`}
                  />
                  {!item.inStock && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/10 backdrop-blur-[2px]">
                      <PackageX className="text-zinc-500 mb-2 w-8 h-8 sm:w-10 sm:h-10" />
                      <Badge variant="danger" className="shadow-sm text-[10px] sm:text-xs">Out of Stock</Badge>
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-5 flex flex-col flex-grow bg-white">
                  <div className="mb-1 sm:mb-2">
                    <h3 className="font-bold text-sm sm:text-base text-zinc-900 leading-tight line-clamp-2">{item.name}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-500 font-mono mb-4 sm:mb-6">{item.sku}</p>
                  
                  <div className="mt-auto">
                    <Button 
                      className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm"
                      disabled={!item.inStock}
                      variant={inCart ? 'secondary' : 'primary'}
                      onClick={() => addToCart({ sku: item.sku, name: item.name, price: item.price })}
                    >
                      {inCart ? (
                        <>
                          <Check size={14} className="text-emerald-600 sm:w-[18px] sm:h-[18px]" />
                          <span>Added ({inCart.quantity})</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={14} className="sm:w-[18px] sm:h-[18px]" />
                          <span>Add to Order</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Floating Cart Drawer */}
        {totalItems > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl z-40 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white/80 backdrop-blur-xl border border-zinc-200/60 shadow-2xl rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar mask-edges">
                <Badge variant="default" className="bg-zinc-900 text-white whitespace-nowrap">
                  {totalItems} / 20 Items
                </Badge>
                <div className="flex gap-2">
                  {cart.map(item => (
                    <div key={item.sku} className="flex items-center bg-zinc-100 rounded-lg px-3 py-1.5 text-sm border border-zinc-200/60 group shrink-0 transition-all hover:bg-zinc-200/50">
                      <span className="font-medium text-zinc-700 mr-3">{item.sku} <span className="text-zinc-400 mx-1">×</span> {item.quantity}</span>
                      <button 
                        onClick={() => removeFromCart(item.sku)}
                        className="text-zinc-400 hover:text-red-500 transition-colors bg-white rounded-full p-0.5 shadow-sm"
                        aria-label="Remove item"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <Button 
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg shadow-[#25D366]/20 border-transparent whitespace-nowrap px-8"
                onClick={handleCheckout}
              >
                <ShoppingCart size={18} className="mr-2" />
                Checkout via WhatsApp
              </Button>
            </div>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Download High-Res Assets"
          onConfirm={handleDownloadConfirm}
          confirmText="Continue to WhatsApp"
        >
          <div className="space-y-4">
            <p className="text-zinc-600">You are about to request the full high-resolution image package for <strong>{collection.name}</strong>.</p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
              <Check size={20} className="shrink-0 text-amber-600" />
              <p className="text-sm font-medium">This will open WhatsApp. Ensure you are logged in to proceed with the download request.</p>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CollectionView;
