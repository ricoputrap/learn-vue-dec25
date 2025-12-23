import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { UPLOAD_ENDPOINT } from "../config";
import type { UploadStatus, UploadedPdf } from "../types";

export const usePdfStore = defineStore("pdf", () => {
    const status = ref<UploadStatus>("idle");
    const error = ref<string | null>(null);
    const activePdf = ref<UploadedPdf | null>(null);

    const isUploading = computed(() => status.value === "uploading");

    async function upload(file: File) {
        if (!file) return;

        status.value = "uploading";
        error.value = null;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(UPLOAD_ENDPOINT, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const message = await response.text().catch(() => response.statusText);
                throw new Error(message || "Upload failed");
            }

            const body = await response.json().catch(() => ({}));

            activePdf.value = {
                name: file.name,
                size: file.size,
                uploadedAt: Date.now(),
                path: body?.path ?? body?.filePath ?? undefined,
            };
            status.value = "success";
        } catch (err) {
            status.value = "error";
            error.value =
                err instanceof Error ? err.message : "Upload failed. Please try again.";
        }
    }

    function reset() {
        status.value = "idle";
        error.value = null;
        activePdf.value = null;
    }

    return {
        status,
        error,
        activePdf,
        isUploading,
        upload,
        reset,
    };
});

