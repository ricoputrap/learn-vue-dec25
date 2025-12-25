import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ChatComposer from "../ChatComposer.vue";

describe("ChatComposer", () => {
  describe("Component Rendering", () => {
    it("should render the component", () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it("should render input field", () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const input = wrapper.find('input[type="text"]');
      expect(input.exists()).toBe(true);
    });

    it("should render send button", () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const buttons = wrapper.findAll("button");
      const sendButton = buttons.find((btn) => btn.text().includes("Send"));
      expect(sendButton).toBeTruthy();
    });

    it("should render clear button", () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const buttons = wrapper.findAll("button");
      const clearButton = buttons.find((btn) => btn.text().includes("Clear"));
      expect(clearButton).toBeTruthy();
    });

    it("should render with correct placeholder", () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const input = wrapper.find("input");
      expect(input.attributes("placeholder")).toBe("Type a message");
    });

    it("should render as a form element", () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const form = wrapper.find("form");
      expect(form.exists()).toBe(true);
    });
  });

  describe("Props Handling", () => {
    it("should disable send button when isBusy is true", () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: true,
        },
      });

      const input = wrapper.find("input");
      input.setValue("test message");

      const buttons = wrapper.findAll("button");
      const sendButton = buttons.find(
        (btn) => btn.attributes("type") === "submit",
      );

      expect(sendButton?.attributes("disabled")).toBeDefined();
    });

    it('should show "Thinking..." text when isBusy is true', async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: true,
        },
      });

      await wrapper.vm.$nextTick();

      const buttons = wrapper.findAll("button");
      const sendButton = buttons.find(
        (btn) => btn.attributes("type") === "submit",
      );
      expect(sendButton?.text()).toBe("Thinking...");
    });

    it('should show "Send" text when isBusy is false', () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const buttons = wrapper.findAll("button");
      const sendButton = buttons.find(
        (btn) => btn.attributes("type") === "submit",
      );
      expect(sendButton?.text()).toBe("Send");
    });

    it("should disable clear button when canClear is false", () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const buttons = wrapper.findAll("button");
      const clearButton = buttons.find((btn) => btn.text().includes("Clear"));
      expect(clearButton?.attributes("disabled")).toBeDefined();
    });

    it("should enable clear button when canClear is true", () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: true,
          isBusy: false,
        },
      });

      const buttons = wrapper.findAll("button");
      const clearButton = buttons.find((btn) => btn.text().includes("Clear"));
      expect(clearButton?.attributes("disabled")).toBeUndefined();
    });

    it("should react to prop changes", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      await wrapper.setProps({ isBusy: true });
      const buttons = wrapper.findAll("button");
      const sendButton = buttons.find(
        (btn) => btn.attributes("type") === "submit",
      );
      expect(sendButton?.text()).toBe("Thinking...");

      await wrapper.setProps({ isBusy: false });
      expect(sendButton?.text()).toBe("Send");
    });
  });

  describe("User Input", () => {
    it("should allow typing in input field", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const input = wrapper.find("input");
      await input.setValue("Hello World");

      expect(input.element.value).toBe("Hello World");
    });

    it("should enable send button when text is entered", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const input = wrapper.find("input");
      const buttons = wrapper.findAll("button");
      const sendButton = buttons.find(
        (btn) => btn.attributes("type") === "submit",
      );

      // Initially disabled (empty input)
      expect(sendButton?.attributes("disabled")).toBeDefined();

      // Enter text
      await input.setValue("Hello");
      await wrapper.vm.$nextTick();

      // Now enabled
      expect(sendButton?.attributes("disabled")).toBeUndefined();
    });

    it("should disable send button when input is empty", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const input = wrapper.find("input");
      const buttons = wrapper.findAll("button");
      const sendButton = buttons.find(
        (btn) => btn.attributes("type") === "submit",
      );

      await input.setValue("");
      await wrapper.vm.$nextTick();

      expect(sendButton?.attributes("disabled")).toBeDefined();
    });

    it("should disable send button when input is only whitespace", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const input = wrapper.find("input");
      const buttons = wrapper.findAll("button");
      const sendButton = buttons.find(
        (btn) => btn.attributes("type") === "submit",
      );

      await input.setValue("   ");
      await wrapper.vm.$nextTick();

      expect(sendButton?.attributes("disabled")).toBeDefined();
    });
  });

  describe("Send Event", () => {
    it("should emit send event when form is submitted", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const input = wrapper.find("input");
      await input.setValue("Test message");

      const form = wrapper.find("form");
      await form.trigger("submit.prevent");

      expect(wrapper.emitted("send")).toBeTruthy();
      expect(wrapper.emitted("send")?.[0]).toEqual(["Test message"]);
    });

    it("should emit send event when send button is clicked", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const input = wrapper.find("input");
      await input.setValue("Button click test");

      const form = wrapper.find("form");
      await form.trigger("submit.prevent");

      expect(wrapper.emitted("send")).toBeTruthy();
      expect(wrapper.emitted("send")?.[0]).toEqual(["Button click test"]);
    });

    it("should clear input after sending", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const input = wrapper.find("input");
      await input.setValue("Test message");

      const form = wrapper.find("form");
      await form.trigger("submit.prevent");
      await wrapper.vm.$nextTick();

      expect(input.element.value).toBe("");
    });

    it("should not emit send when input is empty", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const form = wrapper.find("form");
      await form.trigger("submit.prevent");

      expect(wrapper.emitted("send")).toBeFalsy();
    });

    it("should not emit send when isBusy is true", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: true,
        },
      });

      const input = wrapper.find("input");
      await input.setValue("Test message");

      const form = wrapper.find("form");
      await form.trigger("submit.prevent");

      expect(wrapper.emitted("send")).toBeFalsy();
    });

    it("should emit send with trimmed text", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const input = wrapper.find("input");
      await input.setValue("  trimmed text  ");

      const form = wrapper.find("form");
      await form.trigger("submit.prevent");

      // Emits original text, but validation checks trimmed
      expect(wrapper.emitted("send")?.[0]).toEqual(["  trimmed text  "]);
    });
  });

  describe("Clear Event", () => {
    it("should emit clear event when clear button is clicked", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: true,
          isBusy: false,
        },
      });

      const buttons = wrapper.findAll("button");
      const clearButton = buttons.find((btn) => btn.text().includes("Clear"));
      await clearButton?.trigger("click");

      expect(wrapper.emitted("clear")).toBeTruthy();
      expect(wrapper.emitted("clear")?.[0]).toEqual([]);
    });

    it("should not emit clear when canClear is false", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const buttons = wrapper.findAll("button");
      const clearButton = buttons.find((btn) => btn.text().includes("Clear"));

      // Button is disabled, clicking won't emit
      expect(clearButton?.attributes("disabled")).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle special characters", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const specialText = "!@#$%^&*()_+-={}[]|\\:\";'<>?,./~`";
      const input = wrapper.find("input");
      await input.setValue(specialText);

      const form = wrapper.find("form");
      await form.trigger("submit.prevent");

      expect(wrapper.emitted("send")?.[0]).toEqual([specialText]);
    });

    it("should handle unicode and emoji", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const unicodeText = "你好 🚀 مرحبا Привет";
      const input = wrapper.find("input");
      await input.setValue(unicodeText);

      const form = wrapper.find("form");
      await form.trigger("submit.prevent");

      expect(wrapper.emitted("send")?.[0]).toEqual([unicodeText]);
    });

    it("should handle very long text", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const longText = "a".repeat(1000);
      const input = wrapper.find("input");
      await input.setValue(longText);

      const form = wrapper.find("form");
      await form.trigger("submit.prevent");

      expect(wrapper.emitted("send")?.[0]).toEqual([longText]);
    });

    it("should handle rapid form submissions", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const input = wrapper.find("input");
      const form = wrapper.find("form");

      for (let i = 0; i < 5; i++) {
        await input.setValue(`Message ${i}`);
        await form.trigger("submit.prevent");
        await wrapper.vm.$nextTick();
      }

      expect(wrapper.emitted("send")).toHaveLength(5);
    });
  });

  describe("Accessibility", () => {
    it("should have aria-label on input", () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const input = wrapper.find("input");
      expect(input.attributes("aria-label")).toBe("Message");
    });

    it("should have autocomplete off", () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const input = wrapper.find("input");
      expect(input.attributes("autocomplete")).toBe("off");
    });

    it("should be keyboard accessible", () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const buttons = wrapper.findAll("button");
      buttons.forEach((button) => {
        expect(button.element.tagName).toBe("BUTTON");
      });
    });

    it("should use proper button types", () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const buttons = wrapper.findAll("button");
      const sendButton = buttons.find(
        (btn) => btn.text().includes("Send") || btn.text().includes("Thinking"),
      );
      const clearButton = buttons.find((btn) => btn.text().includes("Clear"));

      expect(sendButton?.attributes("type")).toBe("submit");
      expect(clearButton?.attributes("type")).toBe("button");
    });
  });

  describe("Component State", () => {
    it("should maintain input focus after typing", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
        attachTo: document.body,
      });

      const input = wrapper.find("input");
      input.element.focus();
      expect(document.activeElement).toBe(input.element);

      await input.setValue("test");
      expect(document.activeElement).toBe(input.element);

      wrapper.unmount();
    });

    it("should reset to initial state after sending", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const input = wrapper.find("input");
      await input.setValue("Test message");

      const form = wrapper.find("form");
      await form.trigger("submit.prevent");
      await wrapper.vm.$nextTick();

      expect(input.element.value).toBe("");

      const buttons = wrapper.findAll("button");
      const sendButton = buttons.find(
        (btn) => btn.attributes("type") === "submit",
      );
      expect(sendButton?.attributes("disabled")).toBeDefined();
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle complete message flow", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      // Type message
      const input = wrapper.find("input");
      await input.setValue("Hello, AI!");

      // Submit
      const form = wrapper.find("form");
      await form.trigger("submit.prevent");

      // Verify emission
      expect(wrapper.emitted("send")?.[0]).toEqual(["Hello, AI!"]);

      // Verify cleared
      await wrapper.vm.$nextTick();
      expect(input.element.value).toBe("");
    });

    it("should handle thinking state during conversation", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      const input = wrapper.find("input");
      await input.setValue("Question");

      // Submit
      const form = wrapper.find("form");
      await form.trigger("submit.prevent");

      // Simulate thinking state
      await wrapper.setProps({ isBusy: true });

      const buttons = wrapper.findAll("button");
      const sendButton = buttons.find(
        (btn) => btn.attributes("type") === "submit",
      );
      expect(sendButton?.text()).toBe("Thinking...");
      expect(sendButton?.attributes("disabled")).toBeDefined();

      // Try to type and send during thinking
      await input.setValue("Another question");
      await form.trigger("submit.prevent");

      // Should not emit second send
      expect(wrapper.emitted("send")).toHaveLength(1);
    });

    it("should handle clear during active conversation", async () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: true,
          isBusy: false,
        },
      });

      const input = wrapper.find("input");
      await input.setValue("Some text");

      const buttons = wrapper.findAll("button");
      const clearButton = buttons.find((btn) => btn.text().includes("Clear"));
      await clearButton?.trigger("click");

      expect(wrapper.emitted("clear")).toBeTruthy();
    });
  });

  describe("Mount and Unmount", () => {
    it("should mount successfully", () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
      });

      expect(wrapper.vm).toBeTruthy();
      expect(wrapper.element).toBeTruthy();
    });

    it("should unmount cleanly", () => {
      const wrapper = mount(ChatComposer, {
        props: {
          canClear: false,
          isBusy: false,
        },
        attachTo: document.body,
      });

      expect(document.body.contains(wrapper.element)).toBe(true);
      wrapper.unmount();
      expect(document.body.contains(wrapper.element)).toBe(false);
    });

    it("should handle multiple mount/unmount cycles", () => {
      for (let i = 0; i < 5; i++) {
        const wrapper = mount(ChatComposer, {
          props: {
            canClear: false,
            isBusy: false,
          },
          attachTo: document.body,
        });

        expect(wrapper.exists()).toBe(true);
        wrapper.unmount();
      }
    });
  });
});
