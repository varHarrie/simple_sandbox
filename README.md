# simple_sandbox for Deno

Provides a simple sandbox environment to execute javascript code.

## Usage

```javascript
import { Sandbox } from "https://deno.land/x/simple_sandbox/mod.ts";

const code = `
export default function ({n, m}) {
  return n + m;
}
`;

const sandbox = new Sandbox();

const result = await sandbox.execute({
  code,
  context: { n: 2, m: 3 },
  timeout: 1500,
});

console.log(result); // 5
```
