import { render, screen } from "@testing-library/react";
import { HeroCtaButtons } from "@/components/hero-cta-buttons";

describe("HeroCtaButtons", () => {
  it("renders primary and secondary links with non-breaking labels", () => {
    render(<HeroCtaButtons primaryHref="/library" secondaryHref="/#how-it-works" />);
    const browseLink = screen.getByRole("link", { name: /browse.*library/i });
    const howLink = screen.getByRole("link", { name: /how it works/i });
    expect(browseLink).toHaveAttribute("href", "/library");
    expect(browseLink.textContent).toBe("Browse\u00A0Library");
    expect(howLink).toHaveAttribute("href", "/#how-it-works");
  });

  it("applies responsive layout classes", () => {
    render(<HeroCtaButtons primaryHref="/library" secondaryHref="/#how-it-works" />);
    const container = screen.getByTestId("hero-cta");
    expect(container.className).toMatch(/flex-col/);
    expect(container.className).toMatch(/sm:flex-row/);
    const buttons = screen.getAllByRole("link");
    buttons.forEach((button) => {
      expect(button.className).toMatch(/w-full/);
      expect(button.className).toMatch(/sm:w-auto/);
    });
  });
});
