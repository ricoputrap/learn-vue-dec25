<script setup lang="ts">
import type { UploadStatus } from "../types";

const props = defineProps<{
  activePdfName?: string | null;
  uploadStatus?: UploadStatus;
}>();

const statusText: Record<UploadStatus, string> = {
  idle: "No upload",
  uploading: "Uploading...",
  success: "Uploaded",
  error: "Error",
};
</script>

<template>
  <header class="chat__header">
    <div>
      <h1>ChatPDF</h1>
      <p class="chat__subhead">
        Discuss the uploaded PDF. Messages stay local for now.
      </p>
    </div>
    <div class="chat__badge" v-if="props.activePdfName">
      <span class="chat__badge-label">PDF</span>
      <span class="chat__badge-name">{{ props.activePdfName }}</span>
      <span class="chat__badge-status" :data-status="props.uploadStatus ?? 'idle'">
        {{ statusText[props.uploadStatus ?? "idle"] }}
      </span>
    </div>
  </header>
</template>

<style scoped>
.chat__header {
  border-bottom: 1px solid #eef1f6;
  padding-bottom: 12px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.chat__header h1 {
  margin: 0;
  font-size: 20px;
}

.chat__subhead {
  margin: 4px 0 0;
  color: #52606d;
  font-size: 14px;
}

.chat__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  white-space: nowrap;
}

.chat__badge-label {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 11px;
  color: #52606d;
}

.chat__badge-name {
  font-weight: 600;
}

.chat__badge-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #fff;
}

.chat__badge-status[data-status="uploading"] {
  color: #1d4ed8;
  border-color: #bfdbfe;
  background: #eff6ff;
}

.chat__badge-status[data-status="success"] {
  color: #0f5132;
  border-color: #badbcc;
  background: #e9f7ef;
}

.chat__badge-status[data-status="error"] {
  color: #842029;
  border-color: #f5c2c7;
  background: #f8d7da;
}
</style>

