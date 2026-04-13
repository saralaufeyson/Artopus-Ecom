const DEFAULT_TRANSFORMATION = 'f_auto,q_auto,c_limit,w_1200';

export function getOptimizedImageUrl(source?: string | null, transformation = DEFAULT_TRANSFORMATION) {
  if (!source) return '';

  if (!source.includes('/upload/')) return source;
  if (!source.includes('res.cloudinary.com')) return source;

  const [prefix, suffix] = source.split('/upload/');
  if (!suffix) return source;

  let normalizedSuffix = suffix;
  if (
    normalizedSuffix.startsWith('f_')
    || normalizedSuffix.startsWith('q_')
    || normalizedSuffix.startsWith('c_')
    || normalizedSuffix.startsWith('w_')
  ) {
    const nextSlash = normalizedSuffix.indexOf('/');
    if (nextSlash !== -1) {
      normalizedSuffix = normalizedSuffix.slice(nextSlash + 1);
    }
  }

  return `${prefix}/upload/${transformation}/${normalizedSuffix}`;
}
