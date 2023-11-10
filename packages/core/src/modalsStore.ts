import {
  createCancelledResult,
  createCompletedResult,
  ModalResult,
} from './modalResult'
import { promiseDelegate, PromiseDelegate } from './promiseDelegate'

type ModalEntry = {
  state: {
    props: {
      [key: string]: unknown
    }
    isOpen: boolean
    isMounted: boolean
  }
  promises: {
    open?: PromiseDelegate<ModalResult>
    close?: PromiseDelegate
  }
}

type ModalsState = {
  [key: string]: ModalEntry
}
const createDefaultState = (): ModalsState => ({})
const createDefaultModalEntry = (): ModalEntry => ({
  state: {
    props: {},
    isOpen: false,
    isMounted: false,
  },
  promises: {},
})

export class ModalsStore {
  constructor(
    private _state: ModalsState = createDefaultState(),
    private listeners: Set<() => void> = new Set(),
  ) {}

  #update(update: (state: ModalsState) => ModalsState) {
    const newState = update(this._state)
    if (newState !== this._state) {
      this._state = newState
      this.#emit()
    }
  }
  #emit() {
    this.listeners.forEach(listener => listener())
  }

  #getOpenPromise(id: string) {
    return this._state[id].promises.open
  }

  #getClosePromise(id: string) {
    return this._state[id].promises.close
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  getState = () => {
    return this._state
  }

  register = (id: string) => {
    this.#update(state => {
      return {
        ...state,
        [id]: createDefaultModalEntry(),
      }
    })
  }

  open = (id: string, props: Record<string, unknown>) => {
    // This shouldn't really occur, but if a modal is already open, we should cancel the pending promise.
    const delegate = this.#getOpenPromise(id) || promiseDelegate<ModalResult>()
    this.#update(state => {
      return {
        ...state,
        [id]: {
          state: {
            props,
            isOpen: true,
            isMounted: true,
          },
          promises: {
            open: delegate,
          },
        },
      }
    })
    return delegate.promise
  }

  hide = (id: string) => {
    this.#update(state => {
      return {
        ...state,
        [id]: {
          ...state[id],
          state: { ...state[id].state, isOpen: false },
        },
      }
    })
  }

  close = (id: string) => {
    const delegate = this.#getClosePromise(id) || promiseDelegate()
    this.#update(state => {
      return {
        ...state,
        [id]: {
          ...state[id],
          state: {
            ...state[id].state,
            isOpen: false,
          },
          promises: {
            ...state[id].promises,
            close: delegate,
          },
        },
      }
    })
    return delegate.promise
  }

  resolve = (id: string, value: unknown) => {
    const promise = this.#getOpenPromise(id)
    if (!promise) throw new Error(`No open promise for modal ${id}`)
    promise.resolve(createCompletedResult(value))
    this.#update(state => {
      return {
        ...state,
        [id]: {
          ...state[id],
          promises: {
            ...state[id].promises,
            open: undefined,
          },
        },
      }
    })
  }

  cancel = (id: string) => {
    const promise = this.#getOpenPromise(id)
    promise?.resolve(createCancelledResult())
    this.#update(state => {
      return {
        ...state,
        [id]: {
          ...state[id],
          promises: {
            ...state[id].promises,
            open: undefined,
          },
        },
      }
    })
  }

  remove = (id: string) => {
    this.#update(state => {
      return {
        ...state,
        [id]: {
          ...state[id],
          state: {
            ...state[id].state,
            isMounted: false,
          },
        },
      }
    })
    this.#getOpenPromise(id)?.resolve(createCancelledResult())
    this.#getClosePromise(id)?.resolve(undefined)
  }
}
