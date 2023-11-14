import { ModalResult, ModalsStore } from '@modal-manager/core'
import React from 'react'

import { ModalComponent } from './createModal/createModal'
import { createModalsComponent } from './ModalsComponent'
import { createModalsProvider } from './ModalsProvider'
import { ReactModalsManager } from './ReactModalManager'
import { createUseManagedModal, ModalHookOptions } from './useManagedModal'

type ComponentsMap = Record<string, ModalComponent>

type PropsAndResult<
  T extends ComponentsMap | undefined,
  TKey extends keyof T | ModalComponent | undefined,
> = TKey extends keyof T
  ? T[TKey] extends ModalComponent
    ? [props: T[TKey]['props'], result: T[TKey]['resolvedVal']]
    : never
  : TKey extends ModalComponent
  ? [props: TKey['props'], result: TKey['resolvedVal']]
  : never

type OpenModalFn<T extends ComponentsMap> = <
  TKey extends keyof T | ModalComponent,
>(
  key: TKey,
  props: PropsAndResult<T, TKey>[0],
) => Promise<ModalResult<PropsAndResult<T, TKey>[1]>>

type CloseModalFn<T extends ComponentsMap> = <
  TKey extends keyof T | ModalComponent,
>(
  key: TKey,
) => void

type CreateModalsReturn<T extends ComponentsMap> = {
  ModalsProvider: React.FC<React.PropsWithChildren>
  ModalsComponent: React.FC
  useManagedModal: UseManagedModal<T>
  openModal: OpenModalFn<T>
  closeModal: CloseModalFn<T>
}

type UseManagedModal<T extends ComponentsMap = ComponentsMap> = <
  TKey extends keyof T | ModalComponent,
>(
  id: TKey,
  options?: ModalHookOptions,
) => {
  open: (
    props: PropsAndResult<T, TKey>[0],
  ) => Promise<ModalResult<PropsAndResult<T, TKey>[1]>>
  close: () => Promise<void>
}

export function createReactModals<T extends ComponentsMap = ComponentsMap>(
  modalsMap: T,
): CreateModalsReturn<T> {
  const store = new ModalsStore()
  const manager = new ReactModalsManager(store, modalsMap)

  return {
    openModal: manager.openModal as OpenModalFn<T>,
    closeModal: manager.closeModal as CloseModalFn<T>,
    ModalsProvider: createModalsProvider(store),
    ModalsComponent: createModalsComponent(manager),
    useManagedModal: createUseManagedModal(manager) as UseManagedModal<T>,
  }
}
