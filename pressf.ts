import { serve, ServerRequest } from "https://deno.land/std/http/server.ts";

type Params = { [key: string]: string };

// Common pre-parsed routes
const rootParse = { keys: false, pattern: /^\/\/\/?$/i };
const wildParse = { keys: ["wild"], pattern: /^\/(.*)\/?$/i };

// Adapted from https://github.com/lukeed/regexparam/blob/master/src/index.js
export function parse(
  str: RegExp | string,
  loose?: boolean,
): { keys: string[] | boolean; pattern: RegExp } {
  if (str instanceof RegExp) return { keys: false, pattern: str };
  if (str === "/") return rootParse;
  else if (str === "*") return wildParse;
  var arr = str.split("/");
  var len = arr.length;
  var i = 0, c, keys = [], pattern = "";
  while (i < len) {
    var t = arr[i];
    c = t[0];
    i++;
    if (c === "*") {
      keys.push("wild");
      pattern += "/(.*)";
    } else if (c === ":") {
      var o = t.indexOf("?", 1);
      var ext = t.indexOf(".", 1);
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
// XXX(TODO): Use ALL instead or ""?
type Method =
  | ""
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
  // XXX: Why not null?
  keys: boolean | string[];
  handlers: RouteFn[];
};
export default class Router {
  // NOTE: This is transpiled into the constructor, therefore equivalent to this.routes = [];
  routes: Route[] = [];

  // NOTE: Using .bind can significantly increase perf compared to arrow functions.
  public all = this.add.bind(this, "");
  public get = this.add.bind(this, "GET");
  public head = this.add.bind(this, "HEAD");
  public patch = this.add.bind(this, "PATCH");
  public options = this.add.bind(this, "OPTIONS");
  public connect = this.add.bind(this, "CONNECT");
  public delete = this.add.bind(this, "DELETE");
  public trace = this.add.bind(this, "TRACE");
  public post = this.add.bind(this, "POST");
  public put = this.add.bind(this, "PUT");

  public use(...handlers: RouteFn[]) {
    this.routes.push({ keys: false, method: "", handlers });
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
        var i = 0,
          len = this.routes.length;
        while (i < len) {
          var r = this.routes[i];
          i++;
          var params: Params = {};
          // NOTE: We're caching length here.
          var keyLength = typeof r.keys !== "boolean" ? r.keys.length : 0;
          if (keyLength > 0 && r.pattern) {
            var matches = r.pattern.exec(req.url);
            // XXX(BRUH): Typescript is not really cooperating here, we've already added checks for r.keys being boolean.
            if (matches && typeof r.keys !== "boolean") {
              var inc = 0;
              while (inc < keyLength) params[r.keys[inc]] = matches[++inc];
            }
          }
          if (!r.pattern) {
            r.handlers.forEach((fn: RouteFn) =>
              fn(Object.assign(req, { params }) as Context)
            );
            continue;
          }
          if (r.pattern.test(req.url) && req.method == r.method) {
            r.handlers.forEach((fn: RouteFn) =>
              fn(Object.assign(req, { params }) as Context)
            );
          }
        }
      }
    }
  }
}
