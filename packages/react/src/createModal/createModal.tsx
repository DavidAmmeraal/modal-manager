import React from 'react'
import { useCreatedModal } from './useCreatedModal'

export interface CreateModalHocProps {
  id: string
}

type ResolveFunction<T = undefined> = [T] extends [undefined]
  ? () => void
  : (value: T) => void

/**
 * These props will be injected into the component wrapped by `createModal`.
 */
export type InjectedModalProps<T = undefined> = {
  modal: {
    isOpen: boolean
    close: () => void
    remove: () => void
    resolve: ResolveFunction<T>
  }
}

// We use the generic type to infer the props and the result of the modal, they are not actually being used by
// any runtime code, so we can safely ignore the unused vars lint rule.
export type ModalComponent<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  T extends Record<string, unknown> = Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  U = undefined,
> = React.ComponentType<{ id: string }>

export function createModal<P extends Record<string, unknown>, U = undefined>(
  Comp: React.ComponentType<P & InjectedModalProps<U>>,
): ModalComponent<P, U> {
  return function CreateModalHoc({ id }: CreateModalHocProps) {
    const { state, actions } = useCreatedModal(id)

    if (!state?.isMounted) return null

    return (
      <Comp
        {...(state.props as P)}
        modal={{
          isOpen: state.isOpen,
          close: actions.close,
          remove: actions.remove,
          resolve: actions.resolve,
        }}
      />
    )
  }
}
