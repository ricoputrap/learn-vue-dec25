import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ChatMessages from "../ChatMessages.vue";
import type { ChatMessage } from "../../types";

describe("ChatMessages", () => {
  const createMessage = (
    id: string,
    sender: string,
    text: string,
    createdAt: number = Date.now(),
  ): ChatMessage => ({
    id,
    sender,
    text,
    createdAt,
  });

  describe("Component Rendering", () => {
    it("should render the component", () => {
      const wrapper = mount(ChatMessages, {
        props: {
          messages: [],
        },
      });

      expect(wrapper.exists()).toBe(true);
    });

    it("should render main element", () => {
      const wrapper = mount(ChatMessages, {
        props: {
          messages: [],
        },
      });

      const main = wrapper.find("main");
      expect(main.exists()).toBe(true);
    });

    it("should have aria-live attribute for accessibility", () => {
      const wrapper = mount(ChatMessages, {
        props: {
          messages: [],
        },
      });

      const main = wrapper.find("main");
      expect(main.attributes("aria-live")).toBe("polite");
    });

    it("should have chat__messages class", () => {
      const wrapper = mount(ChatMessages, {
        props: {
          messages: [],
        },
      });

      const main = wrapper.find("main");
      expect(main.classes()).toContain("chat__messages");
    });
  });

  describe("Empty State", () => {
    it("should show empty message when no messages", () => {
      const wrapper = mount(ChatMessages, {
        props: {
          messages: [],
        },
      });

      expect(wrapper.text()).toContain("No messages yet. Say hi!");
    });

    it("should show empty message with correct class", () => {
      const wrapper = mount(ChatMessages, {
        props: {
          messages: [],
        },
      });

      const emptyMessage = wrapper.find(".chat__empty");
      expect(emptyMessage.exists()).toBe(true);
    });

    it("should not show list when no messages", () => {
      const wrapper = mount(ChatMessages, {
        props: {
          messages: [],
        },
      });

      const list = wrapper.find("ul");
      expect(list.exists()).toBe(false);
    });
  });

  describe("Message Display", () => {
    it("should display a single message", () => {
      const message = createMessage("1", "You", "Hello!");

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      expect(wrapper.text()).toContain("Hello!");
    });

    it("should display message sender", () => {
      const message = createMessage("1", "You", "Hello!");

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      expect(wrapper.text()).toContain("You");
    });

    it("should display multiple messages", () => {
      const messages = [
        createMessage("1", "You", "First message"),
        createMessage("2", "Assistant", "Second message"),
        createMessage("3", "You", "Third message"),
      ];

      const wrapper = mount(ChatMessages, {
        props: {
          messages,
        },
      });

      expect(wrapper.text()).toContain("First message");
      expect(wrapper.text()).toContain("Second message");
      expect(wrapper.text()).toContain("Third message");
    });

    it("should render messages in a list", () => {
      const messages = [
        createMessage("1", "You", "Test"),
        createMessage("2", "Assistant", "Response"),
      ];

      const wrapper = mount(ChatMessages, {
        props: {
          messages,
        },
      });

      const list = wrapper.find("ul");
      expect(list.exists()).toBe(true);

      const items = wrapper.findAll("li");
      expect(items).toHaveLength(2);
    });
  });

  describe("Message Sender Attribution", () => {
    it('should apply data-sender="you" for user messages', () => {
      const message = createMessage("1", "You", "My message");

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      const item = wrapper.find("li");
      expect(item.attributes("data-sender")).toBe("you");
    });

    it('should apply data-sender="system" for assistant messages', () => {
      const message = createMessage("1", "Assistant", "AI response");

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      const item = wrapper.find("li");
      expect(item.attributes("data-sender")).toBe("system");
    });

    it('should apply data-sender="system" for non-You senders', () => {
      const message = createMessage("1", "Bot", "Bot response");

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      const item = wrapper.find("li");
      expect(item.attributes("data-sender")).toBe("system");
    });
  });

  describe("Message Metadata", () => {
    it("should display message timestamp", () => {
      const timestamp = new Date("2024-01-15T10:30:00").getTime();
      const message = createMessage("1", "You", "Test", timestamp);

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      const timeElement = wrapper.find(".chat__time");
      expect(timeElement.exists()).toBe(true);
      // Should contain formatted time
      expect(timeElement.text()).toBeTruthy();
    });

    it("should display sender name in metadata", () => {
      const message = createMessage("1", "You", "Test");

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      const senderElement = wrapper.find(".chat__sender");
      expect(senderElement.exists()).toBe(true);
      expect(senderElement.text()).toBe("You");
    });

    it("should have metadata section", () => {
      const message = createMessage("1", "You", "Test");

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      const meta = wrapper.find(".chat__meta");
      expect(meta.exists()).toBe(true);
    });
  });

  describe("Message Content", () => {
    it("should display message text", () => {
      const message = createMessage("1", "You", "Hello World");

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      const textElement = wrapper.find(".chat__text");
      expect(textElement.exists()).toBe(true);
      expect(textElement.text()).toBe("Hello World");
    });

    it("should handle multiline text", () => {
      const multilineText = "Line 1\nLine 2\nLine 3";
      const message = createMessage("1", "You", multilineText);

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      expect(wrapper.text()).toContain("Line 1");
      expect(wrapper.text()).toContain("Line 2");
      expect(wrapper.text()).toContain("Line 3");
    });

    it("should handle special characters", () => {
      const specialText = "!@#$%^&*()_+-={}[]|\\:\";'<>?,./~`";
      const message = createMessage("1", "You", specialText);

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      expect(wrapper.text()).toContain(specialText);
    });

    it("should handle unicode and emoji", () => {
      const unicodeText = "你好 🚀 مرحبا Привет 😀";
      const message = createMessage("1", "You", unicodeText);

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      expect(wrapper.text()).toContain(unicodeText);
    });

    it("should handle very long text", () => {
      const longText = "a".repeat(1000);
      const message = createMessage("1", "You", longText);

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      expect(wrapper.text()).toContain(longText);
    });

    it("should handle empty text", () => {
      const message = createMessage("1", "You", "");

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      const textElement = wrapper.find(".chat__text");
      expect(textElement.exists()).toBe(true);
    });
  });

  describe("CSS Structure", () => {
    it("should apply chat__item class to messages", () => {
      const message = createMessage("1", "You", "Test");

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      const item = wrapper.find(".chat__item");
      expect(item.exists()).toBe(true);
    });

    it("should apply chat__sender class", () => {
      const message = createMessage("1", "You", "Test");

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      const sender = wrapper.find(".chat__sender");
      expect(sender.exists()).toBe(true);
    });

    it("should apply chat__time class", () => {
      const message = createMessage("1", "You", "Test");

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      const time = wrapper.find(".chat__time");
      expect(time.exists()).toBe(true);
    });

    it("should apply chat__text class", () => {
      const message = createMessage("1", "You", "Test");

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      const text = wrapper.find(".chat__text");
      expect(text.exists()).toBe(true);
    });
  });

  describe("Props Handling", () => {
    it("should accept messages prop", () => {
      const messages = [createMessage("1", "You", "Test")];

      const wrapper = mount(ChatMessages, {
        props: {
          messages,
        },
      });

      expect(wrapper.props("messages")).toEqual(messages);
    });

    it("should handle empty messages array", () => {
      const wrapper = mount(ChatMessages, {
        props: {
          messages: [],
        },
      });

      expect(wrapper.props("messages")).toEqual([]);
      expect(wrapper.text()).toContain("No messages yet");
    });

    it("should react to messages prop changes", async () => {
      const wrapper = mount(ChatMessages, {
        props: {
          messages: [],
        },
      });

      expect(wrapper.text()).toContain("No messages yet");

      const newMessages = [createMessage("1", "You", "New message")];
      await wrapper.setProps({ messages: newMessages });

      expect(wrapper.text()).toContain("New message");
      expect(wrapper.text()).not.toContain("No messages yet");
    });

    it("should update when messages are added", async () => {
      const initialMessages = [createMessage("1", "You", "First")];

      const wrapper = mount(ChatMessages, {
        props: {
          messages: initialMessages,
        },
      });

      expect(wrapper.text()).toContain("First");

      const updatedMessages = [
        ...initialMessages,
        createMessage("2", "Assistant", "Second"),
      ];

      await wrapper.setProps({ messages: updatedMessages });

      expect(wrapper.text()).toContain("First");
      expect(wrapper.text()).toContain("Second");
    });
  });

  describe("Time Formatting", () => {
    it("should format timestamp as time string", () => {
      const timestamp = new Date("2024-01-15T14:30:00").getTime();
      const message = createMessage("1", "You", "Test", timestamp);

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      const timeElement = wrapper.find(".chat__time");
      // Should contain time-related text (format depends on locale)
      expect(timeElement.text().length).toBeGreaterThan(0);
    });

    it("should handle different timestamps", () => {
      const messages = [
        createMessage(
          "1",
          "You",
          "Morning",
          new Date("2024-01-15T09:00:00").getTime(),
        ),
        createMessage(
          "2",
          "Assistant",
          "Afternoon",
          new Date("2024-01-15T14:00:00").getTime(),
        ),
        createMessage(
          "3",
          "You",
          "Evening",
          new Date("2024-01-15T19:00:00").getTime(),
        ),
      ];

      const wrapper = mount(ChatMessages, {
        props: {
          messages,
        },
      });

      const timeElements = wrapper.findAll(".chat__time");
      expect(timeElements).toHaveLength(3);
      timeElements.forEach((el) => {
        expect(el.text().length).toBeGreaterThan(0);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle duplicate message IDs", () => {
      const messages = [
        createMessage("duplicate", "You", "First"),
        createMessage("duplicate", "Assistant", "Second"),
      ];

      const wrapper = mount(ChatMessages, {
        props: {
          messages,
        },
      });

      expect(wrapper.findAll("li")).toHaveLength(2);
    });

    it("should handle very old timestamps", () => {
      const message = createMessage("1", "You", "Old message", 0);

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      expect(wrapper.text()).toContain("Old message");
    });

    it("should handle future timestamps", () => {
      const futureTime = Date.now() + 1000000000;
      const message = createMessage("1", "You", "Future message", futureTime);

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      expect(wrapper.text()).toContain("Future message");
    });

    it("should handle many messages", () => {
      const messages = Array.from({ length: 100 }, (_, i) =>
        createMessage(
          String(i),
          i % 2 === 0 ? "You" : "Assistant",
          `Message ${i}`,
        ),
      );

      const wrapper = mount(ChatMessages, {
        props: {
          messages,
        },
      });

      expect(wrapper.findAll("li")).toHaveLength(100);
    });

    it("should handle messages with same timestamp", () => {
      const timestamp = Date.now();
      const messages = [
        createMessage("1", "You", "First", timestamp),
        createMessage("2", "Assistant", "Second", timestamp),
        createMessage("3", "You", "Third", timestamp),
      ];

      const wrapper = mount(ChatMessages, {
        props: {
          messages,
        },
      });

      expect(wrapper.findAll("li")).toHaveLength(3);
    });
  });

  describe("Accessibility", () => {
    it("should use semantic HTML", () => {
      const message = createMessage("1", "You", "Test");

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      expect(wrapper.find("main").exists()).toBe(true);
      expect(wrapper.find("ul").exists()).toBe(true);
      expect(wrapper.find("li").exists()).toBe(true);
    });

    it("should have aria-live for screen readers", () => {
      const wrapper = mount(ChatMessages, {
        props: {
          messages: [],
        },
      });

      const main = wrapper.find("main");
      expect(main.attributes("aria-live")).toBe("polite");
    });

    it("should have readable text content", () => {
      const message = createMessage("1", "You", "Accessible content");

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      expect(wrapper.text()).toContain("Accessible content");
    });
  });

  describe("Stateless Behavior", () => {
    it("should not emit any events", () => {
      const message = createMessage("1", "You", "Test");

      const wrapper = mount(ChatMessages, {
        props: {
          messages: [message],
        },
      });

      expect(Object.keys(wrapper.emitted())).toHaveLength(0);
    });

    it("should be a purely presentational component", () => {
      const wrapper = mount(ChatMessages, {
        props: {
          messages: [],
        },
      });

      expect(wrapper.vm).toBeTruthy();
    });
  });

  describe("Mount and Unmount", () => {
    it("should mount successfully", () => {
      const wrapper = mount(ChatMessages, {
        props: {
          messages: [],
        },
      });

      expect(wrapper.vm).toBeTruthy();
      expect(wrapper.element).toBeTruthy();
    });

    it("should unmount cleanly", () => {
      const wrapper = mount(ChatMessages, {
        props: {
          messages: [],
        },
        attachTo: document.body,
      });

      expect(document.body.contains(wrapper.element)).toBe(true);
      wrapper.unmount();
      expect(document.body.contains(wrapper.element)).toBe(false);
    });

    it("should handle multiple mount/unmount cycles", () => {
      for (let i = 0; i < 5; i++) {
        const wrapper = mount(ChatMessages, {
          props: {
            messages: [],
          },
          attachTo: document.body,
        });

        expect(wrapper.exists()).toBe(true);
        wrapper.unmount();
      }
    });
  });

  describe("Multiple Instances", () => {
    it("should render multiple instances independently", () => {
      const messages1 = [createMessage("1", "You", "First instance")];
      const messages2 = [createMessage("1", "You", "Second instance")];

      const wrapper1 = mount(ChatMessages, {
        props: { messages: messages1 },
      });
      const wrapper2 = mount(ChatMessages, {
        props: { messages: messages2 },
      });

      expect(wrapper1.text()).toContain("First instance");
      expect(wrapper2.text()).toContain("Second instance");
    });

    it("should not share state between instances", () => {
      const wrapper1 = mount(ChatMessages, {
        props: { messages: [] },
      });
      const wrapper2 = mount(ChatMessages, {
        props: { messages: [] },
      });

      expect(wrapper1.vm).not.toBe(wrapper2.vm);
    });
  });
});
