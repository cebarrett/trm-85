import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Knob } from "./index";

describe("Knob", () => {
  it("renders with the correct aria attributes", () => {
    render(
      <Knob temperature={0.5} onTemperatureChange={() => {}} />
    );
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "1.1");
    expect(slider).toHaveAttribute("aria-valuenow", "0.5");
    expect(slider).toHaveAttribute("aria-label", "Temperature");
  });

  it("displays the current temperature value", () => {
    render(
      <Knob temperature={0.73} onTemperatureChange={() => {}} />
    );
    expect(screen.getByText("0.73")).toBeInTheDocument();
  });

  it("increases temperature on ArrowUp key", () => {
    const onChange = vi.fn();
    render(<Knob temperature={0.5} onTemperatureChange={onChange} />);
    const slider = screen.getByRole("slider");

    fireEvent.keyDown(slider, { key: "ArrowUp" });
    expect(onChange).toHaveBeenCalledWith(0.51);
  });

  it("decreases temperature on ArrowDown key", () => {
    const onChange = vi.fn();
    render(<Knob temperature={0.5} onTemperatureChange={onChange} />);
    const slider = screen.getByRole("slider");

    fireEvent.keyDown(slider, { key: "ArrowDown" });
    expect(onChange).toHaveBeenCalledWith(0.49);
  });

  it("increases by 0.1 on PageUp key", () => {
    const onChange = vi.fn();
    render(<Knob temperature={0.5} onTemperatureChange={onChange} />);
    const slider = screen.getByRole("slider");

    fireEvent.keyDown(slider, { key: "PageUp" });
    expect(onChange).toHaveBeenCalledWith(0.6);
  });

  it("decreases by 0.1 on PageDown key", () => {
    const onChange = vi.fn();
    render(<Knob temperature={0.5} onTemperatureChange={onChange} />);
    const slider = screen.getByRole("slider");

    fireEvent.keyDown(slider, { key: "PageDown" });
    expect(onChange).toHaveBeenCalledWith(0.4);
  });

  it("clamps to minimum on Home key", () => {
    const onChange = vi.fn();
    render(<Knob temperature={0.5} onTemperatureChange={onChange} />);
    const slider = screen.getByRole("slider");

    fireEvent.keyDown(slider, { key: "Home" });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("clamps to maximum on End key", () => {
    const onChange = vi.fn();
    render(<Knob temperature={0.5} onTemperatureChange={onChange} />);
    const slider = screen.getByRole("slider");

    fireEvent.keyDown(slider, { key: "End" });
    expect(onChange).toHaveBeenCalledWith(1.1);
  });

  it("does not exceed 1.1 on ArrowUp", () => {
    const onChange = vi.fn();
    render(<Knob temperature={1.1} onTemperatureChange={onChange} />);
    const slider = screen.getByRole("slider");

    fireEvent.keyDown(slider, { key: "ArrowUp" });
    expect(onChange).toHaveBeenCalledWith(1.1);
  });

  it("does not go below 0 on ArrowDown", () => {
    const onChange = vi.fn();
    render(<Knob temperature={0} onTemperatureChange={onChange} />);
    const slider = screen.getByRole("slider");

    fireEvent.keyDown(slider, { key: "ArrowDown" });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("renders dial labels", () => {
    render(<Knob temperature={0.5} onTemperatureChange={() => {}} />);
    expect(screen.getByText("Normal Claude")).toBeInTheDocument();
    expect(screen.getByText("Hold My Beer")).toBeInTheDocument();
  });
});
