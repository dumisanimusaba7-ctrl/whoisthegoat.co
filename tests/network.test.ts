import { describe, expect, it } from "vitest";

import { clientCountry, clientIp, networkKey } from "@/lib/server/network";

describe("clientIp", () => {
  it("prefers the platform's real-ip header and validates it", () => {
    expect(clientIp(new Headers({ "x-real-ip": "203.0.113.7", "x-forwarded-for": "198.51.100.1" }))).toBe("203.0.113.7");
    expect(clientIp(new Headers({ "x-forwarded-for": "198.51.100.1, 10.0.0.1" }))).toBe("198.51.100.1");
    expect(clientIp(new Headers({ "x-real-ip": "not-an-ip" }))).toBeNull();
    expect(clientIp(new Headers())).toBeNull();
  });
});

describe("networkKey", () => {
  it("keeps IPv4 addresses as they are", () => {
    expect(networkKey("203.0.113.7")).toBe("203.0.113.7");
  });

  it("unwraps IPv4-mapped IPv6", () => {
    expect(networkKey("::ffff:203.0.113.7")).toBe("203.0.113.7");
  });

  it("groups IPv6 addresses by their /64", () => {
    const a = networkKey("2001:db8:abcd:12::1");
    expect(a).toBe("2001:db8:abcd:12::/64");
    expect(networkKey("2001:0db8:abcd:0012:ffff:1:2:3")).toBe(a);
    expect(networkKey("2001:db8:abcd:13::1")).not.toBe(a);
    expect(networkKey("::1")).toBe("0:0:0:0::/64");
    expect(networkKey("fe80::1%eth0")).toBe("fe80:0:0:0::/64");
  });

  it("rejects garbage", () => {
    expect(networkKey("nope")).toBeNull();
  });
});

describe("clientCountry", () => {
  it("reads the edge country header", () => {
    expect(clientCountry(new Headers({ "x-vercel-ip-country": "br" }))).toBe("BR");
    expect(clientCountry(new Headers({ "x-vercel-ip-country": "XX" }))).toBeNull();
    expect(clientCountry(new Headers({ "x-vercel-ip-country": "Brazil" }))).toBeNull();
    expect(clientCountry(new Headers())).toBeNull();
  });
});
