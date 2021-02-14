import PressF from "../pressf.ts";
import logger from "../middlewares/pressf-logger/mod.ts";
import serveStatic from "../middlewares/pressf-static/mod.ts";
import errorHandler from "../middlewares/pressf-error-handler/mod.ts";

const ctx = new PressF();

ctx.use(logger());
ctx.use(serveStatic("./examples/static"));
ctx.use(errorHandler);

await ctx.listen(8080);
