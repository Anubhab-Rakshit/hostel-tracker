import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file: File | string, folder: string = "hostel-tracker") => {
    try {
        if (typeof file === "string") {
            // It's a base64 string or URL
            const result = await cloudinary.uploader.upload(file, {
                folder,
                resource_type: "auto",
            });
            return result.secure_url;
        }

        // It's a File object (from FormData)
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        const dataURI = `data:${file.type};base64,${base64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder,
            resource_type: "auto",
        });

        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error("Failed to upload image");
    }
};
