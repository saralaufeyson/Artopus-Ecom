import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

interface ProductSummary {
  _id: string;
  title: string;
  imageUrl: string;
  price: number;
  artistName?: string;
}

interface Collection {
  _id: string;
  name: string;
  isDefault: boolean;
  items: ProductSummary[];
}

interface CollectionsContextType {
  collections: Collection[];
  wishlistIds: Set<string>;
  refreshCollections: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<boolean>;
  createCollection: (name: string) => Promise<void>;
  addToCollection: (collectionId: string, productId: string) => Promise<void>;
  removeFromCollection: (collectionId: string, productId: string) => Promise<void>;
}

export const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined);

export const CollectionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useContext(AuthContext);
  const [collections, setCollections] = useState<Collection[]>([]);

  const refreshCollections = async () => {
    if (!auth?.user) {
      setCollections([]);
      return;
    }
    const res = await axios.get('/api/collections');
    setCollections(res.data);
  };

  useEffect(() => {
    refreshCollections().catch(() => setCollections([]));
  }, [auth?.user]);

  const wishlistIds = useMemo(() => {
    const wishlist = collections.find((collection) => collection.isDefault);
    return new Set((wishlist?.items || []).map((item) => item._id));
  }, [collections]);

  const toggleWishlist = async (productId: string) => {
    const res = await axios.post('/api/collections/wishlist/items', { productId });
    setCollections((prev) => prev.map((collection) => (collection.isDefault ? res.data.collection : collection)));
    return res.data.saved;
  };

  const createCollection = async (name: string) => {
    await axios.post('/api/collections', { name });
    await refreshCollections();
  };

  const addToCollection = async (collectionId: string, productId: string) => {
    await axios.post(`/api/collections/${collectionId}/items`, { productId });
    await refreshCollections();
  };

  const removeFromCollection = async (collectionId: string, productId: string) => {
    await axios.delete(`/api/collections/${collectionId}/items/${productId}`);
    await refreshCollections();
  };

  return (
    <CollectionsContext.Provider value={{ collections, wishlistIds, refreshCollections, toggleWishlist, createCollection, addToCollection, removeFromCollection }}>
      {children}
    </CollectionsContext.Provider>
  );
};

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (!context) throw new Error('useCollections must be used within a CollectionsProvider');
  return context;
}
