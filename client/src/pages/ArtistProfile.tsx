import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

interface Artist {
  _id: string;
  artistName: string;
  penName?: string;
  bio?: string;
  profileImage?: string;
  socialLinks?: {
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  dateOfJoining: string;
}

interface Product {
  _id: string;
  title: string;
  price: number;
  imageUrl: string;
  type: string;
  artistId: string;
  artistName: string;
  medium?: string;
  dimensions?: string;
  year?: string;
}

const ArtistProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        const [artistRes, productsRes] = await Promise.all([
          axios.get(`/api/artists/${id}`),
          axios.get(`/api/products?artistId=${id}`) // Assuming backend supports filtering by artistId
        ]);
        setArtist(artistRes.data);
        // If backend doesn't filter, we filter here
        const filteredProducts = productsRes.data.filter((p: Product) => p.artistId === id);
        setProducts(filteredProducts);
      } catch (err) {
        console.error('Failed to fetch artist data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtistData();
  }, [id]);

  if (loading) return <div className="p-20 text-center">Loading Artist Profile...</div>;
  if (!artist) return <div className="p-20 text-center text-red-500 font-bold text-2xl">Artist Not Found</div>;

  return (
    <div className="artist-profile-page min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header / Hero */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-700 flex-shrink-0">
              {artist.profileImage ? (
                <img src={artist.profileImage} alt={artist.artistName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-4xl font-bold">{artist.artistName.charAt(0)}</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-2">
                {artist.artistName}
              </h1>
              {artist.penName && (
                <p className="text-xl text-logo-purple font-bold mb-4 italic">
                  aka "{artist.penName}"
                </p>
              )}
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mb-8 leading-relaxed">
                {artist.bio || "No bio available for this artist yet."}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {artist.socialLinks?.instagram && (
                  <a href={artist.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-btn">
                    Instagram
                  </a>
                )}
                {artist.socialLinks?.twitter && (
                  <a href={artist.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-btn">
                    Twitter
                  </a>
                )}
                {artist.socialLinks?.website && (
                  <a href={artist.socialLinks.website} target="_blank" rel="noopener noreferrer" className="social-btn">
                    Website
                  </a>
                )}
              </div>
            </div>
            
            <div className="bg-logo-purple/5 p-8 rounded-3xl border border-logo-purple/10 text-center min-w-[200px]">
              <div className="text-4xl font-black text-logo-purple mb-1">{products.length}</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Artworks</div>
              <div className="mt-4 pt-4 border-t border-logo-purple/10">
                <div className="text-xs text-gray-400">Joined</div>
                <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {new Date(artist.dateOfJoining).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-12 flex items-center gap-4">
          Artist Portfolio
          <div className="h-1 flex-1 bg-gray-100 dark:bg-gray-800"></div>
        </h2>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 text-lg">This artist hasn't published any artworks yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistProfile;
