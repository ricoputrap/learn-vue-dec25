import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ChatHeader from "../ChatHeader.vue";
import type { UploadStatus } from "../../types";

describe("ChatHeader", () => {
  describe("Component Rendering", () => {
    it("should render the component", () => {
      const wrapper = mount(ChatHeader);
      expect(wrapper.exists()).toBe(true);
    });

    it("should render header element", () => {
      const wrapper = mount(ChatHeader);
      const header = wrapper.find("header");
      expect(header.exists()).toBe(true);
    });

    it("should render title", () => {
      const wrapper = mount(ChatHeader);
      expect(wrapper.text()).toContain("ChatPDF");
    });

    it("should render subtitle", () => {
      const wrapper = mount(ChatHeader);
      expect(wrapper.text()).toContain(
        "Discuss the uploaded PDF. Messages stay local for now.",
      );
    });

    it("should render h1 element", () => {
      const wrapper = mount(ChatHeader);
      const h1 = wrapper.find("h1");
      expect(h1.exists()).toBe(true);
      expect(h1.text()).toBe("ChatPDF");
    });
  });

  describe("Props Handling", () => {
    it("should render without props", () => {
      const wrapper = mount(ChatHeader);
      expect(wrapper.exists()).toBe(true);
    });

    it("should accept activePdfName prop", () => {
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: "document.pdf",
        },
      });
      expect(wrapper.props("activePdfName")).toBe("document.pdf");
    });

    it("should accept uploadStatus prop", () => {
      const wrapper = mount(ChatHeader, {
        props: {
          uploadStatus: "success" as UploadStatus,
        },
      });
      expect(wrapper.props("uploadStatus")).toBe("success");
    });

    it("should handle null activePdfName", () => {
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: null,
        },
      });
      expect(wrapper.props("activePdfName")).toBeNull();
    });

    it("should handle undefined activePdfName", () => {
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: undefined,
        },
      });
      expect(wrapper.props("activePdfName")).toBeUndefined();
    });
  });

  describe("PDF Badge Display", () => {
    it("should not show badge when no PDF is uploaded", () => {
      const wrapper = mount(ChatHeader);
      const badge = wrapper.find(".chat__badge");
      expect(badge.exists()).toBe(false);
    });

    it("should show badge when PDF is uploaded", () => {
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: "test.pdf",
        },
      });
      const badge = wrapper.find(".chat__badge");
      expect(badge.exists()).toBe(true);
    });

    it("should display PDF filename in badge", () => {
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: "my-document.pdf",
        },
      });
      expect(wrapper.text()).toContain("my-document.pdf");
    });

    it("should display PDF label in badge", () => {
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: "test.pdf",
        },
      });
      const label = wrapper.find(".chat__badge-label");
      expect(label.exists()).toBe(true);
      expect(label.text()).toBe("PDF");
    });

    it("should show badge with long filename", () => {
      const longName = "a".repeat(100) + ".pdf";
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: longName,
        },
      });
      expect(wrapper.text()).toContain(longName);
    });
  });

  describe("Upload Status Display", () => {
    it('should show "No upload" for idle status', () => {
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: "test.pdf",
          uploadStatus: "idle" as UploadStatus,
        },
      });
      expect(wrapper.text()).toContain("No upload");
    });

    it('should show "Uploading..." for uploading status', () => {
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: "test.pdf",
          uploadStatus: "uploading" as UploadStatus,
        },
      });
      expect(wrapper.text()).toContain("Uploading...");
    });

    it('should show "Uploaded" for success status', () => {
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: "test.pdf",
          uploadStatus: "success" as UploadStatus,
        },
      });
      expect(wrapper.text()).toContain("Uploaded");
    });

    it('should show "Error" for error status', () => {
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: "test.pdf",
          uploadStatus: "error" as UploadStatus,
        },
      });
      expect(wrapper.text()).toContain("Error");
    });

    it("should default to idle when uploadStatus is undefined", () => {
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: "test.pdf",
        },
      });
      expect(wrapper.text()).toContain("No upload");
    });

    it("should apply correct data-status attribute", () => {
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: "test.pdf",
          uploadStatus: "success" as UploadStatus,
        },
      });
      const statusElement = wrapper.find(".chat__badge-status");
      expect(statusElement.attributes("data-status")).toBe("success");
    });
  });

  describe("Reactivity", () => {
    it("should update when activePdfName changes", async () => {
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: "first.pdf",
        },
      });

      expect(wrapper.text()).toContain("first.pdf");

      await wrapper.setProps({ activePdfName: "second.pdf" });
      expect(wrapper.text()).toContain("second.pdf");
      expect(wrapper.text()).not.toContain("first.pdf");
    });

    it("should update when uploadStatus changes", async () => {
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: "test.pdf",
          uploadStatus: "uploading" as UploadStatus,
        },
      });

      expect(wrapper.text()).toContain("Uploading...");

      await wrapper.setProps({ uploadStatus: "success" });
      expect(wrapper.text()).toContain("Uploaded");
    });

    it("should show/hide badge when activePdfName changes", async () => {
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: "test.pdf",
        },
      });

      let badge = wrapper.find(".chat__badge");
      expect(badge.exists()).toBe(true);

      await wrapper.setProps({ activePdfName: null });
      badge = wrapper.find(".chat__badge");
      expect(badge.exists()).toBe(false);
    });
  });

  describe("CSS Structure", () => {
    it("should have chat__header class", () => {
      const wrapper = mount(ChatHeader);
      const header = wrapper.find("header");
      expect(header.classes()).toContain("chat__header");
    });

    it("should have chat__subhead class for subtitle", () => {
      const wrapper = mount(ChatHeader);
      const subhead = wrapper.find(".chat__subhead");
      expect(subhead.exists()).toBe(true);
    });

    it("should have chat__badge-name class when PDF is shown", () => {
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: "test.pdf",
        },
      });
      const badgeName = wrapper.find(".chat__badge-name");
      expect(badgeName.exists()).toBe(true);
    });

    it("should have chat__badge-status class when PDF is shown", () => {
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: "test.pdf",
        },
      });
      const badgeStatus = wrapper.find(".chat__badge-status");
      expect(badgeStatus.exists()).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string as activePdfName", () => {
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: "",
        },
      });
      // Empty string is falsy, so badge should not show
      const badge = wrapper.find(".chat__badge");
      expect(badge.exists()).toBe(false);
    });

    it("should handle special characters in filename", () => {
      const specialName = "test@#$%^&()_+-=.pdf";
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: specialName,
        },
      });
      expect(wrapper.text()).toContain(specialName);
    });

    it("should handle unicode in filename", () => {
      const unicodeName = "文档_مستند_Документ.pdf";
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: unicodeName,
        },
      });
      expect(wrapper.text()).toContain(unicodeName);
    });

    it("should handle filename with spaces", () => {
      const nameWithSpaces = "my test document.pdf";
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: nameWithSpaces,
        },
      });
      expect(wrapper.text()).toContain(nameWithSpaces);
    });
  });

  describe("Layout Structure", () => {
    it("should have proper header structure", () => {
      const wrapper = mount(ChatHeader);
      const header = wrapper.find("header");
      expect(header.exists()).toBe(true);
      expect(header.element.children.length).toBeGreaterThan(0);
    });

    it("should contain title and subtitle in first section", () => {
      const wrapper = mount(ChatHeader);
      const divs = wrapper.findAll("div");
      expect(divs.length).toBeGreaterThan(0);
      expect(wrapper.text()).toContain("ChatPDF");
      expect(wrapper.text()).toContain("Discuss the uploaded PDF");
    });
  });

  describe("Accessibility", () => {
    it("should use semantic header element", () => {
      const wrapper = mount(ChatHeader);
      const header = wrapper.find("header");
      expect(header.element.tagName).toBe("HEADER");
    });

    it("should use semantic h1 for main title", () => {
      const wrapper = mount(ChatHeader);
      const h1 = wrapper.find("h1");
      expect(h1.element.tagName).toBe("H1");
    });

    it("should have readable text content", () => {
      const wrapper = mount(ChatHeader);
      const text = wrapper.text();
      expect(text.trim().length).toBeGreaterThan(0);
    });
  });

  describe("Stateless Behavior", () => {
    it("should not emit any events", () => {
      const wrapper = mount(ChatHeader);
      expect(Object.keys(wrapper.emitted())).toHaveLength(0);
    });

    it("should be a purely presentational component", () => {
      const wrapper = mount(ChatHeader, {
        props: {
          activePdfName: "test.pdf",
          uploadStatus: "success" as UploadStatus,
        },
      });
      // No interactive elements that emit events
      expect(Object.keys(wrapper.emitted())).toHaveLength(0);
    });
  });

  describe("Mount and Unmount", () => {
    it("should mount successfully", () => {
      const wrapper = mount(ChatHeader);
      expect(wrapper.vm).toBeTruthy();
      expect(wrapper.element).toBeTruthy();
    });

    it("should unmount cleanly", () => {
      const wrapper = mount(ChatHeader, {
        attachTo: document.body,
      });

      expect(document.body.contains(wrapper.element)).toBe(true);
      wrapper.unmount();
      expect(document.body.contains(wrapper.element)).toBe(false);
    });

    it("should handle multiple mount/unmount cycles", () => {
      for (let i = 0; i < 5; i++) {
        const wrapper = mount(ChatHeader, {
          attachTo: document.body,
        });
        expect(wrapper.exists()).toBe(true);
        wrapper.unmount();
      }
    });
  });

  describe("Multiple Instances", () => {
    it("should render multiple instances independently", () => {
      const wrapper1 = mount(ChatHeader, {
        props: { activePdfName: "first.pdf" },
      });
      const wrapper2 = mount(ChatHeader, {
        props: { activePdfName: "second.pdf" },
      });

      expect(wrapper1.text()).toContain("first.pdf");
      expect(wrapper2.text()).toContain("second.pdf");
    });

    it("should not share state between instances", () => {
      const wrapper1 = mount(ChatHeader);
      const wrapper2 = mount(ChatHeader);

      expect(wrapper1.vm).not.toBe(wrapper2.vm);
    });
  });
});
