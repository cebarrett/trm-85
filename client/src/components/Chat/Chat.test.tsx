import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Chat } from "./index";

const mockMessages = [
  { role: "user" as const, content: "Hello", temperature: 0.5, timestamp: 1 },
  {
    role: "assistant" as const,
    content: "Hi there!",
    temperature: 0.5,
    timestamp: 2,
  },
];

describe("Chat", () => {
  it("renders messages with INPUT and OUTPUT labels", () => {
    render(
      <Chat
        messages={mockMessages}
        currentStreamedText=""
        isGenerating={false}
        onSendMessage={() => {}}
      />
    );
    expect(screen.getByText("INPUT >")).toBeInTheDocument();
    expect(screen.getByText("OUTPUT >")).toBeInTheDocument();
  });

  it("renders message content", () => {
    render(
      <Chat
        messages={mockMessages}
        currentStreamedText=""
        isGenerating={false}
        onSendMessage={() => {}}
      />
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hi there!")).toBeInTheDocument();
  });

  it("shows streaming text during generation", () => {
    render(
      <Chat
        messages={[mockMessages[0]]}
        currentStreamedText="Streaming..."
        isGenerating={true}
        onSendMessage={() => {}}
      />
    );
    expect(screen.getByText("Streaming...")).toBeInTheDocument();
  });

  it("has a text input and TRANSMIT button", () => {
    render(
      <Chat
        messages={[]}
        currentStreamedText=""
        isGenerating={false}
        onSendMessage={() => {}}
      />
    );
    expect(screen.getByPlaceholderText(/enter prompt/i)).toBeInTheDocument();
    expect(screen.getByText("TRANSMIT")).toBeInTheDocument();
  });

  it("calls onSendMessage when form is submitted", async () => {
    const onSend = vi.fn();
    render(
      <Chat
        messages={[]}
        currentStreamedText=""
        isGenerating={false}
        onSendMessage={onSend}
      />
    );

    const input = screen.getByPlaceholderText(/enter prompt/i);
    await userEvent.type(input, "Test message");
    await userEvent.click(screen.getByText("TRANSMIT"));

    expect(onSend).toHaveBeenCalledWith("Test message");
  });

  it("clears input after sending", async () => {
    render(
      <Chat
        messages={[]}
        currentStreamedText=""
        isGenerating={false}
        onSendMessage={() => {}}
      />
    );

    const input = screen.getByPlaceholderText(/enter prompt/i);
    await userEvent.type(input, "Test message");
    await userEvent.click(screen.getByText("TRANSMIT"));

    expect(input).toHaveValue("");
  });

  it("disables input during generation", () => {
    render(
      <Chat
        messages={[]}
        currentStreamedText=""
        isGenerating={true}
        onSendMessage={() => {}}
      />
    );

    const input = screen.getByPlaceholderText(/enter prompt/i);
    expect(input).toBeDisabled();
  });

  it("does not send empty messages", async () => {
    const onSend = vi.fn();
    render(
      <Chat
        messages={[]}
        currentStreamedText=""
        isGenerating={false}
        onSendMessage={onSend}
      />
    );

    await userEvent.click(screen.getByText("TRANSMIT"));
    expect(onSend).not.toHaveBeenCalled();
  });
});
