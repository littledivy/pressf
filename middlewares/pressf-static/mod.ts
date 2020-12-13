import { Context, parse } from "../../pressf.ts";
import { join } from "https://deno.land/std@0.80.0/path/mod.ts";

/**
* A minimal static file server middleware.
**/
export default (prefix: string, root: string) => {
  const routePattern = parse(`${prefix}/*`).pattern;

  return (ctx: Context) => {
    let matches = routePattern.exec(ctx.url);
    if (
      matches && matches.length == 2 &&
      (ctx.method === "HEAD" || ctx.method === "GET")
    ) {
      let r = Deno.readFileSync(join(root, matches[1]));
      ctx.respond({ body: r });
    }
  };
};
