import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import collectionsData from '../data/collections.json';
import { Card } from '../components/ui';
import { getCloudinaryUrl } from '../utils/cloudinary';

interface Collection {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
}

const HomePage = () => {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    setCollections(collectionsData);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-zinc-900 text-white rounded-b-[3rem] shadow-2xl">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-zinc-700/40 to-transparent blur-3xl" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-zinc-800/40 to-transparent blur-3xl" />
        </div>
        
        {/* Top Header / Logo Area */}
        <div className="relative z-10 flex items-center justify-center pt-10 pb-4 gap-4">
          <img src="/Logo.png" alt="RC Imitation Logo" className="w-16 h-16 object-contain rounded-full bg-zinc-800/50 p-2 shadow-lg backdrop-blur-sm" />
          <span className="text-3xl font-extrabold tracking-tight text-white">RC Imitation</span>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400">Our collection</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
            Access our premium product catalogs. Download high-resolution assets and restock seamlessly via WhatsApp.
          </p>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">Available Catalogs</h2>
          <span className="text-sm font-medium text-zinc-500">{collections.length} Collections</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-10">
          {collections.map(collection => (
            <Link key={collection.id} to={`/collection/${collection.id}`} className="group block outline-none">
              <Card className="h-full border-zinc-200/60 shadow-sm hover:shadow-xl hover:border-zinc-300/80 transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-zinc-900 group-focus-visible:ring-offset-4">
                <div className="aspect-[4/3] overflow-hidden relative bg-zinc-100">
                  <img
                    src={getCloudinaryUrl(collection.thumbnail, { width: 800, height: 600, crop: 'fill' })}
                    alt={collection.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-4 sm:p-8">
                  <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2 sm:mb-3">
                    <h2 className="text-base sm:text-2xl font-bold text-zinc-900 tracking-tight group-hover:text-blue-600 transition-colors line-clamp-2">{collection.name}</h2>
                    <div className="bg-zinc-100 p-1.5 sm:p-2 rounded-full text-zinc-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0">
                      <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-base text-zinc-500 leading-relaxed line-clamp-2">{collection.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
