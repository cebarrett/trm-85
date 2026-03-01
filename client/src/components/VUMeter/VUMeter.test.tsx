import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VUMeter } from "./index";

describe("VUMeter", () => {
  it("renders the dB label", () => {
    render(<VUMeter tokenRate={0} temperature={0.5} />);
    expect(screen.getByText("dB")).toBeInTheDocument();
  });

  it("renders a needle element", () => {
    const { container } = render(
      <VUMeter tokenRate={0} temperature={0.5} />
    );
    const needle = container.querySelector(".needle");
    expect(needle).toBeInTheDocument();
  });

  it("renders the VU label", () => {
    render(<VUMeter tokenRate={0} temperature={0.5} />);
    expect(screen.getByText("VU")).toBeInTheDocument();
  });

  it("has a glass cover overlay", () => {
    const { container } = render(
      <VUMeter tokenRate={0} temperature={0.5} />
    );
    const glass = container.querySelector(".glass");
    expect(glass).toBeInTheDocument();
  });
});
