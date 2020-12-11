import {
  Application,
  Router as OakRouter,
} from "https://deno.land/x/oak@v6.3.2/mod.ts";

const app = new Application();
const oakrouter = new OakRouter();
oakrouter.get("/", (context) => {
  context.response.body = "Hello";
});
app.use(oakrouter.routes());

app.listen({ port: 1234 });
