import PressF from "../pressf.ts";
import serveStatic from "../middlewares/pressf-static/mod.ts";

const ctx = new PressF();
ctx.use(serveStatic(new URL("./static", import.meta.url).pathname));

await ctx.listen(8080);
