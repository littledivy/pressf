## `pressf`

A tiny and fast router framework built on top of `std/http`. Very lightweight. Every line of code is optimised for better performance. Low overhead compared to other frameworks.

> To be released soon

## Usage

```typescript
import PressF from "./pressf.ts";

const app = new PressF();
app.get("/", (ctx) => {
  ctx.respond({ body: "Hello World!" });
});

await app.listen(8080);
```

## Benchmarks

`wrk -c 100 -d 40 localhost:1234`

| Framework  | Version | Requests/sec |
| :--------- | :------ | -----------: |
| **PressF** | 0.1.0   |    12,346.01 |
| Oak        | 6.3.2   |      5077.04 |
| Abc        | 1.2.3   |      4049.85 |

## LICENSE

MIT LICENSE - (c) Divy Srivastava 2020
