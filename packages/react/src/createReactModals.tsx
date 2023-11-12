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
  ? T[TKey] extends ModalComponent<infer P, infer U>
    ? [props: P, result: U]
    : never
  : TKey extends ModalComponent<infer P, infer U>
  ? [props: P, result: U]
  : never

type ModalHookOptions = {
  autoUnmount?: boolean
}

export class ReactModalsManager<T extends ComponentsMap> {
  private readonly componentKeys: Map<ModalComponent, string>

  constructor(
    private readonly store: ModalsStore,
    private components: T = {} as T,
  ) {
    if (components) {
      this.registerModals(components)
    }
    this.componentKeys = new Map()
  }

  #resolveKey(key: string | ModalComponent): string {
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

  public registerModals<TNewMap extends ComponentsMap>(map: TNewMap) {
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
      this.#rerenderComponents()
    }
    return this
  }

  public ModalsProvider = ({ children }: React.PropsWithChildren) => {
    return (
      <ModalsStoreProvider store={this.store}>{children}</ModalsStoreProvider>
    )
  }

  #rerenderComponents = () => {}

  public ModalsComponent = () => {
    const [comps, setComps] = React.useState(this.components)

    useEffect(() => {
      this.#rerenderComponents = () => {
        if (this.components !== comps) {
          setComps(this.components)
        }
      }
    }, [])

    return comps ? (
      <>
        {Array.from(Object.entries(comps)).map(([id, Component]) => {
          return <Component id={id} key={id} />
        })}
      </>
    ) : null
  }

  public useManagedModal = <TKey extends keyof T>(
    key: TKey,
    { autoUnmount = true }: ModalHookOptions = {},
  ) => {
    type ShowProps = PropsAndResult<T, TKey>[0]
    type ResultValue = PropsAndResult<T, TKey>[1]

    const usedKey = this.#resolveKey(key as never)

    useEffect(() => {
      if (key !== usedKey) {
        this.registerModal(usedKey, key as unknown as ModalComponent)
      }
    }, [usedKey])

    const open = useCallback(
      (props: ShowProps): Promise<ModalResult<ResultValue>> => {
        return this.store.open(this.#resolveKey(usedKey), props)
      },
      [key],
    )

    const close = useCallback(() => {
      return this.store.close(usedKey)
    }, [key])

    useEffect(() => {
      return () => {
        if (autoUnmount) {
          this.store.remove(usedKey)
        }
      }
    }, [key])

    return {
      open,
      close,
    }
  }

  openModal = <TKey extends keyof T | ModalComponent>(
    key: TKey,
    props: PropsAndResult<T, TKey>[0],
  ) => {
    const usedKey = this.#resolveKey(key as never)
    // If this is a component, we need to register it first. If key already exists, nothing will happen.
    if (typeof key !== 'string') {
      this.registerModal(usedKey, key as ModalComponent)
    }
    return this.store.open(usedKey, props)
  }

  closeModal = <TKey extends keyof T | ModalComponent>(key: TKey) => {
    return this.store.close(this.#resolveKey(key as never))
  }
}

export function createReactModals<
  T extends ComponentsMap | undefined = undefined,
>(modalsMap: T) {
  const store = new ModalsStore()

  return new ReactModalsManager(store, modalsMap)
}
