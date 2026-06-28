import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';
import { getOptimizedImageUrl } from '../utils/image';
import { Save, X, CreditCard as Edit3, Upload, Loader as Loader2 } from 'lucide-react';

interface Artist {
  _id: string;
  artistName: string;
  penName?: string;
  email: string;
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
  stockQuantity?: number;
  artistId: string;
  artistName: string;
  medium?: string;
  dimensions?: string;
  year?: string;
}

const ArtistProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const auth = useContext(AuthContext);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    artistName: '',
    penName: '',
    bio: '',
    profileImage: '',
    socialLinks: {
      website: '',
      instagram: '',
      twitter: '',
      facebook: '',
    },
  });

  const isOwnProfile = auth?.user?.role === 'artist' && auth?.user?.id === id;

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [artistRes, productsRes] = await Promise.all([
          axios.get(`/api/artists/${id}`),
          axios.get(`/api/products?artistId=${id}`),
        ]);
        setArtist(artistRes.data);
        setFormData({
          artistName: artistRes.data.artistName || '',
          penName: artistRes.data.penName || '',
          bio: artistRes.data.bio || '',
          profileImage: artistRes.data.profileImage || '',
          socialLinks: {
            website: artistRes.data.socialLinks?.website || '',
            instagram: artistRes.data.socialLinks?.instagram || '',
            twitter: artistRes.data.socialLinks?.twitter || '',
            facebook: artistRes.data.socialLinks?.facebook || '',
          },
        });
        const filteredProducts = productsRes.data.filter((p: Product) => p.artistId === id || (typeof p.artistId === 'object' && p.artistId !== null && '_id' in p.artistId && (p.artistId as { _id: string })._id === id));
        setProducts(filteredProducts);
      } catch (err) {
        console.error('Failed to fetch artist data:', err);
        setError('Failed to load artist profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchArtistData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const socialField = name.replace('social.', '');
      setFormData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const sigRes = await axios.get('/api/uploads/signature');
      const { signature, timestamp, apiKey, cloudName } = sigRes.data;

      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('signature', signature);
      uploadData.append('timestamp', timestamp.toString());
      uploadData.append('api_key', apiKey);
      uploadData.append('folder', 'artopus/artists');

      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        uploadData
      );

      setFormData((prev) => ({ ...prev, profileImage: uploadRes.data.secure_url }));
      toast.success('Profile image uploaded!');
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwnProfile) return;

    try {
      setSaving(true);
      setError(null);
      const res = await axios.put('/api/artist-portal/profile', formData);
      setArtist(res.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    if (!artist) return;
    setFormData({
      artistName: artist.artistName || '',
      penName: artist.penName || '',
      bio: artist.bio || '',
      profileImage: artist.profileImage || '',
      socialLinks: {
        website: artist.socialLinks?.website || '',
        instagram: artist.socialLinks?.instagram || '',
        twitter: artist.socialLinks?.twitter || '',
        facebook: artist.socialLinks?.facebook || '',
      },
    });
    setIsEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-logo-purple/30 border-t-logo-purple rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading Artist Profile...</p>
      </div>
    );
  }

  if (error && !artist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-red-500 font-bold text-xl mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
      </div>
    );
  }

  if (!artist) {
    return <div className="p-20 text-center text-red-500 font-bold text-2xl">Artist Not Found</div>;
  }

  return (
    <div className="artist-profile-page min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header / Hero */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {isEditing && isOwnProfile ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col md:flex-row items-start gap-12">
                {/* Profile Image Upload Section */}
                <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-700 flex-shrink-0 relative group">
                  {formData.profileImage ? (
                    <img src={getOptimizedImageUrl(formData.profileImage, 'f_auto,q_auto,c_fill,w_800')} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl font-bold">{formData.artistName?.charAt(0) || 'A'}</span>
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <Upload className="text-white" size={32} />
                  </label>
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Artist Name *</label>
                    <input
                      type="text"
                      name="artistName"
                      value={formData.artistName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-logo-purple focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Pen Name</label>
                    <input
                      type="text"
                      name="penName"
                      value={formData.penName}
                      onChange={handleInputChange}
                      placeholder="Optional display name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-logo-purple focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Email - READ ONLY */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={artist.email}
                      readOnly
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed for security reasons</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Tell visitors about yourself and your art..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-logo-purple focus:border-transparent outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Social Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Website</label>
                      <input
                        type="url"
                        name="social.website"
                        value={formData.socialLinks.website}
                        onChange={handleInputChange}
                        placeholder="https://your-website.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-logo-purple focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Instagram</label>
                      <input
                        type="text"
                        name="social.instagram"
                        value={formData.socialLinks.instagram}
                        onChange={handleInputChange}
                        placeholder="https://instagram.com/username"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-logo-purple focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Twitter</label>
                      <input
                        type="text"
                        name="social.twitter"
                        value={formData.socialLinks.twitter}
                        onChange={handleInputChange}
                        placeholder="https://twitter.com/username"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-logo-purple focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Facebook</label>
                      <input
                        type="text"
                        name="social.facebook"
                        value={formData.socialLinks.facebook}
                        onChange={handleInputChange}
                        placeholder="https://facebook.com/username"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-logo-purple focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-logo-purple text-white rounded-xl font-bold hover:bg-logo-purple/90 transition-all disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                {artist.profileImage ? (
                  <img src={getOptimizedImageUrl(artist.profileImage, 'f_auto,q_auto,c_fill,w_800')} alt={artist.artistName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-4xl font-bold">{artist.artistName.charAt(0)}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                  <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white">
                    {artist.artistName}
                  </h1>
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="Edit Profile"
                    >
                      <Edit3 size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                  )}
                </div>
                {artist.penName && (
                  <p className="text-xl text-logo-purple font-bold mb-4 italic">
                    aka "{artist.penName}"
                  </p>
                )}
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mb-8 leading-relaxed">
                  {artist.bio || "No bio available for this artist yet."}
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  {artist.socialLinks?.website && (
                    <a href={artist.socialLinks.website} target="_blank" rel="noopener noreferrer" className="social-btn">
                      Website
                    </a>
                  )}
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
                  {artist.socialLinks?.facebook && (
                    <a href={artist.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-btn">
                      Facebook
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
          )}
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
