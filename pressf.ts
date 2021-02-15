import { serve, ServerRequest } from "./deps.ts";

// Common pre-parsed routes:
const rootParse = { keys: [], pattern: /^\/?$/i };
const wildParse = { keys: ["wild"], pattern: /^\/(.*)\/?$/i };

// Adapted from https://github.com/lukeed/regexparam/blob/master/src/index.js
export function parse(
  str: RegExp | string,
  loose?: boolean,
): { keys: string[]; pattern: RegExp } {
  if (str instanceof RegExp) return { keys: [], pattern: str };
  if (str === "/") return rootParse;
  if (str === "*" || str === "/*") return wildParse;
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
      // Double negation turns out to be faster than Boolean() casts.
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

// A Route is a route when it has a route pattern otherwise it is treated as a middleware.
export type Route<S extends State = DefaultState> = {
  pattern?: RoutePattern;
  method: Method;
  keys: string[];
  handlers: RouteFn<S>[];
};
export type Context<S extends State = DefaultState> = ServerRequest & {
  params: Params;
  state: S;
  isDone: Boolean;
};
export type DefaultState = Record<string, unknown>;
export type State = Record<string | number | symbol, unknown>;
type Params = { [key: string]: string };
type RouteFn<S extends State = DefaultState> = (ctx: Context<S>) => void;
type RoutePattern = RegExp;
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

// NOTE: This is necessary to access the PressFErrorEvent properties in event listeners.
declare global {
  interface EventTarget {
    addEventListener(
      type: string,
      listener: (event: PressFErrorEvent) => void,
      options?: boolean | AddEventListenerOptions,
    ): void;
  }
}

export class PressFErrorEvent<S extends State = DefaultState>
  extends ErrorEvent {
  ctx: Context<S>;
  constructor(
    type: string,
    data: { error: Error; ctx: Context<S> },
  ) {
    super(type, { error: data.error, message: data.error.message });
    this.ctx = data.ctx;
  }
}

export default class Router<S extends State = DefaultState>
  extends EventTarget {
  public routes: Route<S>[] = [];
  public state: S;

  constructor(state: S = {} as S) {
    super();
    this.state = state;
  }

  // NOTE: Using .bind can significantly increase perf compared to arrow functions.
  all = this.add.bind(this, "ALL");
  connect = this.add.bind(this, "CONNECT");
  delete = this.add.bind(this, "DELETE");
  get = this.add.bind(this, "GET");
  head = this.add.bind(this, "HEAD");
  options = this.add.bind(this, "OPTIONS");
  patch = this.add.bind(this, "PATCH");
  post = this.add.bind(this, "POST");
  put = this.add.bind(this, "PUT");
  trace = this.add.bind(this, "TRACE");

  // Adds middleware: Applies the handlers to all methods and routes.
  use(...handlers: RouteFn<S>[]) {
    this.routes.push({ keys: [], method: "ALL", handlers });
    return this;
  }

  add(
    method: Method,
    route: string | RegExp,
    ...handlers: RouteFn<S>[]
  ) {
    this.routes.push({ method, handlers, ...parse(route) });
    return this;
  }

  async invokeHandlers<S extends State = DefaultState>(
    routes: Route<S>[],
    ctx: Context<S>,
  ) {
    ctx.done.then(() => ctx.isDone = true);
    // NOTE: We're caching length here.
    const len = routes.length;
    for (let i = 0; i < len; i++) {
      const r = routes[i];
      const keyLength = r.keys.length;
      let matches: null | string[] = null;
      if (
        r.pattern === undefined ||
        (ctx.method === r.method && (matches = r.pattern.exec(ctx.url)))
      ) {
        if (keyLength > 0 && r.pattern) {
          if (matches) {
            let inc = 0;
            while (inc < keyLength) ctx.params[r.keys[inc]] = matches[++inc];
          }
        }
        for (const fn of r.handlers) {
          try {
            await fn(ctx);
          } catch (error) {
            return this.dispatchEvent(
              new PressFErrorEvent<S>("error", { error, ctx }),
            );
          }
        }
      }
    }
  }

  async listen(port: number) {
    const server = serve({ port });
    for await (const req of server) {
      this.invokeHandlers(
        this.routes,
        Object.assign(req, { params: {}, state: this.state, isDone: false }),
      );
    }
  }
}
