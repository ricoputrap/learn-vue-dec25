export type ChatMessage = {
    id: string;
    sender: string;
    text: string;
    createdAt: number;
};

export type UploadStatus = "idle" | "uploading" | "success" | "error";

export type UploadedPdf = {
    name: string;
    size: number;
    uploadedAt: number;
    path?: string;
    id?: string;
    message?: string;
};
