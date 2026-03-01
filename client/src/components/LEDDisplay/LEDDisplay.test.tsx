import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LEDDisplay } from "./index";

describe("LEDDisplay", () => {
  it("renders the token count zero-padded to 6 digits", () => {
    render(<LEDDisplay count={42} />);
    expect(screen.getByText("000042")).toBeInTheDocument();
  });

  it("renders zero as 000000", () => {
    render(<LEDDisplay count={0} />);
    expect(screen.getByText("000000")).toBeInTheDocument();
  });

  it("renders large numbers correctly", () => {
    render(<LEDDisplay count={123456} />);
    expect(screen.getByText("123456")).toBeInTheDocument();
  });

  it("rolls over at 999999", () => {
    render(<LEDDisplay count={1000042} />);
    expect(screen.getByText("000042")).toBeInTheDocument();
  });

  it("has the background segments for the LED effect", () => {
    const { container } = render(<LEDDisplay count={0} />);
    const background = container.querySelector(".background");
    expect(background).toBeInTheDocument();
  });

  it("has an accessible label", () => {
    render(<LEDDisplay count={42} />);
    const display = screen.getByLabelText("Token count: 42");
    expect(display).toBeInTheDocument();
  });
});
