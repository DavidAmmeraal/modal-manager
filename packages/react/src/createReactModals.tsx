import { ModalResult, ModalsStore } from '@modal-manager/core'
import React, { useCallback, useEffect } from 'react'

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

export class ReactModals<T extends ComponentsMap | undefined = undefined> {
  constructor(
    private readonly store: ModalsStore,
    private components: T = undefined as T,
  ) {
    if (components) {
      this.registerModals(components)
    }
  }

  public registerModals<TNewMap extends ComponentsMap>(map: TNewMap) {
    this.components = {
      ...this.components,
      ...map,
    }
    Object.keys(map).forEach(id => {
      this.store.register(id)
    })
    return this as unknown as ReactModals<
      T extends undefined ? TNewMap : T & TNewMap
    >
  }

  public registerModal<Id extends string, Component extends ModalComponent>(
    id: Id,
    component: Component,
  ) {
    this.components = {
      ...this.components,
      [id]: component,
    }
    this.store.register(id)
    return this as unknown as ReactModals<
      T extends undefined
        ? { [k in Id]: Component }
        : T & { [k in Id]: Component }
    >
  }

  public ModalsProvider = ({ children }: React.PropsWithChildren) => {
    return (
      <ModalsStoreProvider store={this.store}>{children}</ModalsStoreProvider>
    )
  }

  public ModalsComponent = () => {
    return this.components ? (
      <>
        {Array.from(Object.entries(this.components)).map(([id, Component]) => {
          return <Component id={id} key={id} />
        })}
      </>
    ) : null
  }

  public useManagedModal = <TKey extends keyof T | ModalComponent>(
    key: TKey,
    { autoUnmount = true }: ModalHookOptions = {},
  ) => {
    type ShowProps = PropsAndResult<T, TKey>[0]
    type ResultValue = PropsAndResult<T, TKey>[1]

    useEffect(() => {
      if (typeof key !== 'string') {
        this.store.register(key)
      }
    }, [])

    const open = useCallback(
      (props: ShowProps): Promise<ModalResult<ResultValue>> => {
        return this.store.open(key, props)
      },
      [key],
    )

    const close = useCallback(() => {
      return this.store.close(key)
    }, [key])

    useEffect(() => {
      return () => {
        if (autoUnmount) {
          this.store.remove(key)
        }
      }
    }, [key])

    return {
      open,
      close,
    }
  }
}

export function createReactModals<
  T extends ComponentsMap | undefined = undefined,
>(modalsMap: T) {
  const store = new ModalsStore()

  return new ReactModals(store, modalsMap)
}
