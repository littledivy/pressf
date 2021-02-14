import PressF, { Context } from "../pressf.ts";

const ctx = new PressF();
ctx.use(async (ctx: Context) => {
  console.log("First middleware");
  throw new Error("Upppps");
  await ctx.respond({ body: "Never" });
});

ctx.use(async (ctx: Context) => {
  console.log("Second middleware");
  await ctx.error;
  console.log("Never");
});

ctx.use(async (ctx: Context) => {
  try {
    console.log("Third middleware");
    await ctx.error;
  } catch {
    await ctx.respond({ body: "Hello World" });
  }
});

ctx.use(async (ctx: Context) => {
  // Because we already called `req.respond()`
  console.log("Never");
});

await ctx.listen(8080);
