import { ModalsStore, ModalState } from '@davidammeraal/modal-manager-core';
import { useMemo, useSyncExternalStore } from 'react';


export type CompleteOptions = {
  remove: boolean;
};

type UseCreatedModalReturn = {
  state?: ModalState;
  actions: {
    remove: () => void;
    complete: (value: unknown, options: CompleteOptions) => void;
  };
};

export function useCreatedModal(
  store: ModalsStore,
  id: string,
): UseCreatedModalReturn {
  const modalState = useSyncExternalStore(
    listener => store.subscribeToModal(id, listener),
    () => store.getModalState(id),
  );

  const actions = useMemo(() => {
    return {
      remove: (): void => {
        store.remove(id);
      },
      complete: (value: unknown, { remove }: CompleteOptions): void => {
        store.resolve(id, value);
        store.close(id);
        if (remove) store.remove(id);
      },
    };
  }, [id, store]);

  return useMemo<UseCreatedModalReturn>(() => {
    return {
      state: modalState,
      actions,
    };
  }, [modalState, actions]);
}
