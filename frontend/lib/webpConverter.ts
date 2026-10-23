// =============================================================================
// WebP Image Conversion Engine
// Converts JPG, PNG, GIF, BMP, TIFF & HEIC images into WebP format
// =============================================================================

/**
 * Converts any image File object into an optimized WebP File object using HTML5 Canvas.
 * @param file Original image File selected by user
 * @param quality Compression quality from 0.1 to 1.0 (default 0.85)
 * @returns Promise resolving to a WebP File object
 */
export async function convertImageToWebP(file: File, quality: number = 0.95): Promise<File> {
  const isWebP = file.type === "image/webp" || /\.webp$/i.test(file.name);
  const isNonImage = !file.type.startsWith("image/") && !file.name.match(/\.(png|jpe?g|bmp|tiff|heic)$/i);
  const isAlreadySmall = file.size <= 120 * 1024; // Less than or equal to 120KB

  // Never re-compress if already WebP, non-image, or already low KB — prevents generation loss & blurring
  if (isWebP || isNonImage || isAlreadySmall) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        // Create offscreen canvas preserving native resolution
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) {
          resolve(file); // Fallback to original if 2d context unavailable
          return;
        }

        // Use highest quality multi-pass bicubic image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Fill white background for non-transparent formats to prevent black alpha canvas bug
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw image onto canvas with high quality
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert canvas content to WebP blob with pristine clarity
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            // Create new WebP file with .webp extension
            const originalName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            const webpFileName = `${originalName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.webp`;

            const webpFile = new File([blob], webpFileName, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            console.log(`🖼️ High-Clarity WebP: ${file.name} (${(file.size / 1024).toFixed(1)} KB) ➔ ${webpFile.name} (${(webpFile.size / 1024).toFixed(1)} KB)`);
            resolve(webpFile);
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => {
        resolve(file); // Fallback to original file on load error
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      resolve(file);
    };

    reader.readAsDataURL(file);
  });
}
