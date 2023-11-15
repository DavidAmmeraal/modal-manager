import { ModalResult } from '@modal-manager/core'
import { useCallback, useEffect } from 'react'
import { ModalComponent } from './createModal/createModal'
import { ReactModalsManager } from './ReactModalManager'
import { ComponentsMap, PropsAndResult } from './types'

export type ModalHookOptions = {
  autoUnmount?: boolean
}

export const createUseManagedModal = <T extends ComponentsMap = ComponentsMap>(manager: ReactModalsManager<T>) => {
  return function useManagedModal<TKey extends keyof T | ModalComponent>(
    key: TKey,
    { autoUnmount = true }: ModalHookOptions = {},
  ) {
    const usedKey = manager.resolveKey(key as never)
    const store = manager.store

    useEffect(() => {
      if (typeof key !== 'string') {
        manager.registerModal(usedKey, key as never)
      }
    }, [usedKey])

    const open = useCallback(
      (props: PropsAndResult<T, TKey>[0]): Promise<ModalResult<PropsAndResult<T, TKey>[1]>> => {
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
