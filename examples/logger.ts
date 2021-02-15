import PressF from "../pressf.ts";
import logger from "../middlewares/pressf-logger/mod.ts";
import serveStatic from "../middlewares/pressf-static/mod.ts";

const app = new PressF();

app.use(logger());
app.use(serveStatic("./examples/static"));

app.addEventListener(
  "error",
  async (event) => {
    if (event.ctx.isDone) {
      return console.error(event.message);
    } else if (event.error instanceof Deno.errors.NotFound) {
      await event.ctx.respond({ status: 404 });
    } else {
      console.error(event.message);
      await event.ctx.respond({ status: 500 });
    }
  },
);

await app.listen(8080);
