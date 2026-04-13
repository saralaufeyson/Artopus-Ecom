import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

type FormState = {
  title: string;
  description: string;
  category: string;
  year: string;
  makingOfVideoUrl: string;
  medium: string;
  dimensions: string;
  original: boolean;
  print: boolean;
  sketch: boolean;
  originalPrice: string;
  printPrice: string;
  sketchPrice: string;
  image: File | null;
};

type FormErrors = Partial<Record<
  'title' | 'description' | 'category' | 'makingOfVideoUrl' | 'medium' | 'dimensions' | 'originalPrice' | 'printPrice' | 'sketchPrice' | 'image' | 'variant',
  string
>>;

const initialState: FormState = {
  title: '',
  description: '',
  category: '',
  year: '',
  makingOfVideoUrl: '',
  medium: '',
  dimensions: '',
  original: false,
  print: false,
  sketch: false,
  originalPrice: '',
  printPrice: '',
  sketchPrice: '',
  image: null,
};

const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/).+/i;

const ProductForm: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value, checked, files } = event.target as HTMLInputElement;

    setForm((current) => {
      if (type === 'file') {
        return { ...current, image: files?.[0] || null };
      }

      if (type === 'checkbox') {
        const next = { ...current, [name]: checked };

        // Clear dependent fields when a variant is toggled off.
        if (!checked) {
          if (name === 'original') {
            next.originalPrice = '';
            next.medium = '';
            next.dimensions = '';
          }
          if (name === 'print') next.printPrice = '';
          if (name === 'sketch') next.sketchPrice = '';
        }

        return next;
      }

      if (name.endsWith('Price')) {
        return { ...current, [name]: value.replace(/[^\d.]/g, '') };
      }

      return { ...current, [name]: value };
    });

    setErrors((current) => ({ ...current, [name]: undefined, variant: undefined, image: undefined }));
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!form.title.trim()) nextErrors.title = 'Title is required.';
    if (!form.description.trim()) nextErrors.description = 'Description is required.';
    if (!form.category.trim()) nextErrors.category = 'Category is required.';
    if (!form.image) nextErrors.image = 'An artwork image is required.';

    if (!form.original && !form.print && !form.sketch) {
      nextErrors.variant = 'Select at least one option: Original, Print, or Sketch.';
    }

    if (form.original) {
      if (!form.originalPrice || Number(form.originalPrice) <= 0) {
        nextErrors.originalPrice = 'Original price is required.';
      }
      if (!form.medium.trim()) nextErrors.medium = 'Medium is required for original artwork.';
      if (!form.dimensions.trim()) nextErrors.dimensions = 'Dimensions are required for original artwork.';
    }

    if (form.print && (!form.printPrice || Number(form.printPrice) <= 0)) {
      nextErrors.printPrice = 'Print price is required.';
    }

    if (form.sketch && (!form.sketchPrice || Number(form.sketchPrice) <= 0)) {
      nextErrors.sketchPrice = 'Sketch price is required.';
    }

    if (!form.makingOfVideoUrl.trim()) {
      nextErrors.makingOfVideoUrl = 'Making-of video URL is required.';
    } else if (!youtubeUrlPattern.test(form.makingOfVideoUrl.trim())) {
      nextErrors.makingOfVideoUrl = 'Enter a valid YouTube URL.';
    }

    if (form.image) {
      if (!form.image.type.startsWith('image/')) nextErrors.image = 'Upload a valid image file.';
      if (form.image.size > 4 * 1024 * 1024) nextErrors.image = 'Image must be smaller than 4MB.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    const payload = new FormData();
    payload.append('title', form.title.trim());
    payload.append('description', form.description.trim());
    payload.append('category', form.category.trim());
    payload.append('year', form.year.trim());
    payload.append('videoUrl', form.makingOfVideoUrl.trim());
    payload.append('type', form.original ? 'original-artwork' : 'merchandise');
    payload.append('price', form.original ? form.originalPrice : form.printPrice || form.sketchPrice);
    payload.append('outlineSketchPrice', form.sketch ? form.sketchPrice : '0');
    payload.append('coloringPrice', form.print ? form.printPrice : '0');
    payload.append('stockQuantity', form.original ? '1' : '10');

    if (form.original) {
      payload.append('medium', form.medium.trim());
      payload.append('dimensions', form.dimensions.trim());
    }

    if (form.image) {
      // The backend artist product route already uses cloudinary.js during upload handling.
      payload.append('image', form.image);
    }

    try {
      setIsSubmitting(true);
      await axios.post('/api/artist-portal/products', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Product submitted for review.');
      setForm(initialState);
      setErrors({});
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not submit product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Product Form</h2>
        <p className="text-gray-500">Variant-aware upload with image handling and making-of video validation.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <input
            name="title"
            className="auth-input"
            placeholder="Product title"
            value={form.title}
            onChange={handleInputChange}
          />
          {errors.title && <p className="mt-2 text-sm text-red-500">{errors.title}</p>}
        </div>

        <div className="md:col-span-2">
          <textarea
            name="description"
            className="auth-input min-h-32"
            placeholder="Description"
            value={form.description}
            onChange={handleInputChange}
          />
          {errors.description && <p className="mt-2 text-sm text-red-500">{errors.description}</p>}
        </div>

        <div>
          <input
            name="category"
            className="auth-input"
            placeholder="Category"
            value={form.category}
            onChange={handleInputChange}
          />
          {errors.category && <p className="mt-2 text-sm text-red-500">{errors.category}</p>}
        </div>

        <div>
          <input
            name="year"
            className="auth-input"
            placeholder="Year"
            value={form.year}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Available options</p>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input type="checkbox" name="original" checked={form.original} onChange={handleInputChange} />
            Original
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input type="checkbox" name="print" checked={form.print} onChange={handleInputChange} />
            Print
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input type="checkbox" name="sketch" checked={form.sketch} onChange={handleInputChange} />
            Sketch
          </label>
        </div>
        {errors.variant && <p className="text-sm text-red-500">{errors.variant}</p>}
      </div>

      {form.original && (
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <input
              name="originalPrice"
              className="auth-input"
              placeholder="Original price"
              value={form.originalPrice}
              onChange={handleInputChange}
            />
            {errors.originalPrice && <p className="mt-2 text-sm text-red-500">{errors.originalPrice}</p>}
          </div>
          <div>
            <input
              name="medium"
              className="auth-input"
              placeholder="Medium"
              value={form.medium}
              onChange={handleInputChange}
            />
            {errors.medium && <p className="mt-2 text-sm text-red-500">{errors.medium}</p>}
          </div>
          <div>
            <input
              name="dimensions"
              className="auth-input"
              placeholder="Dimensions"
              value={form.dimensions}
              onChange={handleInputChange}
            />
            {errors.dimensions && <p className="mt-2 text-sm text-red-500">{errors.dimensions}</p>}
          </div>
        </div>
      )}

      {(form.print || form.sketch) && (
        <div className="grid gap-4 md:grid-cols-2">
          {form.print && (
            <div>
              <input
                name="printPrice"
                className="auth-input"
                placeholder="Print price"
                value={form.printPrice}
                onChange={handleInputChange}
              />
              {errors.printPrice && <p className="mt-2 text-sm text-red-500">{errors.printPrice}</p>}
            </div>
          )}
          {form.sketch && (
            <div>
              <input
                name="sketchPrice"
                className="auth-input"
                placeholder="Sketch price"
                value={form.sketchPrice}
                onChange={handleInputChange}
              />
              {errors.sketchPrice && <p className="mt-2 text-sm text-red-500">{errors.sketchPrice}</p>}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <input
            name="makingOfVideoUrl"
            className="auth-input"
            placeholder="Making-of YouTube URL"
            value={form.makingOfVideoUrl}
            onChange={handleInputChange}
          />
          {errors.makingOfVideoUrl && <p className="mt-2 text-sm text-red-500">{errors.makingOfVideoUrl}</p>}
        </div>

        <div>
          <input
            type="file"
            name="image"
            className="auth-input pt-3"
            accept="image/*"
            onChange={handleInputChange}
          />
          {errors.image && <p className="mt-2 text-sm text-red-500">{errors.image}</p>}
        </div>
      </div>

      <button type="submit" className="auth-button" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Product'}
      </button>
    </form>
  );
};

export default ProductForm;
