import React, { useCallback, useEffect } from 'react'

import { ModalResult, ModalsStore } from '@modal-manager/core'
import { ModalComponent } from './createModal/createModal'
import { ModalsStoreProvider } from './ModalsStoreProvider'

type ComponentsMap = Record<string, ModalComponent>

type PropsAndResult<
  T extends ComponentsMap | undefined,
  TId extends keyof T,
> = T[TId] extends ModalComponent<infer P, infer U>
  ? [props: P, result: U]
  : never

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

  public useManagedModal = <TId extends keyof T>(
    id: TId,
    {
      autoUnmount = true,
    }: {
      /**
       * If true, the modal will be unmounted when the invoking component is dismounted.
       */
      autoUnmount?: boolean
    } = {},
  ) => {
    type ShowProps = PropsAndResult<T, TId>[0]
    type ResultValue = PropsAndResult<T, TId>[1]

    const show = useCallback(
      (props: ShowProps): Promise<ModalResult<ResultValue>> => {
        return this.store.open(id as string, props) as never
      },
      [id],
    )

    useEffect(() => {
      return () => {
        if (autoUnmount) {
          this.store.remove(id as string)
        }
      }
    }, [id])

    return {
      show,
    }
  }

  public ReactModalManager = (() => {
    const store = this.store
    return {
      open: <TId extends keyof T>(
        id: TId,
        props: PropsAndResult<T, TId>[0],
      ): Promise<ModalResult<PropsAndResult<T, TId>[1]>> => {
        return store.open(id as string, props) as never
      },
      close: <TId extends keyof T>(id: TId): Promise<void> => {
        return store.close(id as string) as never
      },
    }
  })()
}

export function createReactModals<
  T extends ComponentsMap | undefined = undefined,
>(modalsMap: T) {
  const store = new ModalsStore()

  return new ReactModals(store, modalsMap)
}
