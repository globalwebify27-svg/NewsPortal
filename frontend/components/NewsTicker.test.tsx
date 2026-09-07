import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NewsTicker from "./NewsTicker";

describe("NewsTicker Component", () => {
  it("renders badge and news items properly", () => {
    const newsItems = ["Breaking News 1", "Breaking News 2"];
    render(<NewsTicker items={newsItems} badgeText="BREAKING" />);

    expect(screen.getByText("BREAKING")).toBeInTheDocument();
    const matches = screen.getAllByText("Breaking News 1");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});
