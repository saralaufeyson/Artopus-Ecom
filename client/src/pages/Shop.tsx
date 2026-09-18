import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

interface Product { _id: string; title: string; price: number; imageUrl: string; type: string; category: string; stockQuantity?: number; artistId: string; artistName: string; variants?: { category: string; size?: string; price: number }[]; }
interface Pagination { total: number; page: number; limit: number; pages: number; }
interface Facets { categories: string[]; artists: { value: string; label: string }[]; mediums: string[]; sizes: string[]; availability: string[]; }
type FilterKey = 'categories' | 'artists' | 'mediums' | 'sizes' | 'availability';
const emptyFacets: Facets = { categories: [], artists: [], mediums: [], sizes: [], availability: [] };
const listFromUrl = (value: string | null) => value ? value.split(',').filter(Boolean) : [];

const Shop: React.FC = () => {
  const [urlParams, setUrlParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [facets, setFacets] = useState<Facets>(emptyFacets);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 12, pages: 1 });
  const [search, setSearch] = useState(urlParams.get('q') || '');
  const [categories, setCategories] = useState(listFromUrl(urlParams.get('category')));
  const [artists, setArtists] = useState(listFromUrl(urlParams.get('artist')));
  const [mediums, setMediums] = useState(listFromUrl(urlParams.get('medium')));
  const [sizes, setSizes] = useState(listFromUrl(urlParams.get('size')));
  const [availability, setAvailability] = useState(listFromUrl(urlParams.get('availability')));
  const [minPrice, setMinPrice] = useState(urlParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(urlParams.get('maxPrice') || '');
  const [sort, setSort] = useState(urlParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(urlParams.get('page')) || 1);
  const [loading, setLoading] = useState(true);
  const [facetsLoading, setFacetsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const hasFilters = categories.length + artists.length + mediums.length + sizes.length + availability.length > 0 || Boolean(minPrice || maxPrice);
  const setters: Record<FilterKey, React.Dispatch<React.SetStateAction<string[]>>> = { categories: setCategories, artists: setArtists, mediums: setMediums, sizes: setSizes, availability: setAvailability };

  useEffect(() => {
    axios.get('/api/products/facets').then((response) => setFacets(response.data || emptyFacets)).catch((err) => console.error('Failed to load filters:', err)).finally(() => setFacetsLoading(false));
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const params: Record<string, string | number> = { page, limit: 12, sort };
        if (search.trim()) params.q = search.trim();
        if (categories.length) params.category = categories.join(',');
        if (artists.length) params.artist = artists.join(',');
        if (mediums.length) params.medium = mediums.join(',');
        if (sizes.length) params.size = sizes.join(',');
        if (availability.length) params.availability = availability.join(',');
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        const response = await axios.get('/api/products', { params });
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        setProducts(data);
        setPagination(Array.isArray(response.data) ? { total: data.length, page: 1, limit: 12, pages: 1 } : response.data.pagination);
        setUrlParams(params as Record<string, string>, { replace: true });
        setError(null);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again later.');
      } finally { setLoading(false); }
    };
    loadProducts();
  }, [availability, categories, artists, maxPrice, mediums, minPrice, page, search, setUrlParams, sizes, sort]);

  const clearAll = () => { setSearch(''); setCategories([]); setArtists([]); setMediums([]); setSizes([]); setAvailability([]); setMinPrice(''); setMaxPrice(''); setSort('newest'); setPage(1); };
  const toggle = (key: FilterKey, value: string) => { setters[key]((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]); setPage(1); };
  const remove = (key: FilterKey, value: string) => { setters[key]((current) => current.filter((item) => item !== value)); setPage(1); };

  const FilterGroup = ({ title, filterKey, values }: { title: string; filterKey: FilterKey; values: { value: string; label: string }[] }) => {
    const selected = { categories, artists, mediums, sizes, availability }[filterKey];
    return <section className="border-b border-gray-100 dark:border-border-dark pb-5 last:border-0"><h3 className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">{title}</h3><div className="space-y-1 max-h-48 overflow-y-auto">{values.map((item) => <label key={item.value} className="flex items-center gap-2.5 min-h-9 cursor-pointer text-sm text-gray-600 dark:text-gray-300"><input type="checkbox" checked={selected.includes(item.value)} onChange={() => toggle(filterKey, item.value)} className="h-4 w-4 accent-logo-purple" /><span className="truncate">{item.label}</span></label>)}</div></section>;
  };
  const filterContent = <div className="space-y-5"><FilterGroup title="Category" filterKey="categories" values={facets.categories.map((value) => ({ value, label: value }))} /><FilterGroup title="Artist" filterKey="artists" values={facets.artists} /><FilterGroup title="Medium" filterKey="mediums" values={facets.mediums.map((value) => ({ value, label: value }))} /><FilterGroup title="Size" filterKey="sizes" values={facets.sizes.map((value) => ({ value, label: value }))} /><FilterGroup title="Availability" filterKey="availability" values={facets.availability.map((value) => ({ value, label: value === 'sold-out' ? 'Sold out' : 'Available' }))} /><section><h3 className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Price Range</h3><div className="flex items-center gap-2"><input aria-label="Minimum price" type="number" min="0" placeholder="Min" value={minPrice} onChange={(event) => { setMinPrice(event.target.value); setPage(1); }} className="w-full min-w-0 rounded-lg border border-gray-200 dark:border-border-dark bg-gray-50 dark:bg-background-dark px-3 py-2.5 text-sm outline-none focus:border-logo-purple" /><span className="text-gray-400">-</span><input aria-label="Maximum price" type="number" min="0" placeholder="Max" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setPage(1); }} className="w-full min-w-0 rounded-lg border border-gray-200 dark:border-border-dark bg-gray-50 dark:bg-background-dark px-3 py-2.5 text-sm outline-none focus:border-logo-purple" /></div></section></div>;
  const chips = [...categories.map((value) => ({ key: 'categories' as FilterKey, value, label: value })), ...artists.map((value) => ({ key: 'artists' as FilterKey, value, label: facets.artists.find((artist) => artist.value === value)?.label || value })), ...mediums.map((value) => ({ key: 'mediums' as FilterKey, value, label: value })), ...sizes.map((value) => ({ key: 'sizes' as FilterKey, value, label: value })), ...availability.map((value) => ({ key: 'availability' as FilterKey, value, label: value === 'sold-out' ? 'Sold out' : 'Available' }))];

  return <div className="min-h-screen bg-background-light dark:bg-background-dark"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10"><div className="mb-7"><div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5"><div><p className="text-xs uppercase tracking-[0.2em] text-logo-purple font-bold mb-2">The collection</p><h1 className="text-3xl md:text-4xl mb-0">Find your next artwork</h1></div><label className="relative w-full md:w-80"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search artworks, artists, categories…" aria-label="Search artworks" className="w-full rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-background-card-dark py-3.5 pl-11 pr-10 text-sm shadow-sm outline-none focus:border-logo-purple focus:ring-2 focus:ring-logo-purple/10" />{search && <button type="button" aria-label="Clear search" onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-logo-purple"><X size={16} /></button>}</label></div><div className="flex items-center justify-between gap-3"><div className="flex flex-wrap gap-2">{chips.map((chip) => <button key={`${chip.key}-${chip.value}`} type="button" onClick={() => remove(chip.key, chip.value)} className="inline-flex items-center gap-1.5 rounded-full bg-logo-purple/10 px-3 py-1.5 text-xs font-semibold text-logo-purple">{chip.label}<X size={13} /></button>)}{(minPrice || maxPrice) && <button type="button" onClick={() => { setMinPrice(''); setMaxPrice(''); setPage(1); }} className="inline-flex items-center gap-1.5 rounded-full bg-logo-purple/10 px-3 py-1.5 text-xs font-semibold text-logo-purple">{minPrice || '0'} - {maxPrice || 'Any'}<X size={13} /></button>}</div><button type="button" onClick={() => setSheetOpen(true)} className="lg:hidden shrink-0 inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-border-dark px-3 py-2 text-sm font-semibold"><SlidersHorizontal size={16} /> Filters</button></div></div><div className="flex gap-8"><aside className="hidden lg:block w-64 shrink-0"><div className="sticky top-24 rounded-2xl border border-gray-100 dark:border-border-dark bg-white dark:bg-background-card-dark p-5"><div className="flex items-center justify-between mb-5"><h2 className="text-base mb-0">Filter by</h2>{hasFilters && <button type="button" onClick={clearAll} className="text-xs font-bold text-logo-purple">Clear All</button>}</div>{facetsLoading ? <div className="h-48 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" /> : filterContent}</div></aside><main className="min-w-0 flex-1"><div className="flex items-center justify-between mb-5"><p className="text-sm text-gray-500 mb-0">{loading ? 'Updating catalogue…' : `${pagination.total} artwork${pagination.total === 1 ? '' : 's'} found`}</p><select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="rounded-lg border border-gray-200 dark:border-border-dark bg-white dark:bg-background-card-dark px-3 py-2 text-xs font-semibold outline-none"><option value="newest">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="title_asc">Title</option></select></div>{loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1, 2, 3].map((item) => <div key={item} className="aspect-[4/5] animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />)}</div> : error ? <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-sm text-red-600">{error}<button type="button" onClick={() => window.location.reload()} className="block mx-auto mt-3 font-bold underline">Try Again</button></div> : products.length ? <><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div>{pagination.pages > 1 && <div className="flex justify-center items-center gap-2 mt-10"><button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-40">Previous</button><span className="text-xs text-gray-500">Page {page} of {pagination.pages}</span><button type="button" disabled={page === pagination.pages} onClick={() => setPage((value) => Math.min(pagination.pages, value + 1))} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-40">Next</button></div>}</> : <div className="py-20 text-center"><Search className="mx-auto mb-4 text-gray-300" size={34} /><h2 className="text-xl">No artworks found</h2><p className="text-sm">Try a different search or remove a filter.</p>{hasFilters && <button type="button" onClick={clearAll} className="font-bold text-logo-purple text-sm">Clear All</button>}</div>}</main></div></div>{sheetOpen && <div className="fixed inset-0 z-50 flex items-end bg-black/50 lg:hidden" onClick={() => setSheetOpen(false)}><div className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white dark:bg-background-card-dark p-5" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between mb-6"><h2 className="text-xl mb-0">Filters</h2><button type="button" aria-label="Close filters" onClick={() => setSheetOpen(false)} className="rounded-full p-2 text-gray-500"><X /></button></div>{facetsLoading ? <div className="h-56 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" /> : filterContent}<div className="sticky bottom-0 -mx-5 mt-6 flex gap-3 border-t border-gray-100 dark:border-border-dark bg-white dark:bg-background-card-dark p-5"><button type="button" onClick={clearAll} className="flex-1 rounded-xl border border-logo-purple px-4 py-3 text-sm font-bold text-logo-purple">Clear All</button><button type="button" onClick={() => setSheetOpen(false)} className="flex-1 rounded-xl bg-logo-purple px-4 py-3 text-sm font-bold text-white">Apply filters</button></div></div></div>}</div>;
};

export default Shop;
