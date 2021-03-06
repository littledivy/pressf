import PressF from "../pressf.ts";
import logger from "../middlewares/pressf-logger/mod.ts";
import serveStatic from "../middlewares/pressf-static/mod.ts";

const app = new PressF();

app.use(logger());
app.use(serveStatic("./examples/static"));

await app.listen(8080);
