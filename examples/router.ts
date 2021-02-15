import PressF from "../pressf.ts";

const app = new PressF();
app.get("/", (app) => {
  app.respond({ body: "Hello World\n" });
});

app.get("/:hello", (app) => {
  app.respond({ body: `Oh, hello ${app.params["hello"]}!` });
});

app.get(
  "/static/*",
  (app) => app.respond({ body: `wild: ${app.params["wild"]}` }),
);

app.get("/books/:genre/:title?", (app) => {
  app.respond({
    body: `genre: ${app.params["genre"]}, title: ${app.params["title"]}`,
  });
});

// A simple logger middleware
app.use(function (app) {
  console.log(app.method, app.url);
});

await app.listen(8080);
