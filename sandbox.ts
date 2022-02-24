import { ScriptWorker, WorkerState } from "./script-worker.ts";
import { Script, ScriptOptions } from "./script.ts";

export type SandboxOptions = {
  maxWorkerCount?: number;
};

export class Sandbox {
  #queue: Script[] = [];
  #workers: ScriptWorker[] = [];
  maxWorkerCount: number;

  constructor(options: SandboxOptions = {}) {
    this.maxWorkerCount =
      options.maxWorkerCount ?? navigator.hardwareConcurrency;
  }

  #getIdleWorker() {
    const idle = this.#workers.find((w) => w.state === WorkerState.Idle);
    if (idle) return idle;

    if (this.#workers.length < this.maxWorkerCount) {
      const workerUrl = new URL("./worker.ts", import.meta.url).href;
      const worker = new ScriptWorker(workerUrl, { type: "module" });

      worker.addEventListener("done", this.#onWorkerDone);

      this.#workers.push(worker);
      return worker;
    }

    return undefined;
  }

  #cleanUp() {
    this.#workers = this.#workers.filter((w) => w.state !== WorkerState.Closed);
  }

  #doWork() {
    const worker = this.#getIdleWorker();
    if (!worker) return;

    const script = this.#queue.shift();
    if (!script) return;

    worker.execute(script);
  }

  #onWorkerDone = () => {
    this.#cleanUp();
    this.#doWork();
  };

  execute(options: ScriptOptions) {
    const script = new Script(options);

    this.#queue.push(script);
    this.#doWork();

    return script.defer;
  }

  clear() {
    this.#workers.forEach((worker) => {
      worker.terminate();
    });

    this.#workers = [];
    this.#queue = [];
  }
}
