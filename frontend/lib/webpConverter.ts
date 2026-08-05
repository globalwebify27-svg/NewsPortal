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
export async function convertImageToWebP(file: File, quality: number = 0.85): Promise<File> {
  // If already a webp or non-image (like PDF or Video), return original
  if (file.type === "image/webp" || (!file.type.startsWith("image/") && !file.name.match(/\.(png|jpe?g|bmp|tiff|heic)$/i))) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        // Create offscreen canvas
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file); // Fallback to original if 2d context unavailable
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0);

        // Convert canvas content to WebP blob
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

            console.log(`🖼️ Converted ${file.name} (${(file.size / 1024).toFixed(1)} KB) ➔ ${webpFile.name} (${(webpFile.size / 1024).toFixed(1)} KB WebP)`);
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
