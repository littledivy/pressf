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

type RouteFn = (ctx: Context) => void;
type RoutePattern = RegExp;
export type Context = ServerRequest & { params: Params };
type Method =
  | "ALL"
  | "GET"
  | "POST"
  | "HEAD"
  | "PATCH"
  | "OPTIONS"
  | "CONNECT"
  | "DELETE"
  | "TRACE"
  | "POST"
  | "PUT";

// A Route is a route when it has a routepattern otherwise it is treated as a middleware.
type Route = {
  pattern?: RoutePattern;
  method: Method;
  keys: string[];
  handlers: RouteFn[];
};

export default class Router {
  routes: Route[] = [];

  // NOTE: Using .bind can significantly increase perf compared to arrow functions.
  public all = this.add.bind(this, "ALL");
  public get = this.add.bind(this, "GET");
  public head = this.add.bind(this, "HEAD");
  public patch = this.add.bind(this, "PATCH");
  public options = this.add.bind(this, "OPTIONS");
  public connect = this.add.bind(this, "CONNECT");
  public delete = this.add.bind(this, "DELETE");
  public trace = this.add.bind(this, "TRACE");
  public post = this.add.bind(this, "POST");
  public put = this.add.bind(this, "PUT");

  // Applies the handlers to all methods and urls
  public use(...handlers: RouteFn[]) {
    this.routes.push({ keys: [], method: "ALL", handlers });
    return this;
  }

  public add(method: Method, route: string | RegExp, ...handlers: RouteFn[]) {
    let { keys, pattern } = parse(route);
    this.routes.push({ keys, method, handlers, pattern });
    return this;
  }

  async listen(port: number) {
    const server = serve({ port });
    for await (const req of server) {
      if (this.routes.length > 0) {
        invokeHandlers(this.routes, req);
      }
    }
  }
}

async function invokeHandlers(routes: Route[], req: ServerRequest) {
  const len = routes.length;
  for (let i = 0; i < len; i++) {
    const r = routes[i];
    const params: Params = {};
    // NOTE: We're caching length here.
    const keyLength = r.keys.length;
    if (keyLength > 0 && r.pattern) {
      const matches = r.pattern.exec(req.url);
      if (matches) {
        for (let inc = 0; inc < keyLength; inc++) {
          params[r.keys[inc]] = matches[inc];
        }
      }
    }
    if (
      r.pattern === undefined ||
      (r.pattern.test(req.url) && req.method == r.method)
    ) {
      for (const fn of r.handlers) {
        await fn(Object.assign(req, { params }));
      }
    }
  }
}
