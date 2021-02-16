import PressF from "../pressf.ts";

const app = new PressF();
app.get("/", (ctx) => {
  ctx.respond({ body: "Hello World\n" });
});

app.get("/:hello", (ctx) => {
  ctx.respond({ body: `Oh, hello ${app.params["hello"]}!` });
});

app.get(
  "/static/*",
  (ctx) => ctx.respond({ body: `wild: ${ctx.params["wild"]}` }),
);

app.get("/books/:genre/:title?", (ctx) => {
  ctx.respond({
    body: `genre: ${ctx.params["genre"]}, title: ${ctx.params["title"]}`,
  });
});

// A simple logger middleware
app.use(function (ctx) {
  console.log(ctx.method, ctx.url);
});

await app.listen(8080);
