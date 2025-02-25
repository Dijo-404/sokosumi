/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import Home from "./page";

it("Page renders", () => {
  render(<Home />);
  expect(screen.getByText("Hello World")).toBeDefined();
});
