const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadController = {
  // Upload image
  async uploadImage(req, res) {
    try {
      console.log("Image upload request received");
      console.log("File:", req.file ? "Present" : "Missing");

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No image file provided",
        });
      }

      console.log("Starting Cloudinary image upload...");
      console.log("File size:", req.file.size);
      console.log("File type:", req.file.mimetype);

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              folder: "experiments/stimuli",
              use_filename: true,
              unique_filename: true,
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary image error:", error);
                reject(error);
              } else {
                console.log("Cloudinary image success:", result.secure_url);
                resolve(result);
              }
            }
          )
          .end(req.file.buffer);
      });

      res.status(200).json({
        success: true,
        data: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          originalName: req.file.originalname,
          format: uploadResult.format,
          size: uploadResult.bytes
        },
      });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({
        success: false,
        error: `Failed to upload image: ${error.message}`,
      });
    }
  },

  // Upload audio
  async uploadAudio(req, res) {
    try {
      console.log("Audio upload request received");
      console.log("File:", req.file ? "Present" : "Missing");
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No audio file provided",
        });
      }

      console.log("Starting Cloudinary audio upload...");
      console.log("File size:", req.file.size);
      console.log("File type:", req.file.mimetype);

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "video", // Cloudinary uses 'video' for audio
              folder: "experiments/audio",
              use_filename: true,
              unique_filename: true,
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary audio error:", error);
                reject(error);
              } else {
                console.log("Cloudinary audio success:", result.secure_url);
                resolve(result);
              }
            }
          )
          .end(req.file.buffer);
      });

      res.status(200).json({
        success: true,
        data: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          originalName: req.file.originalname,
          format: uploadResult.format,
          duration: uploadResult.duration,
          size: uploadResult.bytes
        },
      });
    } catch (error) {
      console.error("Audio upload error:", error);
      res.status(500).json({
        success: false,
        error: `Failed to upload audio: ${error.message}`,
      });
    }
  },

  // Upload video
  async uploadVideo(req, res) {
    try {
      console.log("Video upload request received");
      console.log("File:", req.file ? "Present" : "Missing");
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No video file provided",
        });
      }

      console.log("Starting Cloudinary video upload...");
      console.log("File size:", req.file.size);
      console.log("File type:", req.file.mimetype);

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "video",
              folder: "experiments/videos",
              use_filename: true,
              unique_filename: true,
              chunk_size: 6000000, // 6MB chunks for large files
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary video error:", error);
                reject(error);
              } else {
                console.log("Cloudinary video success:", result.secure_url);
                resolve(result);
              }
            }
          )
          .end(req.file.buffer);
      });

      res.status(200).json({
        success: true,
        data: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          originalName: req.file.originalname,
          format: uploadResult.format,
          duration: uploadResult.duration,
          size: uploadResult.bytes
        },
      });
    } catch (error) {
      console.error("Video upload error:", error);
      res.status(500).json({
        success: false,
        error: `Failed to upload video: ${error.message}`,
      });
    }
  },
};

module.exports = uploadController;