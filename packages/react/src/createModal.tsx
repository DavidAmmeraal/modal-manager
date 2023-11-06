import React, { useMemo, useSyncExternalStore } from 'react'
import { useModalsManager } from './ModalsManagerProvider'

export interface CreateModalHocProps {
  id: string
}

/**
 * These props will be injected into the component wrapped by `createModal`.
 */
export interface InjectedModalProps<T = never> {
  modal: {
    isOpen: boolean
    hide: () => void
    remove: () => void
    resolve: (value: T) => void
  }
}

function useHoCModal(id: string) {
  const manager = useModalsManager()

  const modalState = useSyncExternalStore(
    manager.store.subscribe,
    () => manager.store.getState().modals[id],
  )

  const actions = useMemo(() => {
    return {
      hide: () => {
        manager.hide(id)
      },
      remove: () => {
        manager.remove(id)
      },
      resolve: (value: unknown) => {
        manager.resolve(id, value)
      },
    }
  }, [id, manager])

  return useMemo(() => {
    return {
      state: modalState,
      actions,
    }
  }, [modalState, actions])
}

// We use the generic type to infer the props and the result of the modal, they are not actually being used by
// any runtime code, so we can safely ignore the unused vars lint rule.
export type ModalComponent<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  T extends Record<string, unknown> = Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  U = unknown,
> = React.ComponentType<{ id: string }>

export function createModal<P extends Record<string, unknown>, U = unknown>(
  Comp: React.ComponentType<P & InjectedModalProps<U>>,
): ModalComponent<P, U> {
  return function CreateModalHoc({ id }: CreateModalHocProps) {
    const { state, actions } = useHoCModal(id)
    const resolve = (value: U) => {
      actions.resolve(value)
    }

    if (!state.isMounted) return null

    return (
      <Comp
        {...(state.props as P)}
        modal={{
          isOpen: state.isOpen,
          hide: actions.hide,
          remove: actions.remove,
          resolve,
        }}
      />
    )
  }
}
