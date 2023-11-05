import React, { useMemo, useSyncExternalStore } from "react";
import { useModalsManager } from "./ModalsManagerProvider";

export interface CreateModalHocProps {
  id: string;
  defaultIsOpen?: boolean;
  keepMounted?: boolean;
  hide: () => void;
}

export interface InjectedModalProps<T = never> {
  isOpen: boolean;
  hide: () => void;
  remove: () => void;
  resolve: (value: T) => void;
}

function useHoCModal(id: string) {
  const manager = useModalsManager();

  const modalState = useSyncExternalStore(
    manager.store.subscribe,
    () => manager.store.getState().modals[id]
  );

  const actions = useMemo(() => {
    return {
      hide: () => {
        manager.hide(id);
      },
      remove: () => {
        manager.remove(id);
      },
      resolve: (value: any) => {
        manager.resolve(id, value);
      },
    };
  }, [id, manager]);

  return useMemo(() => {
    return {
      state: modalState,
      actions,
    };
  }, [modalState, actions]);
}

export type ReactModalDefinition<T extends React.ComponentType<any>, U> = {
  createProps: (props: React.ComponentProps<T>) => React.ComponentProps<T>;
  createResolveValue: (value: U) => U;
  component: React.ComponentType<CreateModalHocProps>;
};

export function createModal<P extends {}, U = any>(
  Comp: React.ComponentType<P & InjectedModalProps<U>>
): ReactModalDefinition<React.ComponentType<P>, U> {
  return {
    createProps: (props: P) => props,
    createResolveValue: (value: U) => value,
    component: function CreateModalHoc({ id }: CreateModalHocProps) {
      const { state, actions } = useHoCModal(id);
      const resolve = (value: U) => {
        actions.resolve(value);
      };

      if (!state.isMounted) return null;

      return (
        <Comp
          {...(state.props as any)}
          isOpen={state.isOpen}
          hide={actions.hide}
          remove={actions.remove}
          resolve={resolve}
        />
      );
    },
  };
}
