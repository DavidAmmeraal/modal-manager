
import { ModalResult, ModalsStore } from '@davidammeraal/modal-manager-core';
import { InjectedModalProps } from './createModal';

export type ModalsMap = Record<string, ModalComponent>;
export type CloseModalOptions = {
  /**
   * If set to true, will immediately unmount the component after it's been closed.
   */
  remove?: boolean;
};

export type ModalComponent<
  T extends Record<string, unknown> | unknown = unknown,
  U = unknown
> = {
  component: React.ComponentType<{ id: string; store: ModalsStore }>;
  props: T;
  resolvedVal: U;
};

export type OpenModalFn<T extends ModalsMap> = <TKey extends keyof T>(
  key: TKey,
  ...args: T[TKey]['props'] extends InjectedModalProps<undefined> ? [] :
  T[TKey]['props'] extends Record<string, unknown>
    ? [T[TKey]['props']]
    : []
) => Promise<ModalResult<T[TKey]['resolvedVal']>>;

export type CloseModalFn<T extends ModalsMap> = <TKey extends keyof T>(
  key: TKey,
  value: T[TKey]['resolvedVal'],
  options?: CloseModalOptions,
) => Promise<void>;

export type CancelModalFn<T extends ModalsMap> = <TKey extends keyof T>(
  key: TKey,
) => void;

export type CreateModal<P extends Record<string, unknown>, U = unknown> = (
  Comp: React.ComponentType<P & InjectedModalProps<U>>,
) => ModalComponent<P, U>;
