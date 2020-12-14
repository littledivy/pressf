import { parse } from "./pressf.ts";
import { assertEquals } from "https://deno.land/std@0.80.0/testing/asserts.ts";

Deno.test("parse slashes", function () {
  assertEquals(parse("/"), { keys: false, pattern: /^\/\/\/?$/i });
  assertEquals(parse("foo/bar"), { keys: [], pattern: /^\/foo\/bar\/?$/i });
  assertEquals(
    parse("foo/bar/f"),
    { keys: [], pattern: /^\/foo\/bar\/f\/?$/i },
  );
});

Deno.test("ending slash", function () {
  assertEquals(parse("foo/"), { keys: [], pattern: /^\/foo\/\/?$/i });
});

Deno.test("params", function () {
  assertEquals(
    parse("foo/:id"),
    { keys: ["id"], pattern: /^\/foo\/([^/]+?)\/?$/i },
  );
});
