import { Context, parse } from "../../pressf.ts";
import { join } from "https://deno.land/std@0.88.0/path/mod.ts";
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
      return await respondWithFile(root, {
        url: matches[1] === "" ? home : matches[1],
        home,
      })(ctx);
    }
  };
};

export function respondWithFile(
  root: string,
  { url, home = "index.html" }: { url?: string; home?: string } = {},
) {
  return async (ctx: Context) => {
    const actualUrl = typeof url === "string" ? url : ctx.url;
    const path = join(root, actualUrl === "/" ? home : actualUrl);
    const info = await Deno.stat(path);
    const contentType = lookup(path);
    const ifModifiedSince = ctx.headers.get("if-modified-since");
    const headers = new Headers();
    if (contentType) {
      headers.set("content-type", contentType);
    }
    if (info.mtime) {
      headers.set("last-modified", info.mtime.toUTCString());
      if (
        ifModifiedSince &&
        info.mtime.getTime() < (new Date(ifModifiedSince).getTime() + 1000)
      ) {
        return await ctx.respond({ headers, status: 304 });
      }
    }
    return await ctx.respond({
      body: await Deno.readFile(path),
      headers,
      status: 200,
    });
  };
}
