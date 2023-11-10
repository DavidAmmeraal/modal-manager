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

type ModalsMap = Record<string, ModalEntry>
const createDefaultState = (): ModalsMap => ({})
const createDefaultModalEntry = (): ModalEntry => ({
  state: {
    props: {},
    isOpen: false,
    isMounted: false,
  },
  promises: {},
})

export class ModalsStore {
  private _map: ModalsMap = createDefaultState()
  private listeners: Set<() => void> = new Set()

  #update(update: (state: ModalsMap) => ModalsMap) {
    const newMap = update(this._map)
    if (newMap !== this._map) {
      this._map = newMap
      this.#emit()
    }
  }
  #emit() {
    this.listeners.forEach(listener => listener())
  }

  #getOpenPromise(id: string) {
    return this._map[id].promises.open
  }

  #getClosePromise(id: string) {
    return this._map[id].promises.close
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)

    return () => {
      this.listeners.delete(listener)
    }
  }

  getModalState = (id: string) => {
    return this._map[id].state
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
