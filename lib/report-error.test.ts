import { describe, expect, it } from "vitest";
import { buildEnvelope, parseStack } from "./report-error";

describe("parseStack", () => {
  it("reads V8 frames, oldest call first", () => {
    const frames = parseStack(
      [
        "TypeError: x is not a function",
        "    at handleSubmit (https://servebyexample.co/_next/static/chunks/app.js:10:25)",
        "    at async POST (file:///worker.js:200:7)",
        "    at https://servebyexample.co/_next/static/chunks/node_modules/react.js:5:1",
      ].join("\n"),
    );
    expect(frames).toEqual([
      { filename: "https://servebyexample.co/_next/static/chunks/node_modules/react.js", lineno: 5, colno: 1, in_app: false },
      { function: "POST", filename: "file:///worker.js", lineno: 200, colno: 7, in_app: true },
      { function: "handleSubmit", filename: "https://servebyexample.co/_next/static/chunks/app.js", lineno: 10, colno: 25, in_app: true },
    ]);
  });

  it("reads Safari and Firefox frames", () => {
    expect(parseStack("submit@https://servebyexample.co/a.js:3:9\n@https://servebyexample.co/b.js:1:1")).toEqual([
      { filename: "https://servebyexample.co/b.js", lineno: 1, colno: 1, in_app: true },
      { function: "submit", filename: "https://servebyexample.co/a.js", lineno: 3, colno: 9, in_app: true },
    ]);
  });

  it("returns nothing for a missing stack", () => {
    expect(parseStack(undefined)).toEqual([]);
  });
});

describe("buildEnvelope", () => {
  const now = new Date("2026-10-12T09:00:00.000Z");
  const error = new TypeError("Cannot read properties of undefined");

  it("carries the stack, the route and the digest, and drops the query string", () => {
    const { event, body } = buildEnvelope(
      error,
      { route: "/api/billing/webhook", url: "https://servebyexample.co/reset-password?code=secret", digest: "abc123" },
      "server",
      now,
    );
    expect(event.exception.values[0].type).toBe("TypeError");
    expect(event.exception.values[0].stacktrace.frames.length).toBeGreaterThan(0);
    expect(event.tags).toEqual({ runtime: "server", route: "/api/billing/webhook", digest: "abc123" });
    expect(event.request).toEqual({ url: "https://servebyexample.co/reset-password" });
    expect(event.environment).toBe("production");
    expect(body).not.toContain("secret");
    expect(body.split("\n")).toHaveLength(4);
    expect(JSON.parse(body.split("\n")[1])).toEqual({ type: "event" });
  });

  it("labels any other host a preview and attaches no user", () => {
    const { event } = buildEnvelope(error, { url: "https://abc.serve-by-example-ai.pages.dev/dashboard" }, "browser", now);
    expect(event.environment).toBe("preview");
    expect(event).not.toHaveProperty("user");
  });

  it("wraps a thrown value that is not an Error", () => {
    const { event } = buildEnvelope("plain string", {}, "server", now);
    expect(event.exception.values[0].value).toBe("plain string");
    expect(event.exception.values[0].mechanism.handled).toBe(true);
  });
});
