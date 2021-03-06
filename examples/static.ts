import PressF from "../pressf.ts";
import serveStatic from "../middlewares/pressf-static/mod.ts";

const app = new PressF();

app.use(serveStatic(new URL("./static", import.meta.url).pathname));

await app.listen(8080);
