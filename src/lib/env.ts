export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

/** Same-origin URL for post/comment images (proxied via Next.js API). Works without NEXT_PUBLIC_API_URL. */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '';
  const cleaned = imagePath.replace(/^\/uploads\//, '');
  return cleaned ? `/api/uploads/${cleaned}` : '';
}
