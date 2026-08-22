export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Union of Instagram Reels / TikTok overlay zones at 1080×1920:
 * top ≈ camera/search bar, right ≈ like/share action rail,
 * bottom ≈ caption + audio UI + progress bar.
 */
export const SAFE_AREA_INSETS: SafeAreaInsets = {
  top: 220,
  right: 160,
  bottom: 440,
  left: 60,
};
