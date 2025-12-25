import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import PdfUpload from "../PdfUpload.vue";
import { usePdfStore } from "../../stores/pdf";

describe("PdfUpload", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("Component Rendering", () => {
    it("should render the component", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it("should render section element", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const section = wrapper.find("section");
      expect(section.exists()).toBe(true);
    });

    it("should have upload-card class", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const section = wrapper.find(".upload-card");
      expect(section.exists()).toBe(true);
    });

    it("should render header section", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const header = wrapper.find(".upload-card__header");
      expect(header.exists()).toBe(true);
    });

    it("should render body section", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const body = wrapper.find(".upload-card__body");
      expect(body.exists()).toBe(true);
    });
  });

  describe("Header Content", () => {
    it("should display step indicator", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const eyebrow = wrapper.find(".eyebrow");
      expect(eyebrow.exists()).toBe(true);
      expect(eyebrow.text()).toBe("Step 1");
    });

    it("should display main heading", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const heading = wrapper.find("h2");
      expect(heading.exists()).toBe(true);
      expect(heading.text()).toBe("Upload a PDF");
    });

    it("should display description", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const description = wrapper.find(".muted");
      expect(description.exists()).toBe(true);
      expect(description.text()).toContain(
        "File is stored locally via the temporary upload API",
      );
    });

    it("should display status badge", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const status = wrapper.find(".status");
      expect(status.exists()).toBe(true);
    });
  });

  describe("File Input", () => {
    it("should render file input", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const input = wrapper.find('input[type="file"]');
      expect(input.exists()).toBe(true);
    });

    it("should accept only PDF files", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const input = wrapper.find('input[type="file"]');
      expect(input.attributes("accept")).toBe("application/pdf");
    });

    it("should have file-input wrapper", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const fileInput = wrapper.find(".file-input");
      expect(fileInput.exists()).toBe(true);
    });

    it("should show default text when no file selected", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      expect(wrapper.text()).toContain("Choose a PDF file");
    });
  });

  describe("File Selection", () => {
    it("should update text when file is selected", async () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const input = wrapper.find('input[type="file"]');
      const file = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });

      Object.defineProperty(input.element, "files", {
        value: [file],
        writable: false,
      });

      await input.trigger("change");
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("test.pdf");
    });

    it("should handle file selection event", async () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const input = wrapper.find('input[type="file"]');
      const file = new File(["content"], "document.pdf", {
        type: "application/pdf",
      });

      Object.defineProperty(input.element, "files", {
        value: [file],
        writable: false,
      });

      await input.trigger("change");
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("document.pdf");
    });

    it("should handle multiple file selections", async () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const input = wrapper.find('input[type="file"]');

      // First file
      const file1 = new File(["content1"], "first.pdf", {
        type: "application/pdf",
      });
      Object.defineProperty(input.element, "files", {
        value: [file1],
        writable: false,
        configurable: true,
      });
      await input.trigger("change");
      await wrapper.vm.$nextTick();
      expect(wrapper.text()).toContain("first.pdf");

      // Second file
      const file2 = new File(["content2"], "second.pdf", {
        type: "application/pdf",
      });
      Object.defineProperty(input.element, "files", {
        value: [file2],
        writable: false,
        configurable: true,
      });
      await input.trigger("change");
      await wrapper.vm.$nextTick();
      expect(wrapper.text()).toContain("second.pdf");
    });

    it("should handle empty file selection", async () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const input = wrapper.find('input[type="file"]');
      Object.defineProperty(input.element, "files", {
        value: [],
        writable: false,
      });

      await input.trigger("change");
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("Choose a PDF file");
    });
  });

  describe("Buttons", () => {
    it("should render upload button", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const buttons = wrapper.findAll("button");
      const uploadButton = buttons.find((btn) => btn.text().includes("Upload"));
      expect(uploadButton).toBeTruthy();
    });

    it("should render reset button", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const buttons = wrapper.findAll("button");
      const resetButton = buttons.find((btn) => btn.text().includes("Reset"));
      expect(resetButton).toBeTruthy();
    });

    it("should disable upload button when no file selected", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const buttons = wrapper.findAll("button");
      const uploadButton = buttons.find((btn) => btn.text().includes("Upload"));
      expect(uploadButton?.attributes("disabled")).toBeDefined();
    });

    it("should enable upload button when file is selected", async () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const input = wrapper.find('input[type="file"]');
      const file = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });

      Object.defineProperty(input.element, "files", {
        value: [file],
        writable: false,
      });

      await input.trigger("change");
      await wrapper.vm.$nextTick();

      const buttons = wrapper.findAll("button");
      const uploadButton = buttons.find((btn) => btn.text().includes("Upload"));
      expect(uploadButton?.attributes("disabled")).toBeUndefined();
    });

    it('should show "Uploading..." when upload is in progress', async () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const pdfStore = usePdfStore();

      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [pinia],
        },
      });

      // Mock uploading state
      pdfStore.status = "uploading";
      await wrapper.vm.$nextTick();

      const buttons = wrapper.findAll("button");
      const uploadButton = buttons.find((btn) =>
        btn.text().includes("Uploading"),
      );
      expect(uploadButton).toBeTruthy();
    });
  });

  describe("Status Display", () => {
    it('should show "Idle" status by default', () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const status = wrapper.find(".status");
      expect(status.text()).toBe("Idle");
    });

    it('should show "Uploading..." status during upload', async () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const pdfStore = usePdfStore();

      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [pinia],
        },
      });

      pdfStore.status = "uploading";
      await wrapper.vm.$nextTick();

      const status = wrapper.find(".status");
      expect(status.text()).toBe("Uploading...");
    });

    it('should show "Uploaded" status on success', async () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const pdfStore = usePdfStore();

      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [pinia],
        },
      });

      pdfStore.status = "success";
      await wrapper.vm.$nextTick();

      const status = wrapper.find(".status");
      expect(status.text()).toBe("Uploaded");
    });

    it('should show "Error" status on error', async () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const pdfStore = usePdfStore();

      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [pinia],
        },
      });

      pdfStore.status = "error";
      await wrapper.vm.$nextTick();

      const status = wrapper.find(".status");
      expect(status.text()).toBe("Error");
    });

    it("should apply correct data-status attribute", async () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const pdfStore = usePdfStore();

      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [pinia],
        },
      });

      pdfStore.status = "success";
      await wrapper.vm.$nextTick();

      const status = wrapper.find(".status");
      expect(status.attributes("data-status")).toBe("success");
    });
  });

  describe("Error Display", () => {
    it("should not show error message by default", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const error = wrapper.find(".error");
      expect(error.exists()).toBe(false);
    });

    it("should show error message when present", async () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const pdfStore = usePdfStore();

      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [pinia],
        },
      });

      pdfStore.error = "Upload failed";
      await wrapper.vm.$nextTick();

      const error = wrapper.find(".error");
      expect(error.exists()).toBe(true);
      expect(error.text()).toContain("Upload failed");
    });
  });

  describe("Active PDF Display", () => {
    it("should not show metadata when no PDF is active", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const meta = wrapper.find(".meta");
      expect(meta.exists()).toBe(false);
    });

    it("should show metadata when PDF is active", async () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const pdfStore = usePdfStore();

      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [pinia],
        },
      });

      pdfStore.activePdf = {
        name: "document.pdf",
        size: 1024000,
        uploadedAt: Date.now(),
      };
      await wrapper.vm.$nextTick();

      const meta = wrapper.find(".meta");
      expect(meta.exists()).toBe(true);
    });

    it("should display active PDF name", async () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const pdfStore = usePdfStore();

      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [pinia],
        },
      });

      pdfStore.activePdf = {
        name: "test-document.pdf",
        size: 1024000,
        uploadedAt: Date.now(),
      };
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("test-document.pdf");
    });

    it("should display formatted file size", async () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const pdfStore = usePdfStore();

      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [pinia],
        },
      });

      pdfStore.activePdf = {
        name: "document.pdf",
        size: 1024 * 1024, // 1 MB
        uploadedAt: Date.now(),
      };
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("MB");
    });
  });

  describe("File Size Formatting", () => {
    it("should format bytes correctly", async () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const pdfStore = usePdfStore();

      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [pinia],
        },
      });

      pdfStore.activePdf = {
        name: "tiny.pdf",
        size: 500,
        uploadedAt: Date.now(),
      };
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("B");
    });

    it("should format kilobytes correctly", async () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const pdfStore = usePdfStore();

      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [pinia],
        },
      });

      pdfStore.activePdf = {
        name: "small.pdf",
        size: 50 * 1024,
        uploadedAt: Date.now(),
      };
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("KB");
    });

    it("should format megabytes correctly", async () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const pdfStore = usePdfStore();

      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [pinia],
        },
      });

      pdfStore.activePdf = {
        name: "medium.pdf",
        size: 5 * 1024 * 1024,
        uploadedAt: Date.now(),
      };
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("MB");
    });
  });

  describe("Reset Functionality", () => {
    it("should clear selected file when reset is clicked", async () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      // Select a file
      const input = wrapper.find('input[type="file"]');
      const file = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });

      Object.defineProperty(input.element, "files", {
        value: [file],
        writable: false,
      });

      await input.trigger("change");
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("test.pdf");

      // Click reset
      const buttons = wrapper.findAll("button");
      const resetButton = buttons.find((btn) => btn.text().includes("Reset"));
      await resetButton?.trigger("click");
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("Choose a PDF file");
    });

    it("should reset store when reset is clicked", async () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const pdfStore = usePdfStore();

      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [pinia],
        },
      });

      pdfStore.activePdf = {
        name: "test.pdf",
        size: 1024,
        uploadedAt: Date.now(),
      };
      pdfStore.status = "success";

      await wrapper.vm.$nextTick();

      const buttons = wrapper.findAll("button");
      const resetButton = buttons.find((btn) => btn.text().includes("Reset"));
      await resetButton?.trigger("click");
      await wrapper.vm.$nextTick();

      expect(pdfStore.activePdf).toBeNull();
      expect(pdfStore.status).toBe("idle");
    });
  });

  describe("Store Integration", () => {
    it("should read status from PDF store", () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const pdfStore = usePdfStore();

      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [pinia],
        },
      });

      expect(pdfStore.status).toBe("idle");
      expect(wrapper.exists()).toBe(true);
    });

    it("should react to store changes", async () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const pdfStore = usePdfStore();

      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [pinia],
        },
      });

      expect(wrapper.find(".status").text()).toBe("Idle");

      pdfStore.status = "uploading";
      await wrapper.vm.$nextTick();

      expect(wrapper.find(".status").text()).toBe("Uploading...");
    });
  });

  describe("Disabled State", () => {
    it("should disable input during upload", async () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const pdfStore = usePdfStore();

      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [pinia],
        },
      });

      pdfStore.status = "uploading";
      await wrapper.vm.$nextTick();

      const input = wrapper.find('input[type="file"]');
      expect(input.attributes("disabled")).toBeDefined();
    });

    it("should disable upload button during upload", async () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const pdfStore = usePdfStore();

      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [pinia],
        },
      });

      pdfStore.status = "uploading";
      await wrapper.vm.$nextTick();

      const buttons = wrapper.findAll("button");
      const uploadButton = buttons.find((btn) =>
        btn.text().includes("Uploading"),
      );
      expect(uploadButton?.attributes("disabled")).toBeDefined();
    });

    it("should disable reset button during upload", async () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const pdfStore = usePdfStore();

      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [pinia],
        },
      });

      pdfStore.status = "uploading";
      await wrapper.vm.$nextTick();

      const buttons = wrapper.findAll("button");
      const resetButton = buttons.find((btn) => btn.text().includes("Reset"));
      expect(resetButton?.attributes("disabled")).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle long filenames", async () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const longName = "a".repeat(100) + ".pdf";
      const input = wrapper.find('input[type="file"]');
      const file = new File(["content"], longName, {
        type: "application/pdf",
      });

      Object.defineProperty(input.element, "files", {
        value: [file],
        writable: false,
      });

      await input.trigger("change");
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain(longName);
    });

    it("should handle special characters in filename", async () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const specialName = "test@#$%^&()_+-=.pdf";
      const input = wrapper.find('input[type="file"]');
      const file = new File(["content"], specialName, {
        type: "application/pdf",
      });

      Object.defineProperty(input.element, "files", {
        value: [file],
        writable: false,
      });

      await input.trigger("change");
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain(specialName);
    });

    it("should handle unicode in filename", async () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const unicodeName = "文档_مستند_Документ.pdf";
      const input = wrapper.find('input[type="file"]');
      const file = new File(["content"], unicodeName, {
        type: "application/pdf",
      });

      Object.defineProperty(input.element, "files", {
        value: [file],
        writable: false,
      });

      await input.trigger("change");
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain(unicodeName);
    });

    it("should handle zero-size files", async () => {
      const pinia = createPinia();
      setActivePinia(pinia);
      const pdfStore = usePdfStore();

      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [pinia],
        },
      });

      pdfStore.activePdf = {
        name: "empty.pdf",
        size: 0,
        uploadedAt: Date.now(),
      };
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("0 B");
    });
  });

  describe("CSS Structure", () => {
    it("should have actions class for buttons", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const actions = wrapper.find(".actions");
      expect(actions.exists()).toBe(true);
    });

    it("should apply primary class to upload button", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const buttons = wrapper.findAll("button");
      const uploadButton = buttons.find((btn) =>
        btn.classes().includes("primary"),
      );
      expect(uploadButton).toBeTruthy();
    });

    it("should apply ghost class to reset button", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const buttons = wrapper.findAll("button");
      const resetButton = buttons.find((btn) =>
        btn.classes().includes("ghost"),
      );
      expect(resetButton).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("should use semantic HTML", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      expect(wrapper.find("section").exists()).toBe(true);
      expect(wrapper.find("header").exists()).toBe(true);
      expect(wrapper.find("label").exists()).toBe(true);
      expect(wrapper.find("h2").exists()).toBe(true);
    });

    it("should have proper label structure", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const label = wrapper.find("label");
      const input = label.find('input[type="file"]');
      expect(input.exists()).toBe(true);
    });

    it("should have proper button types", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      const buttons = wrapper.findAll("button");
      buttons.forEach((button) => {
        expect(button.attributes("type")).toBe("button");
      });
    });
  });

  describe("Mount and Unmount", () => {
    it("should mount successfully", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
      });

      expect(wrapper.vm).toBeTruthy();
      expect(wrapper.element).toBeTruthy();
    });

    it("should unmount cleanly", () => {
      const wrapper = mount(PdfUpload, {
        global: {
          plugins: [createPinia()],
        },
        attachTo: document.body,
      });

      expect(document.body.contains(wrapper.element)).toBe(true);
      wrapper.unmount();
      expect(document.body.contains(wrapper.element)).toBe(false);
    });

    it("should handle multiple mount/unmount cycles", () => {
      for (let i = 0; i < 5; i++) {
        const wrapper = mount(PdfUpload, {
          global: {
            plugins: [createPinia()],
          },
          attachTo: document.body,
        });

        expect(wrapper.exists()).toBe(true);
        wrapper.unmount();
      }
    });
  });
});
