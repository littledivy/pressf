import PressF, { Context } from "../pressf.ts";
import serveStatic from "../middlewares/pressf-static/mod.ts";
import errorHandler from "../middlewares/pressf-error-handler/mod.ts";

const ctx = new PressF();

ctx.use(serveStatic(new URL("./static", import.meta.url).pathname));
ctx.use(errorHandler);

await ctx.listen(8080);
