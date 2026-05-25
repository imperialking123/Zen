import imageKitInstance from "../lib/kitUploader.js";

export const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain", // TXT
];

export const AUDIO_MIME_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/flac",
  "audio/aac",
  "audio/mp4",
];

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

export const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];

const getAttachmentType = (mimeType) => {
  if (
    !mimeType ||
    typeof mimeType !== "string" ||
    mimeType.trim().length === 0
  ) {
    return null;
  }

  const normalized = mimeType.trim();

  if (DOCUMENT_MIME_TYPES.includes(normalized)) return "document";
  if (IMAGE_MIME_TYPES.includes(normalized)) return "image";
  if (VIDEO_MIME_TYPES.includes(normalized)) return "video";
  if (AUDIO_MIME_TYPES.includes(normalized)) return "audio";

  return null;
};

const UploadFilesMiddleWare = async (req, res, next) => {
  try {
    const files = req?.files;
    const attachments = files?.attachment;
    const blurHash = req.body.blurHash;

    // Check if there are image/video attachments but no blurHash
    if (files && Array.isArray(attachments) && attachments.length > 0 && !blurHash) {
      const hasImageOrVideo = attachments.some(att => 
        att.mimetype.startsWith('image/') || att.mimetype.startsWith('video/')
      );
      
      if (hasImageOrVideo) {
        return res.status(400).json({ message: "BLUR_HASH_REQUIRED_FOR_IMAGE_VIDEO_ATTACHMENTS" });
      }
    }

    if (files && Array.isArray(attachments) && attachments.length > 0) {
      const uploads = await Promise.all(
        attachments.map((att) =>
          imageKitInstance
            .upload({
              file: att.buffer,
              fileName: att.originalname,
              folder: "/zen/chat/attachments",
            })
            .then((res) => ({
              ...res,
              mimeType: att.mimetype, // attach it from multer
            })),
        ),
      );

      const uploadedAttachments = uploads.map((p, index) => {
        const attachment = {
          type: getAttachmentType(p.mimeType),
          size: p.size,
          mimeType: p.mimeType,
          name: p.name,
          fileId: p.fileId,
          filePath: p.filePath,
        };

        // Add blurHash for image or video attachments
        if (attachment.type === 'image' || attachment.type === 'video') {
          if (Array.isArray(blurHash)) {
            attachment.blurHash = blurHash[index];
          } else if (typeof blurHash === 'string') {
            attachment.blurHash = blurHash;
          }
        }

        return attachment;
      });

      req.uploadedAttachments = uploadedAttachments;
    }

    next();
  } catch (error) {
    console.log(
      "Error on #UploadFilesMiddleware Error ---> ",
      error?.message || error,
    );
    return res.status(500).json({ message: "ATTACHMENT_UPLOAD_WENT_WRONG" });
  }
};

export default UploadFilesMiddleWare;
