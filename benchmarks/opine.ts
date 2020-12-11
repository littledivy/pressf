import { opine } from "https://deno.land/x/opine@0.26.0/mod.ts";

// Opine
const opine_app = opine();
opine_app.get("/", function (req, res) {
  res.send("Hello");
});

opine_app.listen(1234);
