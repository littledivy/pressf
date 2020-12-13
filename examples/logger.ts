import PressF from "../pressf.ts";
import logger from "../middlewares/pressf-logger/mod.ts";
import serveStatic from "../middlewares/pressf-static/mod.ts";

const ctx = new PressF();

ctx.use(logger());
ctx.use(serveStatic("static", "./examples"));

await ctx.listen(8080);
