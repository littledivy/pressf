import { bench, runBenchmarks } from "https://deno.land/std/testing/bench.ts";
import { parse } from "./pressf.ts";

const routeFixtures = ["/", "*"];

for (var i = 0; i < routeFixtures.length; i++) {
  let r = routeFixtures[i];
  bench({
    name: `parse (${r})`,
    runs: 10000,
    func(b): void {
      b.start();
      parse(r);
      b.stop();
    },
  });
}

if (import.meta.main) {
  runBenchmarks();
}
