import { useSyncExternalStore, useMemo } from 'react'
import { useModalsStore } from '../ModalsStoreProvider'

export function useCreatedModal(id: string) {
  const store = useModalsStore()

  const modalState = useSyncExternalStore(store.subscribe, () =>
    store.getModalState(id),
  )

  const actions = useMemo(() => {
    return {
      hide: () => {
        store.hide(id)
      },
      remove: () => {
        store.remove(id)
      },
      resolve: (value?: unknown) => {
        store.resolve(id, value)
      },
      cancel: () => {
        store.cancel(id)
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
