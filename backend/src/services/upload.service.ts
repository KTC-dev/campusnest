import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

// Every image operation in the app goes through this interface. If Cloudinary
// is ever swapped for S3/Supabase Storage/etc., only this file changes —
// property.service.ts never touches an SDK directly.
export interface UploadedImage {
  url: string;
  publicId: string;
}

const isConfigured = Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

class UploadService {
  async uploadImage(base64OrUrl: string, folder = "campusnest/properties"): Promise<UploadedImage> {
    if (!isConfigured) {
      throw AppError.badRequest("Image upload is not configured on the server. Please contact support.");
    }

    const result = await cloudinary.uploader.upload(base64OrUrl, { folder });
    return { url: result.secure_url, publicId: result.public_id };
  }

  async deleteImage(publicId: string): Promise<void> {
    if (!isConfigured) return;
    await cloudinary.uploader.destroy(publicId);
  }
}

export const uploadService = new UploadService();
