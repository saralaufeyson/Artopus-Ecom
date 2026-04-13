import React from 'react';

type ArtistProductFormValues = {
  title: string;
  description: string;
  type: string;
  category: string;
  originalPrice: string;
  printPrice: string;
  sketchPrice: string;
  stockQuantity: string;
  medium: string;
  dimensions: string;
  year: string;
  makingOfVideoUrl: string;
  imageUrl: string;
};

type ArtistProductUploadFormProps = {
  form: ArtistProductFormValues;
  step: number;
  image: File | null;
  onFormChange: (field: keyof ArtistProductFormValues, value: string) => void;
  onImageChange: (file: File | null) => void;
  onStepChange: (step: number) => void;
  onSubmit: (event: React.FormEvent) => void;
};

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const ArtistProductUploadForm: React.FC<ArtistProductUploadFormProps> = ({
  form,
  step,
  image,
  onFormChange,
  onImageChange,
  onStepChange,
  onSubmit,
}) => {
  const previewPrices = {
    original: Number(form.originalPrice || 0),
    print: Number(form.printPrice || 0),
    sketch: Number(form.sketchPrice || 0),
  };

  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Art Upload Studio</h1>
          <p className="text-gray-500">Submit a new piece with clear pricing and a making-of YouTube link.</p>
        </div>
        <div className="text-sm text-gray-500">Step {step} of 3</div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {step === 1 && (
          <>
            <input
              className="auth-input"
              placeholder="Artwork title"
              value={form.title}
              onChange={(e) => onFormChange('title', e.target.value)}
              required
            />
            <textarea
              className="auth-input min-h-32"
              placeholder="Artwork story and description"
              value={form.description}
              onChange={(e) => onFormChange('description', e.target.value)}
              required
            />
            <div className="grid md:grid-cols-2 gap-4">
              <select
                className="auth-input"
                value={form.type}
                onChange={(e) => onFormChange('type', e.target.value)}
              >
                <option value="original-artwork">Original Artwork</option>
                <option value="merchandise">Merchandise</option>
              </select>
              <input
                className="auth-input"
                placeholder="Category"
                value={form.category}
                onChange={(e) => onFormChange('category', e.target.value)}
                required
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="auth-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="Original price"
                value={form.originalPrice}
                onChange={(e) => onFormChange('originalPrice', e.target.value)}
                required
              />
              <input
                className="auth-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="Print price"
                value={form.printPrice}
                onChange={(e) => onFormChange('printPrice', e.target.value)}
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="auth-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="Sketch price"
                value={form.sketchPrice}
                onChange={(e) => onFormChange('sketchPrice', e.target.value)}
                required
              />
              <input
                className="auth-input"
                type="number"
                min="0"
                placeholder="Stock quantity"
                value={form.stockQuantity}
                onChange={(e) => onFormChange('stockQuantity', e.target.value)}
              />
            </div>
            <div className="p-5 rounded-2xl bg-logo-purple/5 border border-logo-purple/10">
              <p className="font-bold mb-2 text-gray-900 dark:text-white">Price preview</p>
              <p>Original: {priceFormatter.format(previewPrices.original)}</p>
              <p>Print: {priceFormatter.format(previewPrices.print)}</p>
              <p>Sketch: {priceFormatter.format(previewPrices.sketch)}</p>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              <input
                className="auth-input"
                placeholder="Medium"
                value={form.medium}
                onChange={(e) => onFormChange('medium', e.target.value)}
              />
              <input
                className="auth-input"
                placeholder="Dimensions"
                value={form.dimensions}
                onChange={(e) => onFormChange('dimensions', e.target.value)}
              />
              <input
                className="auth-input"
                placeholder="Year"
                value={form.year}
                onChange={(e) => onFormChange('year', e.target.value)}
              />
            </div>
            <input
              className="auth-input"
              type="url"
              placeholder="Making-of YouTube video URL"
              value={form.makingOfVideoUrl}
              onChange={(e) => onFormChange('makingOfVideoUrl', e.target.value)}
              required
            />
            <input
              className="auth-input"
              type="url"
              placeholder="Optional image URL"
              value={form.imageUrl}
              onChange={(e) => onFormChange('imageUrl', e.target.value)}
            />
            <input
              className="auth-input pt-3"
              type="file"
              accept="image/*"
              onChange={(e) => onImageChange(e.target.files?.[0] || null)}
            />
            {image && (
              <p className="text-sm text-gray-500">
                Selected image: <span className="font-semibold">{image.name}</span>
              </p>
            )}
          </>
        )}

        <div className="flex gap-3">
          {step > 1 && (
            <button
              type="button"
              className="auth-button bg-gray-200 text-gray-900"
              onClick={() => onStepChange(step - 1)}
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button type="button" className="auth-button" onClick={() => onStepChange(step + 1)}>
              Next
            </button>
          ) : (
            <button type="submit" className="auth-button">
              Submit for Review
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export type { ArtistProductFormValues };
export default ArtistProductUploadForm;
