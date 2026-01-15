import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const JoinAsArtist = () => {
  const [formData, setFormData] = useState({
    artistName: '',
    penName: '',
    email: '',
    bio: '',
    portfolioLink: '',
    website: '',
    instagram: '',
    twitter: '',
    facebook: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (['website', 'instagram', 'twitter', 'facebook'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        artistName: formData.artistName,
        penName: formData.penName,
        email: formData.email,
        bio: formData.bio,
        portfolioLink: formData.portfolioLink,
        socialLinks: {
          website: formData.website,
          instagram: formData.instagram,
          twitter: formData.twitter,
          facebook: formData.facebook,
        }
      };

      const res = await axios.post('/api/artist-requests', payload);
      toast.success(res.data.message || 'Request submitted successfully!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Sell Your Art on Artopus</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Join our community of talented artists. Fill out the form below to request an artist profile. 
            Once approved, we'll create your profile and you can approach us to add your masterpieces.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Artist Full Name *</label>
                <input
                  type="text"
                  name="artistName"
                  value={formData.artistName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-logo-purple outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pen Name (if any)</label>
                <input
                  type="text"
                  name="penName"
                  value={formData.penName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-logo-purple outline-none"
                  placeholder="Artist Name"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-logo-purple outline-none"
                  placeholder="artist@example.com"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Portfolio Link (Google Drive, Behance, etc.)</label>
                <input
                  type="url"
                  name="portfolioLink"
                  value={formData.portfolioLink}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-logo-purple outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Short Bio *</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-logo-purple outline-none"
                placeholder="Tell us about yourself and your art style..."
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Social Media Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  placeholder="Website URL"
                />
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  placeholder="Instagram Handle"
                />
                <input
                  type="text"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  placeholder="Twitter Handle"
                />
                <input
                  type="text"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                  placeholder="Facebook URL"
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 rounded-xl font-bold text-white bg-logo-purple hover:bg-logo-purple/90 transition-all shadow-lg shadow-logo-purple/20 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinAsArtist;
