import { getAllSearchParams, getSearchParam, isUser } from "~/utils/utils";
import { formatCurrency, getFormattedEnum } from "./formatters";

test("formatCurrency", () => {
  it("should format a number to a currency", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });
  it("should return the value if it is not a number", () => {
    expect(formatCurrency("1234.56")).toBe("1234.56");
  });
});

test("getFormattedEnum", () => {
  it("should format an enum string to a human readable string", () => {
    expect(getFormattedEnum("NEW")).toBe("New");
  });
  it("should split an enum string by underscores", () => {
    expect(getFormattedEnum("NEW_REPAIR")).toBe("New Repair");
  });
  it("should capitalize the first letter of each word", () => {
    expect(getFormattedEnum("new_rEPAIR")).toBe("New Repair");
  });
});

test("getSearchParam", () => {
  it("should return a search param from a request", () => {
    expect(getSearchParam("test", new Request("https://test.com?test=123"))).toBe("123");
  });
  it("should return undefined if the param is not found", () => {
    expect(getSearchParam("test", new Request("https://test.com"))).toBe(undefined);
  });
  it("should return the first param if there are multiple", () => {
    expect(getSearchParam("test", new Request("https://test.com?test=123&test=456"))).toBe("123");
  });
});

test("getAllSearchParams", () => {
  it("should return all search params from a request", () => {
    expect(getAllSearchParams("test", new Request("https://test.com?test=123&test=456"))).toEqual(["123", "456"]);
  });
  it("should return an empty array if the param is not found", () => {
    expect(getAllSearchParams("test", new Request("https://test.com"))).toEqual([]);
  });
});

test("isUser", () => {
  it("should return true if the user is a user", () => {
    expect(
      isUser({
        id: "123",
        email: "tmfd@remix.run",
      })
    ).toBe(true);
  });
  it("should return false if the user has no email", () => {
    expect(isUser({ id: "123", email: undefined })).toBe(false);
  });
  it("should return false if the user is not a user", () => {
    expect(isUser({})).toBe(false);
  });
  it("should return false if the user is undefined", () => {
    expect(isUser(undefined)).toBe(false);
  });
});
