import { useMemo } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { useModalsStore } from '../ModalsStoreProvider'

export function useCreatedModal(id: string) {
  const store = useModalsStore()

  const modalState = useSyncExternalStore(
    listener => store.subscribe(id, listener),
    () => store.getModalState(id),
  )

  const actions = useMemo(() => {
    return {
      close: () => {
        store.close(id)
      },
      remove: () => {
        store.remove(id)
      },
      dismiss: () => {
        store.close(id)
      },
      complete: (value: unknown) => {
        store.resolve(id, value)
        store.close(id)
      },
    }
  }, [id, store])

  return useMemo(() => {
    return {
      state: modalState,
      actions,
    }
  }, [modalState, actions])
}
