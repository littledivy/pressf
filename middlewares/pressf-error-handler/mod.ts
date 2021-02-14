import { Context } from "../../pressf.ts";

export default async function (ctx: Context) {
  try {
    await ctx.error;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      await ctx.respond({ status: 404 });
    } else {
      console.error(err);
      await ctx.respond({ status: 500 });
    }
  }
}
