export interface CloudinaryUploadResult {
  url: string;
  publicId?: string;
}

export async function uploadImageToCloudinary(
  fileOrBase64: string,
  folder = "skillora"
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // If real Cloudinary keys are supplied, use official REST/SDK upload
  if (cloudName && apiKey && apiSecret && cloudName !== "demo") {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      
      // Node crypto signature
      const crypto = await import("crypto");
      const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

      const formData = new FormData();
      formData.append("file", fileOrBase64);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          url: data.secure_url,
          publicId: data.public_id,
        };
      }
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
    }
  }

  // Fallback: If it's already a valid HTTP(S) URL or base64 data URL, return it directly
  if (fileOrBase64.startsWith("http://") || fileOrBase64.startsWith("https://")) {
    return { url: fileOrBase64 };
  }

  // If it's base64 and Cloudinary is not configured, return as base64 or Unsplash fallback
  return {
    url: fileOrBase64.startsWith("data:") 
      ? fileOrBase64 
      : `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80`,
  };
}

