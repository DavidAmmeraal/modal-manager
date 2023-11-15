import { ModalResult } from '@modal-manager/core'
import { ModalComponent } from './createModal/createModal'

export type ComponentsMap = Record<string, ModalComponent>
type CloseModalOptions = {
  remove?: boolean
}

export type PropsAndResult<
  T extends ComponentsMap | undefined,
  TKey extends keyof T | ModalComponent | undefined,
> = TKey extends keyof T
  ? T[TKey] extends ModalComponent
    ? [props: T[TKey]['props'], result: T[TKey]['resolvedVal']]
    : never
  : TKey extends ModalComponent
  ? [props: TKey['props'], result: TKey['resolvedVal']]
  : never

export type OpenModalFn<T extends ComponentsMap = ComponentsMap> = <TKey extends keyof T | ModalComponent>(
  key: TKey,
  props: PropsAndResult<T, TKey>[0],
) => Promise<ModalResult<PropsAndResult<T, TKey>[1]>>

export type CloseModalFn<T extends ComponentsMap = ComponentsMap> = <
  TKey extends keyof T | ModalComponent,
>(
  key: TKey,
  options?: CloseModalOptions,
) => Promise<void>
