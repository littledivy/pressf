import Router from "./router.ts";
import {
  Application,
  Router as OakRouter,
} from "https://deno.land/x/oak/mod.ts";
import { opine } from "https://deno.land/x/opine@0.26.0/mod.ts";

// Router
let router = new Router();
router.get("/", (req: any) => req.respond({ body: "Hello" }));

// Oak
const app = new Application();
const oakrouter = new OakRouter();
oakrouter
  .get("/", (context) => {
    context.response.body = "Hello world!";
  });
app.use(oakrouter.routes());

// Opine
const opine_app = opine();
opine_app.get("/", function (req, res) {
  res.send("Hello World");
});

// Bench control
if (import.meta.main) {
  /// XXX(CONFIRM): Has the server even started?
  /// Is there a way we can confirm that?
  router.listen(1234);
  app.listen({ port: 1235 });
  opine_app.listen(1236);
  console.log("Listening");

  // Now, manually run `wrk` on all the servers.
}
