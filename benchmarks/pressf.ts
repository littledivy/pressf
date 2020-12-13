import PressF, { Context } from "../pressf.ts";

const router = new PressF();
router.get("/", (req: Context) => req.respond({ body: "Hello" }));

router.listen(1234);
