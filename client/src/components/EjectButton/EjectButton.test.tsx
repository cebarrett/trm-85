import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EjectButton } from "./index";

describe("EjectButton", () => {
  it("renders the EJECT label", () => {
    render(<EjectButton onEject={() => {}} disabled={false} />);
    expect(screen.getByText("EJECT")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(<EjectButton onEject={() => {}} disabled={true} />);
    const button = screen.getByRole("button", { name: /eject/i });
    expect(button).toBeDisabled();
  });

  it("is enabled when disabled prop is false", () => {
    render(<EjectButton onEject={() => {}} disabled={false} />);
    const button = screen.getByRole("button", { name: /eject/i });
    expect(button).not.toBeDisabled();
  });

  it("calls onEject when clicked", async () => {
    const onEject = vi.fn();
    render(<EjectButton onEject={onEject} disabled={false} />);
    const button = screen.getByRole("button", { name: /eject/i });

    await userEvent.click(button);
    expect(onEject).toHaveBeenCalledTimes(1);
  });

  it("does not call onEject when disabled", async () => {
    const onEject = vi.fn();
    render(<EjectButton onEject={onEject} disabled={true} />);
    const button = screen.getByRole("button", { name: /eject/i });

    await userEvent.click(button);
    expect(onEject).not.toHaveBeenCalled();
  });
});
