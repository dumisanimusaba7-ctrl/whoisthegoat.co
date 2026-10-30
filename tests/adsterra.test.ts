import { describe, expect, it } from "vitest";

import { socialBarWait } from "@/components/ads/social-bar";
import { socialBarUrl } from "@/lib/adsterra";

describe("socialBarUrl", () => {
  it("takes the URL out of the pasted script tag", () => {
    expect(socialBarUrl("<script type='text/javascript' src='//bicea.org/ab/cd/ef/abcdef.js'></script>")).toBe(
      "https://bicea.org/ab/cd/ef/abcdef.js",
    );
  });

  it("accepts a bare URL", () => {
    expect(socialBarUrl(" https://bicea.org/ab/cd/ef/abcdef.js ")).toBe("https://bicea.org/ab/cd/ef/abcdef.js");
  });

  it("is off when unset or not an https URL", () => {
    expect(socialBarUrl("")).toBeNull();
    expect(socialBarUrl("http://bicea.org/x.js")).toBeNull();
    expect(socialBarUrl("javascript:alert(1)")).toBeNull();
  });
});

describe("socialBarWait", () => {
  const min = 60_000;
  it("waits 10 seconds after arrival for the first one", () => {
    expect(socialBarWait([], 1_000_000, 1_000_000)).toBe(10_000);
  });
  it("keeps 3 minutes between showings", () => {
    expect(socialBarWait([0], 1 * min, 0)).toBe(2 * min);
  });
  it("stops after two in 30 minutes", () => {
    expect(socialBarWait([0, 3 * min], 15 * min, 0)).toBeNull();
  });
});
