import { Context, parse } from "../../pressf.ts";
import { join } from "https://deno.land/std@0.80.0/path/mod.ts";
import { lookup } from "https://deno.land/x/media_types@v2.7.1/mod.ts";

/**
* A minimal static file server middleware.
**/
export default (root: string, { prefix = "", home = "index.html" }: {
  prefix?: string;
  home?: string;
} = {}) => {
  const routePattern = parse(`${prefix}/*`).pattern;

  return async (ctx: Context) => {
    const matches = routePattern.exec(ctx.url);
    if (
      matches && matches.length == 2 &&
      (ctx.method === "HEAD" || ctx.method === "GET")
    ) {
      try {
        const path = join(root, matches[1] === "" ? home : matches[1]);
        const r = await Deno.readFile(path);
        const info = await Deno.stat(path);
        const headers = new Headers();
        const contentType = lookup(path);
        if (contentType) {
          headers.set("content-type", contentType);
        }
        if (info.mtime) {
          headers.set("last-modified", info.mtime.toUTCString());
        }
        ctx.respond({ body: r, headers });
      } catch {
        ctx.respond({ status: 404 });
      }
    }
  };
};
