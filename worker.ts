/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />

async function execute(code: string, args: unknown[]) {
  const module = await import(
    `data:application/javascript,${encodeURIComponent(code)}`
  );

  const defaultExport = module.default;

  if (!defaultExport) {
    throw new Error("Missing default export");
  }

  if (typeof defaultExport !== "function") {
    throw new Error("Default export must be a function");
  }

  return defaultExport(...args);
}

self.addEventListener("message", async (e) => {
  const payload = (e as MessageEvent).data;

  if (payload.type === "execute") {
    const { code, args } = payload.data;
    const data = await execute(code, args);
    self.postMessage({ type: "result", data });
  }
});

export {};
