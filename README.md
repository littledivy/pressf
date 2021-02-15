## `pressf`

A tiny and fast router framework built on top of `std/http`. Very lightweight.
Every line of code is optimised for better performance. Low overhead compared to
other frameworks.

## Usage

```typescript
import PressF from "https://deno.land/x/pressf/pressf.ts";

const app = new PressF();
app.get("/", (ctx) => {
  ctx.respond({ body: "Hello World!" });
});

await app.listen(8080);
```

## Benchmarks

`wrk -c 100 -d 40 localhost:1234`

| Framework  | Version | Requests/sec | Transfer/sec |
| :--------- | :------ | -----------: | -----------: |
| **PressF** | 0.1.0   |    13,275.50 |     557.47KB |
| Oak        | 6.3.2   |      5381.26 |     441.43KB |
| Abc        | 1.2.3   |      4519.02 |     370.70KB |

## Middlewares

#### `static` - Minimal Static file server middleware.

```typescript
import PressF from "https://deno.land/x/pressf/pressf.ts";
import serveStatic from "https://deno.land/x/pressf/middlewares/pressf-static/mod.ts";

const app = new PressF();
app.use(serveStatic("./examples/static"));

await app.listen(8080);
```

#### `logger` - Configurable request logging middleware

> Adapted from [ABC](https://deno.land/x/abc)

```typescript
import PressF from "https://deno.land/x/pressf/pressf.ts";
import logger from "https://deno.land/x/pressf/middlewares/pressf-logger/mod.ts";

const app = new PressF();
app.use(logger());

await app.listen(8080);
```

## LICENSE

MIT LICENSE - (c) Divy Srivastava 2020
