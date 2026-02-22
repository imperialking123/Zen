import imageKitInstance from '../lib/kitUploader.js';



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

        const files = req?.files

        const attachments = files?.attachment





        if (files && Array.isArray(attachments) && attachments.length > 0) {
            const uploads = await Promise.all(
                attachments.map((att) =>
                    imageKitInstance.upload({
                        file: att.buffer,
                        fileName: att.originalname,
                        folder: "/zen/chat/attachments",
                    }).then((res) => ({
                        ...res,
                        mimeType: att.mimetype, // attach it from multer
                    }))
                )
            );


            const uploadedAttachments = uploads.map((p) => {
                return {
                    type: getAttachmentType(p.mimeType),
                    size: p.size,
                    mimeType: p.mimeType,
                    name: p.name,
                    fileId: p.fileId,
                    filePath: p.filePath
                }
            })

            

            req.uploadedAttachments = uploadedAttachments


        }

        next()

    } catch (error) {
        console.log("Error on #UploadFilesMiddleware Error ---> ", error?.message || error)
        return res.status(500).json({ message: "ATTACHMENT_UPLOAD_WENT_WRONG" })
    }
}

export default UploadFilesMiddleWare