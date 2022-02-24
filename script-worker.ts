import { Script, ScriptResult } from "./script.ts";

export enum WorkerState {
  Idle = 0,
  Busy = 1,
  Closed = 2,
}

export class ScriptWorker extends EventTarget {
  state: WorkerState;
  #worker: Worker;
  #activeScript: Script | undefined;

  constructor(specifier: string | URL, options?: WorkerOptions) {
    super();

    this.state = WorkerState.Idle;
    this.#worker = new Worker(specifier, options);

    this.#worker.addEventListener("message", (e) => {
      const payload = (e as MessageEvent).data;

      if (payload.type === "result") {
        this.#handleResolve(payload.data);
      }
    });

    this.#worker.addEventListener("error", (e) => {
      this.#handleReject(e.error);
    });
  }

  #handleResolve(value: ScriptResult) {
    if (this.#activeScript) {
      this.#activeScript.stop();
      this.#activeScript.resolve(value);
      this.#activeScript = undefined;
      this.state = WorkerState.Idle;
      this.dispatchEvent(new Event("done"));
    }
  }

  #handleReject(reason: Error) {
    if (this.#activeScript) {
      this.#activeScript.stop();
      this.#activeScript.reject(reason);
      this.#activeScript = undefined;
      this.state = WorkerState.Idle;
      this.dispatchEvent(new Event("done"));
    }
  }

  execute(script: Script) {
    this.state = WorkerState.Busy;
    this.#activeScript = script;

    script.start(() => {
      this.#handleReject(new Error("Script execution timed out."));
      this.#worker.terminate();
      this.state = WorkerState.Closed;
    });

    this.#worker.postMessage({
      type: "execute",
      data: { code: script.code, args: script.args },
    });
  }

  terminate() {
    this.#handleReject(new Error("Script worker terminated"));
    this.#worker.terminate();
  }
}
