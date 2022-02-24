import { Sandbox } from "./mod.ts";
import { assertEquals } from "https://deno.land/std@0.126.0/testing/asserts.ts";

Deno.test("Sandbox", async (t) => {
  await t.step("execute", async () => {
    const code = `
    export default function (n, m) {
      return n + m;
    }
    `;

    const sandbox = new Sandbox();

    const result = await sandbox.execute({
      code,
      args: [2, 3],
      timeout: 1500,
    });

    assertEquals(result, 5);
    sandbox.clear();
  });
});
