export type PromiseDelegate<T = void> = {
  promise: Promise<T>
  resolve: (val: T) => void
  reject: (err: unknown) => void
}

export function promiseDelegate<T = void>(): PromiseDelegate<T> {
  let resolve: (value: T) => void
  let reject: (err: unknown) => void
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  return {
    promise,
    resolve: (value: T) => resolve(value),
    reject: (err: unknown) => reject(err),
  }
}
