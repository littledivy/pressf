import PressF, {
  Context,
  DefaultState,
  parse,
  Route,
  State,
} from "../pressf.ts";
import {
  assertEquals,
  assertThrowsAsync,
  delay,
  ServerRequest,
} from "./deps.ts";

async function storeDelayed(
  str: any,
  storage: any[],
  after = 0,
): Promise<number> {
  await delay(after);
  return storage.push(str);
}

async function run<S extends State = DefaultState>(app: PressF<S>, {
  url,
  method,
  params = {},
}: {
  url: string;
  method: string;
  params?: Context["params"];
  state?: Context<S>["state"];
}) {
  const req = new ServerRequest();
  req.url = url;
  req.method = method;
  return await app.invokeHandlers(
    app.routes,
    Object.assign(req, { params, state: app.state, isDone: false }),
  );
}

Deno.test("[invokeHandlers] execution order", async function () {
  const app = new PressF();
  const storage: string[] = [];

  app.get(
    "/",
    async (ctx: Context) => await storeDelayed("home", storage, 200),
    async (ctx: Context) => await storeDelayed("secondHome", storage),
  );

  app.get(
    "/*",
    async (ctx: Context) =>
      await storeDelayed(`${ctx.params["wild"]}`, storage, 100),
  );

  app.use(async () => await storeDelayed("middleware", storage));

  await run(app, { url: "/", method: "GET" });
  await delay(400);
  assertEquals(storage, ["home", "secondHome", "", "middleware"]);
});

Deno.test("[invokeHandlers] state", async function () {
  type State = Record<"data", string>;
  const state = { data: "our-data" };
  const app = new PressF<State>(state);
  const storage: string[] = [];

  app.get(
    "/",
    async (ctx: Context<State>) => {
      await storeDelayed(ctx.state.data, storage, 200);
    },
  );

  await run<State>(app, { url: "/", method: "GET", state });
  await delay(400);
  assertEquals(storage, [state.data]);
});

Deno.test("[invokeHandlers] params", async function () {
  const app = new PressF();
  const storage: string[] = [];

  app.get("/books/:genre/:title?", (ctx) => {
    storage.push(ctx.params["genre"]);
    storage.push(ctx.params["title"]);
  });

  await run(app, { url: "/books/horror/goosebumps", method: "GET" });
  await run(app, { url: "/books/horror", method: "GET" });
  await run(app, { url: "/books/horror/", method: "GET" });
  assertEquals(storage, [
    "horror",
    "goosebumps",
    "horror",
    undefined,
    "horror",
    undefined,
  ]);
});

Deno.test("[invokeHandlers] error handling", async function () {
  const app = new PressF();
  const storage: string[] = [];

  app.use(
    async (ctx: Context) => {
      await storeDelayed("home", storage);
      throw new Error("Uppps");
    },
    async (ctx: Context) => {
      await storeDelayed("never", storage);
    },
  );

  app.addEventListener(
    "error",
    async (err) => await storeDelayed("caught", storage),
  );
  await run(app, { url: "/", method: "GET" });
  await delay(400);
  assertEquals(storage, ["home", "caught"]);
});
