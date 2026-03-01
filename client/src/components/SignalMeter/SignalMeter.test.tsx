import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SignalMeter } from "./index";

describe("SignalMeter", () => {
  it("renders 20 segments", () => {
    const { container } = render(<SignalMeter temperature={0.5} />);
    const segments = container.querySelectorAll(".segment");
    expect(segments).toHaveLength(20);
  });

  it("lights more segments at low temperature", () => {
    const { container } = render(<SignalMeter temperature={0.0} />);
    const litSegments = container.querySelectorAll(".lit");
    expect(litSegments.length).toBe(20);
  });

  it("lights fewer segments at high temperature", () => {
    const { container } = render(<SignalMeter temperature={1.0} />);
    const litSegments = container.querySelectorAll(".lit");
    expect(litSegments.length).toBeLessThan(10);
  });

  it("lights zero segments at max temperature", () => {
    const { container } = render(<SignalMeter temperature={1.1} />);
    const litSegments = container.querySelectorAll(".lit");
    expect(litSegments.length).toBe(0);
  });

  it("has the SIGNAL label", () => {
    render(<SignalMeter temperature={0.5} />);
    expect(screen.getByText("SIGNAL")).toBeInTheDocument();
  });

  it("has the COHERENCE sublabel", () => {
    render(<SignalMeter temperature={0.5} />);
    expect(screen.getByText("COHERENCE")).toBeInTheDocument();
  });
});
