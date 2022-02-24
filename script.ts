const noop = () => {};

export type ScriptOptions = {
  code: string;
  args: unknown[];
  timeout?: number;
};

export type ScriptResult = string | number | boolean | Record<string, unknown>;

export class Script {
  code: string;
  args: unknown[];
  #timeout: number | undefined;
  #timer: number | undefined;

  defer: Promise<ScriptResult>;
  resolve: (value: ScriptResult) => void = noop;
  reject: (reason: unknown) => void = noop;

  constructor(options: ScriptOptions) {
    this.code = options.code;
    this.args = options.args;
    this.#timeout = options.timeout;

    this.defer = new Promise<ScriptResult>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  start(callback: () => void) {
    if (this.#timeout) {
      this.#timer = setTimeout(callback, this.#timeout);
    }
  }

  stop() {
    clearTimeout(this.#timer);
    this.#timer = undefined;
  }
}
