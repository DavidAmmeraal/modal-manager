
import { ModalsStore } from '@davidammeraal/modal-manager-core';
import {
  CancelModalFn,
  CloseModalFn,
  ModalComponent,
  ModalsMap,
  OpenModalFn,
} from './types';

export class ReactModalsManager<T extends ModalsMap = ModalsMap> {
  constructor(
    public readonly store: ModalsStore,
    private componentsMap: Record<string, ModalComponent>,
  ) {
    Object.keys(componentsMap).forEach(id => {
      this.store.register(id);
    });
  }

  get components(): Record<string, ModalComponent> {
    return { ...this.componentsMap };
  }

  openModal: OpenModalFn<T> = async (key, props = {}) => {
    return this.store.open(key as string, props);
  };

  closeModal: CloseModalFn<T> = async (
    key,
    value,
    options = { remove: true },
  ) => {
    this.store.resolve(key as string, value);
    const promise = this.store.close(key as string);
    if (options.remove) {
      this.store.remove(key as string);
    }
    return promise;
  };

  cancelModal: CancelModalFn<T> = async key => {
    this.store.remove(key as string);
  };
}
