import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MarketTicker from "./MarketTicker";
import { LanguageProvider } from "@/context/LanguageContext";

describe("MarketTicker Component", () => {
  it("renders market ticker bar with default Hindi market title", () => {
    render(
      <LanguageProvider>
        <MarketTicker />
      </LanguageProvider>
    );

    const tickerBar = document.getElementById("marketTickerBar");
    expect(tickerBar).toBeInTheDocument();
    expect(screen.getByText(/बाज़ार|Markets/i)).toBeInTheDocument();
  });
});
