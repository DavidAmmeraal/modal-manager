import { invariant } from "./invariant";
import { createCancelledResult, createCompletedResult, ModalResult } from "./ModalResult";
import { promiseWithResolvers, PromiseWithResolvers } from "./promiseWithResolvers";

export type ModalState = {
  props:
    | {
        [key: string]: unknown;
      }
    | undefined;
  isOpen: boolean;
  isMounted: boolean;
};

type ModalPromises = {
  open?: PromiseWithResolvers<ModalResult>;
  close?: PromiseWithResolvers;
};

type ModalEntry = {
  state: ModalState;
  promises: ModalPromises;
};

export type ModalKey = string;

type ModalsMap = Map<ModalKey, ModalEntry>;
const createDefaultState = (): ModalsMap => new Map();
const createDefaultModalEntry = (): ModalEntry => ({
  state: {
    props: {},
    isOpen: false,
    isMounted: false,
  },
  promises: {},
});

/**
 * Contains a registry of all modals and maintains their states.
 */
export class ModalsStore {
  modalsMap: ModalsMap = createDefaultState();

  listeners: Set<() => void> = new Set();

  modalListeners: Map<ModalKey, Set<() => void>> = new Map();

  // In order to simplify working with useSyncExternalStore the list of open modals should be updated immutably, hence not using a Set.
  public mountedModals: string[] = [];

  private updateModalState(
    key: ModalKey,
    fn: (state: ModalState) => ModalState,
  ): void {
    const entry = this.modalsMap.get(key);
    if (!entry) return;
    const newState = fn(entry.state);
    entry.state = newState;
    this.emitModalUpdate(key);
  }

  private emitModalUpdate(key: ModalKey): void {
    this.modalListeners.get(key)?.forEach(listener => listener());
  }

  private getEntry = (key: ModalKey): ModalEntry => {
    const value = this.modalsMap.get(key);
    invariant(value, `No modal found for key ${key}`);
    return value;
  };

  private getOpenPromise(
    key: ModalKey,
  ): PromiseWithResolvers<ModalResult> | undefined {
    return this.getEntry(key).promises.open;
  }

  private getClosePromise(key: ModalKey): PromiseWithResolvers | undefined {
    return this.getEntry(key).promises.close;
  }

  private emitUpdate(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Subscribe to changes of modals registry.
   */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /**
   * Subcribe to state changes for a specific modal.
   * @param key
   * @param listener
   * @returns
   */
  subscribeToModal = (key: ModalKey, listener: () => void): (() => void) => {
    this.modalListeners.set(key, this.modalListeners.get(key) || new Set());
    this.modalListeners.get(key)?.add(listener);

    return () => {
      this.modalListeners.get(key)?.delete(listener);
    };
  };

  getModalState = (key: ModalKey): ModalState | undefined => {
    return this.modalsMap.get(key)?.state;
  };

  register = (key: ModalKey): void => {
    this.modalsMap.set(key, createDefaultModalEntry());
  };

  /**
   * Opens a modal with the given key and props.
   *
   * In case a modal is already open, we update the props.
   *
   * Will push the modal to the set of mounted modals in `ModalsStore.mountedModals`
   * @param key
   * @param props
   * @returns
   */
  open = (
    key: ModalKey,
    props: Record<string, unknown>,
  ): Promise<ModalResult> => {
    const entry = this.getEntry(key);

    if (this.mountedModals.indexOf(key) === -1) {
      this.mountedModals = [...this.mountedModals, key];
      this.emitUpdate();
    }

    this.updateModalState(key, state => ({
      ...state,
      props,
      isOpen: true,
      isMounted: true,
    }));

    // In case the modal was already open, there will already be a promise, so we don't create a new one and just return the existing one.
    if (!entry.promises.open) {
      entry.promises.open = promiseWithResolvers();
    }

    return entry.promises.open.promise;
  };

  /**
   * Closes a modal, will set the `isOpen` property of the modal to false, please note that this does not
   * cause the modal to be unmounted just yet. In order to unmount the modal, `remove()` will have to be called. This
   * in order to facilitate exit animations for modals.
   *
   * @param key
   * @returns
   */
  close = (key: ModalKey): Promise<void> => {
    const entry = this.getEntry(key);

    // If the modal isn't open, we can immediately resolve.
    if (!entry.state.isOpen) {
      return Promise.resolve();
    }

    const delegate = this.getClosePromise(key) || promiseWithResolvers();
    this.updateModalState(key, state => {
      return {
        ...state,
        isOpen: false,
      };
    });
    entry.promises.close = delegate;
    return delegate.promise;
  };

  resolve = (key: ModalKey, value: unknown): void => {
    const promise = this.getOpenPromise(key);
    promise?.resolve(createCompletedResult(value));
    delete this.modalsMap.get(key)?.promises.open;
  };

  remove = (key: ModalKey): void => {
    this.updateModalState(key, state => {
      return {
        ...state,
        isOpen: false,
        isMounted: false,
      };
    });
    this.getOpenPromise(key)?.resolve(createCancelledResult());
    this.getClosePromise(key)?.resolve(undefined);
    delete this.modalsMap.get(key)?.promises.open;
    delete this.modalsMap.get(key)?.promises.close;
    this.mountedModals = this.mountedModals.filter(k => k !== key);
    this.emitUpdate();
  };
}
