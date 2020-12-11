import { Application } from "https://deno.land/x/abc@v1.2.3/mod.ts";

const app = new Application();

app
  .get("/", (c) => {
    return "Hello";
  })
  .start({ port: 1234 });
