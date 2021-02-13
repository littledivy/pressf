import { serve, ServerRequest } from "https://deno.land/std/http/server.ts";

type Params = { [key: string]: string };

// Common pre-parsed routes
const rootParse = { keys: [], pattern: /^\/?$/i };
const wildParse = { keys: ["wild"], pattern: /^\/(.*)\/?$/i };

// Adapted from https://github.com/lukeed/regexparam/blob/master/src/index.js
export function parse(
  str: RegExp | string,
  loose?: boolean,
): { keys: string[]; pattern: RegExp } {
  if (str instanceof RegExp) return { keys: [], pattern: str };
  if (str === "/") return rootParse;
  else if (str === "*") return wildParse;
  const arr = str[0] === "/" ? str.slice(1).split("/") : str.split("/");
  const keys = [];
  const len = arr.length;
  let pattern = "";
  for (let i = 0; i < len; i++) {
    const t = arr[i];
    const c = t[0];
    if (c === "*") {
      keys.push("wild");
      pattern += "/(.*)";
    } else if (c === ":") {
      const o = t.indexOf("?", 1);
      const ext = t.indexOf(".", 1);
      // Double negation turn out to be faster than Boolean() casts
      // deno-lint-ignore no-extra-boolean-cast
      keys.push(t.substring(1, !!~o ? o : !!~ext ? ext : t.length));
      pattern += !!~o && !~ext ? "(?:/([^/]+?))?" : "/([^/]+?)";
      // deno-lint-ignore no-extra-boolean-cast
      if (!!~ext) pattern += (!!~o ? "?" : "") + "\\" + t.substring(ext);
    } else {
      pattern += "/" + t;
    }
  }

  return {
    keys: keys,
    pattern: new RegExp("^" + pattern + (loose ? "(?=$|/)" : "/?$"), "i"),
  };
}

export async function invokeHandlers(routes: Route[], ctx: Context) {
  const len = routes.length;
  for (let i = 0; i < len; i++) {
    const r = routes[i];
    // NOTE: We're caching length here.
    const keyLength = r.keys.length;
    if (keyLength > 0 && r.pattern) {
      const matches = r.pattern.exec(ctx.url);
      if (matches) {
        for (let inc = 0; inc < keyLength; inc++) {
          ctx.params[r.keys[inc]] = matches[inc];
        }
      }
    }
    if (
      r.pattern === undefined ||
      (ctx.method == r.method && r.pattern.test(ctx.url))
    ) {
      for (const fn of r.handlers) {
        await fn(ctx);
      }
    }
  }
}

type RouteFn = (ctx: Context) => void;
type RoutePattern = RegExp;
export type Context = ServerRequest & { params: Params } & { error?: Error };
type Method =
  | "ALL"
  | "CONNECT"
  | "DELETE"
  | "GET"
  | "HEAD"
  | "OPTIONS"
  | "PATCH"
  | "POST"
  | "PUT"
  | "TRACE";

// A Route is a route when it has a routepattern otherwise it is treated as a middleware.
type Route = {
  pattern?: RoutePattern;
  method: Method;
  keys: string[];
  handlers: RouteFn[];
};

export default class Router {
  routes: Route[] = [];
  errorHandler: (ctx: Context) => void = async (ctx) => {
    // Add try...catch statement for BrokenPipe Error
    try {
      if (ctx.error instanceof Deno.errors.NotFound) {
        await ctx.respond({ status: 404 });
      } else {
        console.error(ctx.error);
        await ctx.respond({ status: 500 });
      }
    } catch {}
  };

  // NOTE: Using .bind can significantly increase perf compared to arrow functions.
  public all = this.add.bind(this, "ALL");
  public connect = this.add.bind(this, "CONNECT");
  public delete = this.add.bind(this, "DELETE");
  public get = this.add.bind(this, "GET");
  public head = this.add.bind(this, "HEAD");
  public options = this.add.bind(this, "OPTIONS");
  public patch = this.add.bind(this, "PATCH");
  public post = this.add.bind(this, "POST");
  public put = this.add.bind(this, "PUT");
  public trace = this.add.bind(this, "TRACE");

  // Applies the handlers to all methods and urls
  public use(...handlers: RouteFn[]) {
    this.routes.push({ keys: [], method: "ALL", handlers });
    return this;
  }

  public add(method: Method, route: string | RegExp, ...handlers: RouteFn[]) {
    this.routes.push({ method, handlers, ...parse(route) });
    return this;
  }

  async listen(port: number) {
    const server = serve({ port });
    for await (const req of server) {
      const ctx = Object.assign(req, { params: {} });
      invokeHandlers(this.routes, ctx).catch((err) =>
        this.errorHandler(Object.assign(ctx, { error: err }))
      );
    }
  }
}
