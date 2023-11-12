import { logger } from './log'
import {
  createCancelledResult,
  createCompletedResult,
  ModalResult,
} from './ModalResult'
import { promiseDelegate, PromiseDelegate } from './promiseDelegate'

type ModalState = {
  props: {
    [key: string]: unknown
  }
  isOpen: boolean
  isMounted: boolean
}

type ModalPromises = {
  open?: PromiseDelegate<ModalResult>
  close?: PromiseDelegate
}

type ModalEntry = {
  state: ModalState
  promises: ModalPromises
}

type ModalKey = unknown

type ModalsMap = Map<ModalKey, ModalEntry>
const createDefaultState = (): ModalsMap => new Map()
const createDefaultModalEntry = (): ModalEntry => ({
  state: {
    props: {},
    isOpen: false,
    isMounted: false,
  },
  promises: {},
})

const invariant = <T>(value: T | undefined, msg = 'Invariant violation'): T => {
  if (!value) throw new Error(msg)
  return value
}

export class ModalsStore {
  private _map: ModalsMap = createDefaultState()
  private listeners: Map<ModalKey, Set<() => void>> = new Map()

  #updateModalState(key: ModalKey, fn: (state: ModalState) => ModalState) {
    const entry = this._map.get(key)
    if (!entry) return
    const newState = fn(entry.state)
    if (newState !== entry.state) {
      entry.state = newState
      this.#emit(key)
    }
  }
  #emit(key: ModalKey) {
    this.listeners.get(key)?.forEach(listener => listener())
  }

  #getEntry = (key: ModalKey) => {
    return invariant(this._map.get(key), `No registered modal for key "${key}"`)
  }

  #getOpenPromise(key: ModalKey) {
    return this.#getEntry(key).promises.open
  }

  #getClosePromise(key: ModalKey) {
    return this.#getEntry(key).promises.close
  }

  subscribe = (key: ModalKey, listener: () => void) => {
    this.listeners.set(key, this.listeners.get(key) || new Set())
    this.listeners.get(key)?.add(listener)

    return () => {
      this.listeners.get(key)?.delete(listener)
    }
  }

  getModalState = (key: ModalKey) => {
    return this._map.get(key)?.state
  }

  register = (key: ModalKey) => {
    this._map.set(key, createDefaultModalEntry())
  }

  open = (key: ModalKey, props: Record<string, unknown>) => {
    // This shouldn't really occur, but if a modal is already open, we should cancel the pending promise.
    const entry = this.#getEntry(key)
    const promise = this.#getOpenPromise(key)
    if (promise) {
      logger.warn('Modal is already open, cancelling previous promise')
      promise.resolve(createCancelledResult())
    }
    this.#updateModalState(key, state => ({
      ...state,
      props,
      isOpen: true,
      isMounted: true,
    }))
    entry.promises.open = promiseDelegate()
    return entry.promises.open.promise
  }

  hide = (key: ModalKey) => {
    this.#updateModalState(key, state => {
      return {
        ...state,
        isOpen: false,
      }
    })
  }

  close = (key: ModalKey) => {
    const entry = this.#getEntry(key)

    // If the modal isn't open, we can immediatly resolve.
    if (!entry.state.isOpen) {
      logger.warn(`Calling close on a modal that isn't open: ${key}`)
      return Promise.resolve()
    }

    const delegate = this.#getClosePromise(key) || promiseDelegate()
    this.#updateModalState(key, state => {
      return {
        ...state,
        isOpen: false,
      }
    })
    entry.promises.close = delegate
    return delegate.promise
  }

  resolve = (key: ModalKey, value: unknown) => {
    const promise = this.#getOpenPromise(key)
    if (!promise) {
      logger.warn(`Calling resolve on a modal that isn't open: ${key}`)
    }
    promise?.resolve(createCompletedResult(value))
    delete this._map.get(key)?.promises.open
  }

  remove = (key: ModalKey) => {
    this.#updateModalState(key, state => {
      return {
        ...state,
        isOpen: false,
        isMounted: false,
      }
    })
    this.#getOpenPromise(key)?.resolve(createCancelledResult())
    this.#getClosePromise(key)?.resolve(undefined)
    delete this._map.get(key)?.promises.open
    delete this._map.get(key)?.promises.close
  }
}
