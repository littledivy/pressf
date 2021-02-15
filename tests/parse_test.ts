import { parse } from "../pressf.ts";
import { assertEquals } from "./deps.ts";

Deno.test("[parse] slashes", function () {
  assertEquals(parse("/"), { keys: [], pattern: /^\/?$/i });
  assertEquals(parse("foo/bar"), { keys: [], pattern: /^\/foo\/bar\/?$/i });
  assertEquals(
    parse("foo/bar/f"),
    { keys: [], pattern: /^\/foo\/bar\/f\/?$/i },
  );
});

Deno.test("[parse] ending slash", function () {
  assertEquals(parse("foo/"), { keys: [], pattern: /^\/foo\/\/?$/i });
});

Deno.test("[parse] starting slash", function () {
  assertEquals(parse("/books/:genre/:title?"), {
    keys: ["genre", "title"],
    pattern: /^\/books\/([^/]+?)(?:\/([^/]+?))?\/?$/i,
  });
});

Deno.test("[parse] params", function () {
  assertEquals(
    parse("foo/:id"),
    { keys: ["id"], pattern: /^\/foo\/([^/]+?)\/?$/i },
  );
  assertEquals(
    parse("/books/:genre/:title"),
    { keys: ["genre", "title"], pattern: /^\/books\/([^/]+?)\/([^/]+?)\/?$/i },
  );
  assertEquals(
    parse("/books/:genre/:title?"),
    {
      keys: ["genre", "title"],
      pattern: /^\/books\/([^/]+?)(?:\/([^/]+?))?\/?$/i,
    },
  );
});
