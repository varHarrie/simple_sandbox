import { Sandbox } from "./mod.ts";
import {
  assertEquals,
  assert,
} from "https://deno.land/std@0.126.0/testing/asserts.ts";

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

  await t.step("execute error", async () => {
    const code = `
    import error from 'https://deno.land';

    export default function (n, m) {
      return n + m;
    }
    `;

    const sandbox = new Sandbox();

    try {
      await sandbox.execute({
        code,
        args: [2, 3],
        timeout: 1500,
      });

      throw "Should not been captured";
    } catch (error) {
      assert(error instanceof Error);
    } finally {
      sandbox.clear();
    }
  });
});
