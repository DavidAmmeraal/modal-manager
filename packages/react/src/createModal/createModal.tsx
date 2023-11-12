/* eslint-disable @typescript-eslint/no-explicit-any */
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

export type ModalComponent<T extends Record<string, unknown> = any, U = any> = {
  component: React.ComponentType<{ id: string }>
  props: T
  resolvedVal: U
}

export function createModal<P extends Record<string, any>, U = any>(
  Comp: React.ComponentType<P & InjectedModalProps<U>>,
): ModalComponent<P, U> {
  return {
    component: function CreateModalHoc({ id }: CreateModalHocProps) {
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
    },
  } as ModalComponent<P, U>
}
