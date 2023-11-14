import { ModalResult } from '@modal-manager/core'
import { useCallback, useEffect } from 'react'
import { ModalComponent } from './createModal/createModal'
import { ReactModalsManager } from './ReactModalManager'

export type ModalHookOptions = {
  autoUnmount?: boolean
}

export const createUseManagedModal = (manager: ReactModalsManager) => {
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
