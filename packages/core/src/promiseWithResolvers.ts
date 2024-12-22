export type PromiseWithResolvers<T = void> = {
    promise: Promise<T>;
    resolve: (val: T) => void;
    reject: (err: unknown) => void;
  };
  
  /**
   * Like https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers
   *
   * Creates a promise that can be resolved externally. Like:
   *
   * ```
   * const delegate = promiseDelegate<string>;
   * (async () => {
   *  const result = await delegate.promise;
   *  console.log(result) // Outputs 'hello world'
   * })()
   *
   * delegate.resolve('hello world')
   * ```
   * @returns
   */
  export function promiseWithResolvers<T = void>(): PromiseWithResolvers<T> {
    let resolve: (value: T) => void;
    let reject: (err: unknown) => void;
    const promise = new Promise<T>((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
  
    return {
      promise,
      resolve: (value: T) => resolve(value),
      reject: (err: unknown) => reject(err),
    };
  }