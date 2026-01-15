// src/lib/carousel-config.ts

/**
 * Carousel banner images configuration
 * Update these paths to match your actual banner images
 */
export const CAROUSEL_IMAGES = [
  '/carousel/banner1.jpg',
  '/carousel/banner2.jpg',
  '/carousel/banner3.jpg',
  '/carousel/banner4.jpg',
  '/carousel/banner5.jpg',
  '/carousel/banner6.jpg',
  '/carousel/banner7.jpg',
  '/carousel/banner8.jpg',
  '/carousel/banner9.jpg',
  '/carousel/banner10.jpg',
];

/**
 * Auto-slide interval in milliseconds
 * Default: 5000ms (5 seconds)
 */
export const AUTO_SLIDE_INTERVAL = 5000;

/**
 * Get carousel image URL with fallback
 */
export function getCarouselImageUrl(index: number): string {
  if (index >= 0 && index < CAROUSEL_IMAGES.length) {
    return CAROUSEL_IMAGES[index];
  }
  // Fallback placeholder
  return `https://placehold.co/1200x400/6366f1/ffffff?text=Banner+${index + 1}`;
}