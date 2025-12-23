<script setup lang="ts">
import { computed, ref } from "vue";
import { usePdfStore } from "../stores/pdf";

const pdfStore = usePdfStore();
const selectedFile = ref<File | null>(null);
const isSubmitting = computed(() => pdfStore.isUploading);

const statusLabel = computed(() => {
  if (pdfStore.status === "uploading") return "Uploading...";
  if (pdfStore.status === "success") return "Uploaded";
  if (pdfStore.status === "error") return "Error";
  return "Idle";
});

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement | null;
  const [file] = target?.files ?? [];
  selectedFile.value = file ?? null;
}

async function handleSubmit() {
  if (!selectedFile.value) return;
  await pdfStore.upload(selectedFile.value);
}

function resetUpload() {
  selectedFile.value = null;
  pdfStore.reset();
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${
    units[exponent]
  }`;
}
</script>

<template>
  <section class="upload-card">
    <header class="upload-card__header">
      <div>
        <p class="eyebrow">Step 1</p>
        <h2>Upload a PDF</h2>
        <p class="muted">File is stored locally via the temporary upload API.</p>
      </div>
      <span class="status" :data-status="pdfStore.status">{{ statusLabel }}</span>
    </header>

    <div class="upload-card__body">
      <label class="file-input">
        <input
          type="file"
          accept="application/pdf"
          @change="onFileChange"
          :disabled="isSubmitting"
        />
        <span>
          {{ selectedFile ? selectedFile.name : "Choose a PDF file" }}
        </span>
      </label>

      <div class="actions">
        <button
          type="button"
          class="primary"
          :disabled="!selectedFile || isSubmitting"
          @click="handleSubmit"
        >
          {{ isSubmitting ? "Uploading..." : "Upload PDF" }}
        </button>
        <button type="button" class="ghost" :disabled="isSubmitting" @click="resetUpload">
          Reset
        </button>
      </div>

      <p v-if="pdfStore.error" class="error">Error: {{ pdfStore.error }}</p>

      <div v-if="pdfStore.activePdf" class="meta">
        <div>
          <p class="label">Active PDF</p>
          <p class="value">{{ pdfStore.activePdf.name }}</p>
        </div>
        <div>
          <p class="label">Size</p>
          <p class="value">{{ formatBytes(pdfStore.activePdf.size) }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.upload-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.05);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 11px;
  color: #52606d;
  margin: 0 0 2px;
}

h2 {
  margin: 0;
  font-size: 18px;
}

.muted {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.status {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
}

.status[data-status="uploading"] {
  color: #1d4ed8;
  border-color: #bfdbfe;
  background: #eff6ff;
}

.status[data-status="success"] {
  color: #0f5132;
  border-color: #badbcc;
  background: #e9f7ef;
}

.status[data-status="error"] {
  color: #842029;
  border-color: #f5c2c7;
  background: #f8d7da;
}

.upload-card__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-input {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  color: #1f2933;
  cursor: pointer;
}

.file-input input {
  display: none;
}

.actions {
  display: flex;
  gap: 8px;
}

button {
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease;
}

button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

button.primary {
  background: #2563eb;
  color: #fff;
}

button.primary:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.2);
}

button.ghost {
  background: #eef2f7;
  color: #1f2933;
}

.error {
  color: #b91c1c;
  margin: 0;
  font-size: 14px;
}

.meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
}

.label {
  margin: 0;
  color: #52606d;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.value {
  margin: 2px 0 0;
  font-weight: 600;
}
</style>

