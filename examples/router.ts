import PressF from "../pressf.ts";

const ctx = new PressF();
ctx.get("/", (ctx) => {
  ctx.respond({ body: "Hello World\n" });
});

ctx.get("/:hello", (ctx) => {
  ctx.respond({ body: `Oh, hello ${ctx.params["hello"]}!` });
});

ctx.get("/books/:genre/:title?", (ctx) => {
  ctx.respond({
    body: `genre: ${ctx.params["genre"]}, title: ${ctx.params["title"]}`,
  });
});

// A simple logger middleware
ctx.use(function (ctx) {
  console.log(ctx.method, ctx.url);
});

await ctx.listen(8080);
