import { ModalsStore } from '@modal-manager/core'
import { generateUUID } from './createId'
import { ModalComponent } from './createModal/createModal'
import { CloseModalFn, ComponentsMap, OpenModalFn } from './types'

type Listener = () => void

export class ReactModalsManager<T extends ComponentsMap = ComponentsMap> {
  private readonly componentKeys: Map<ModalComponent, string>
  private readonly listeners: Set<Listener> = new Set()

  constructor(
    public readonly store: ModalsStore,
    public components: Record<string, ModalComponent>,
  ) {
    if (components) {
      this.registerModals(components)
    }
    this.componentKeys = new Map()
  }

  public subscribe = (listener: Listener) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  #emit = () => {
    this.listeners.forEach(listener => listener())
  }

  public resolveKey = (key: string | ModalComponent) => {
    if (typeof key === 'string') {
      return key
    }

    const k = this.componentKeys.get(key)
    if (k) {
      return k
    }

    const id = generateUUID()
    this.componentKeys.set(key, id)
    return id
  }

  public registerModals = (map: Record<string, ModalComponent>) => {
    this.components = {
      ...this.components,
      ...map,
    }
    Object.keys(map).forEach(id => {
      this.store.register(id)
    })
  }

  public registerModal(key: string, component: ModalComponent) {
    if (!this.components[key]) {
      this.components = {
        ...this.components,
        [key]: component,
      }
      this.store.register(key)
      this.#emit()
    }
    return this
  }

  openModal: OpenModalFn<T> = (key, props) => {
    const usedKey = this.resolveKey(key as never)
    // If key is a component, we need to register it first. If key already exists, nothing will happen.
    if (typeof key !== 'string') {
      this.registerModal(usedKey, key as never)
    }
    return this.store.open(usedKey, props)
  }

  closeModal: CloseModalFn<T> = (key, options = {}) => {
    const resolvedKey = this.resolveKey(key as never)
    const promise = this.store.close(resolvedKey)
    if (options.remove) {
      this.store.remove(resolvedKey)
    }
    return promise
  }
}
