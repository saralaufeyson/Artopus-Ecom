import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';

interface FormData {
  title: string;
  description: string;
  category: string;
  type: string;
  original: boolean;
  originalPrice: string;
  printOnDemand: boolean;
  printPrice: string;
  outlineSketch: boolean;
  outlineSketchPrice: string;
  makingOfUrl: string;
  image: File | null;
  imageUrl: string;
}

const ArtistProductForm: React.FC = () => {
  const { user } = useContext(AuthContext)!;
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    type: 'original-artwork',
    original: false,
    originalPrice: '',
    printOnDemand: false,
    printPrice: '',
    outlineSketch: false,
    outlineSketchPrice: '',
    makingOfUrl: '',
    image: null,
    imageUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, image: file }));

    if (file) {
      setUploadingImage(true);
      try {
        // Get signature from server
        const sigRes = await axios.get('/api/uploads/signature');
        const { signature, timestamp, apiKey, cloudName } = sigRes.data;

        // Upload to Cloudinary
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('signature', signature);
        formDataUpload.append('timestamp', timestamp.toString());
        formDataUpload.append('api_key', apiKey);
        formDataUpload.append('folder', 'artopus/artist-submissions');

        const uploadRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formDataUpload
        );

        setFormData(prev => ({ ...prev, imageUrl: uploadRes.data.secure_url }));
        toast.success('Image uploaded successfully!');
      } catch (error) {
        console.error('Image upload failed:', error);
        toast.error('Failed to upload image');
        setFormData(prev => ({ ...prev, image: null }));
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const calculateEarnings = (price: string) => {
    const numPrice = parseFloat(price) || 0;
    return (numPrice * 0.82).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to submit a product');
      return;
    }

    if (!formData.imageUrl) {
      toast.error('Please upload an image');
      return;
    }

    if (!formData.original && !formData.printOnDemand && !formData.outlineSketch) {
      toast.error('Please select at least one option: Original, Print on Demand, or Outline Sketch');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        imageUrl: formData.imageUrl,
        videoUrl: formData.makingOfUrl,
      };

      // Set price to the first available option's price
      let price = '0';
      if (formData.original && formData.originalPrice) {
        price = formData.originalPrice;
      } else if (formData.printOnDemand && formData.printPrice) {
        price = formData.printPrice;
      } else if (formData.outlineSketch && formData.outlineSketchPrice) {
        price = formData.outlineSketchPrice;
      }
      submitData.price = price;

      if (formData.printOnDemand) {
        submitData.coloringPrice = formData.printPrice;
      }

      if (formData.outlineSketch) {
        submitData.outlineSketchPrice = formData.outlineSketchPrice;
      }

      await axios.post('/api/artist/products', submitData);

      toast.success('Product submitted successfully!');
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        type: 'original-artwork',
        original: false,
        originalPrice: '',
        printOnDemand: false,
        printPrice: '',
        outlineSketch: false,
        outlineSketchPrice: '',
        makingOfUrl: '',
        image: null,
        imageUrl: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Submit New Artwork</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        {/* Category and Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            >
              <option value="original-artwork">Original Artwork</option>
              <option value="merchandise">Merchandise</option>
            </select>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Options</h3>

          {/* Original */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="original"
              name="original"
              checked={formData.original}
              onChange={handleInputChange}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="original" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Original
            </label>
          </div>
          {formData.original && (
            <div className="ml-7 flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Original Price (₹) *
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                You Earn (82%): ₹{calculateEarnings(formData.originalPrice)}
              </div>
            </div>
          )}

          {/* Print on Demand */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="printOnDemand"
              name="printOnDemand"
              checked={formData.printOnDemand}
              onChange={handleInputChange}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="printOnDemand" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Print on Demand
            </label>
          </div>
          {formData.printOnDemand && (
            <div className="ml-7 flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Print Price (₹) *
                </label>
                <input
                  type="number"
                  name="printPrice"
                  value={formData.printPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                You Earn (82%): ₹{calculateEarnings(formData.printPrice)}
              </div>
            </div>
          )}

          {/* Outline Sketch */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="outlineSketch"
              name="outlineSketch"
              checked={formData.outlineSketch}
              onChange={handleInputChange}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="outlineSketch" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Outline Sketch
            </label>
          </div>
          {formData.outlineSketch && (
            <div className="ml-7 flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Outline Sketch Price (₹) *
                </label>
                <input
                  type="number"
                  name="outlineSketchPrice"
                  value={formData.outlineSketchPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                You Earn (82%): ₹{calculateEarnings(formData.outlineSketchPrice)}
              </div>
            </div>
          )}
        </div>

        {/* Making-of YouTube URL */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Making-of YouTube URL *
          </label>
          <input
            type="url"
            name="makingOfUrl"
            value={formData.makingOfUrl}
            onChange={handleInputChange}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Artwork Image *
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            required
          />
          {uploadingImage && <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">Uploading image...</p>}
          {formData.imageUrl && <p className="text-sm text-green-600 dark:text-green-400 mt-2">Image uploaded successfully!</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || uploadingImage}
          className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold rounded-xl transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Artwork'}
        </button>
      </form>
    </div>
  );
};

export default ArtistProductForm;