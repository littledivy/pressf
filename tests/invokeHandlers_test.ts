import { Context, invokeHandlers, parse } from "../pressf.ts";
import { ServerRequest } from "https://deno.land/std/http/server.ts";
import { assertEquals } from "https://deno.land/std@0.84.0/testing/asserts.ts";
import { delay } from "https://deno.land/std@0.84.0/async/delay.ts";

type RouteFn = (ctx: Context) => void;

const store: string[] = [];
const routes: any = [];
const req1 = new ServerRequest();
req1.url = "/";
req1.method = "GET";

function add(
  routes: any[],
  method: string,
  route: string | RegExp,
  ...handlers: RouteFn[]
) {
  routes.push({ method, handlers, ...parse(route) });
  return routes;
}

async function storeStringDelayed(str: string, after: number): Promise<number> {
  await delay(after);
  return store.push(str);
}

add(
  routes,
  "GET",
  "/*",
  async (ctx) => await storeStringDelayed("first", 500),
);
add(
  routes,
  "GET",
  "/movie",
  async (ctx) => await storeStringDelayed("never", 100),
);
add(
  routes,
  "GET",
  "/",
  async (ctx) => await storeStringDelayed("second", 0),
);

await invokeHandlers(
  routes,
  Object.assign(req1, {
    params: {},
    error: Promise.resolve(null),
    isDone: false,
  }),
);

Deno.test("call invokeHandlers", function () {
  assertEquals(store, ["first", "second"]);
});
