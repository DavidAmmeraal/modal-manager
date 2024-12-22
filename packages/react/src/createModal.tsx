import React from 'react';


import { ModalComponent } from './types';
import { CompleteOptions, useCreatedModal } from './useCreatedModal';
import { invariant, ModalsStore } from '@davidammeraal/modal-manager-core';

interface CreateModalHocProps {
  id: string;
  store: ModalsStore;
}

type CompleteFunction<T = undefined> = [T] extends [undefined]
  ? () => void
  : (value: T, options?: CompleteOptions) => void;

/**
 * These props will be injected into the component wrapped by `createModal`.
 */
export type InjectedModalProps<T = undefined> = {
  modal: {
    /**
     * The current open state of the modal.
     */
    isOpen: boolean;
    /**
     * Should be called when the user has completed their actions within the dialog.
     */
    complete: CompleteFunction<T>;
    /**
     * Should be called when the modal has finished its closing transition.
     * @returns
     */
    remove: () => void;
  };
};

/**
 * Can be used to wrap a react component and register it to the modal manager.
 *
 * Will inject a `modal` prop into the component that can be used to manage the modal.
 */
export const createModal = <P extends Record<string, unknown>, U = undefined>(
  Comp: React.ComponentType<P & InjectedModalProps<U>>,
): ModalComponent<P, U> => {
  return {
    component: function CreateModalHoc({ id, store }: CreateModalHocProps) {
      const { state, actions } = useCreatedModal(store, id);

      invariant(state, 'No state for modal');

      const complete: CompleteFunction<U> = (
        value?: U,
        options: CompleteOptions = {
          remove: true,
        },
      ) => actions.complete(value, options);

      return (
        <Comp
          {...(state.props as P)}
          modal={{
            isOpen: state.isOpen,
            complete,
            remove: actions.remove,
          }}
        />
      );
    },
  } as ModalComponent<P, U>;
};
