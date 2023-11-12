import { ModalResult, ModalsStore } from '@modal-manager/core'
import React, { useCallback, useEffect } from 'react'
import { generateUUID } from './createId'

import { ModalComponent } from './createModal/createModal'
import { ModalsStoreProvider } from './ModalsStoreProvider'

type ComponentsMap = Record<string, ModalComponent>

type PropsAndResult<
  T extends ComponentsMap | undefined,
  TKey extends keyof T | ModalComponent | undefined,
> = TKey extends keyof T
  ? T[TKey] extends ModalComponent
    ? [props: T[TKey]['props'], result: T[TKey]['resolvedVal']]
    : never
  : TKey extends ModalComponent
  ? [props: TKey['props'], result: TKey['resolvedVal']]
  : never

type ModalHookOptions = {
  autoUnmount?: boolean
}
type Listener = () => void

export class ReactModalsManager<T extends ComponentsMap = ComponentsMap> {
  private readonly componentKeys: Map<ModalComponent, string>
  private readonly listeners: Set<Listener> = new Set()

  constructor(
    public readonly store: ModalsStore,
    public components: T = {} as T,
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

  public registerModals = <TNewMap extends ComponentsMap>(map: TNewMap) => {
    this.components = {
      ...this.components,
      ...map,
    }
    Object.keys(map).forEach(id => {
      this.store.register(id)
    })
    return this as unknown as ReactModalsManager<
      T extends undefined ? TNewMap : T & TNewMap
    >
  }

  public registerModal<Id extends string, Component extends ModalComponent>(
    id: Id,
    component: Component,
  ) {
    if (!this.components[id]) {
      this.components = {
        ...this.components,
        [id]: component,
      }
      this.store.register(id)
      this.#emit()
    }
    return this
  }

  openModal = <TKey extends keyof T | ModalComponent>(
    key: TKey,
    props: PropsAndResult<T, TKey>[0],
  ) => {
    const usedKey = this.resolveKey(key as never)
    // If this is a component, we need to register it first. If key already exists, nothing will happen.
    if (typeof key !== 'string') {
      this.registerModal(usedKey, key as ModalComponent)
    }
    return this.store.open(usedKey, props)
  }

  closeModal = <TKey extends keyof T | ModalComponent>(key: TKey) => {
    return this.store.close(this.resolveKey(key as never))
  }
}

const createModalsProvider = (store: ModalsStore) => {
  return function ModalsProvider({ children }: React.PropsWithChildren) {
    return <ModalsStoreProvider store={store}>{children}</ModalsStoreProvider>
  }
}

const createModalsComponent = (manager: ReactModalsManager) => {
  return function Modals() {
    const [comps, setComps] = React.useState(manager.components)

    useEffect(() => {
      const unsubscribe = manager.subscribe(() => {
        if (manager.components !== comps) {
          setComps(manager.components)
        }
      })
      return () => unsubscribe()
    }, [])

    return comps ? (
      <>
        {Array.from(Object.entries(comps)).map(
          ([id, { component: Component }]) => {
            return <Component id={id} key={id} />
          },
        )}
      </>
    ) : null
  }
}

const createUseManagedModal = (manager: ReactModalsManager) => {
  return function useManagedModal(
    key: string | ModalComponent,
    { autoUnmount = true }: ModalHookOptions = {},
  ) {
    const usedKey = manager.resolveKey(key as never)
    const store = manager.store

    useEffect(() => {
      if (typeof key !== 'string') {
        manager.registerModal(usedKey, key)
      }
    }, [usedKey])

    const open = useCallback(
      (props: Record<string, unknown>): Promise<ModalResult> => {
        return store.open(usedKey, props)
      },
      [key],
    )

    const close = useCallback((): Promise<void> => {
      return store.close(usedKey)
    }, [key])

    useEffect(() => {
      return () => {
        if (autoUnmount) {
          store.remove(usedKey)
        }
      }
    }, [key])

    return {
      open,
      close,
    }
  }
}

type UseManagedModal<T extends ComponentsMap = ComponentsMap> = <
  TKey extends keyof T | ModalComponent,
>(
  id: TKey,
  options?: ModalHookOptions,
) => {
  open: (
    props: PropsAndResult<T, TKey>[0],
  ) => Promise<ModalResult<PropsAndResult<T, TKey>[1]>>
  close: () => Promise<void>
}

type OpenModalFn<T extends ComponentsMap> = <
  TKey extends keyof T | ModalComponent,
>(
  key: TKey,
  props: PropsAndResult<T, TKey>[0],
) => Promise<ModalResult<PropsAndResult<T, TKey>[1]>>

type CloseModalFn<T extends ComponentsMap> = <
  TKey extends keyof T | ModalComponent,
>(
  key: TKey,
) => void

type CreateModalsReturn<T extends ComponentsMap> = {
  ModalsProvider: React.FC<React.PropsWithChildren>
  ModalsComponent: React.FC
  useManagedModal: UseManagedModal<T>
  openModal: OpenModalFn<T>
  closeModal: CloseModalFn<T>
}

export function createReactModals<T extends ComponentsMap = ComponentsMap>(
  modalsMap: T,
): CreateModalsReturn<T> {
  const store = new ModalsStore()
  const manager = new ReactModalsManager(store, modalsMap)

  return {
    openModal: manager.openModal as OpenModalFn<T>,
    closeModal: manager.closeModal,
    ModalsProvider: createModalsProvider(store),
    ModalsComponent: createModalsComponent(manager),
    useManagedModal: createUseManagedModal(manager) as UseManagedModal<T>,
  }
}
