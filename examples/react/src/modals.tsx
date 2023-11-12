import { createReactModals } from '@modal-manager/react'
import { ConfirmDialog } from './modals/ConfirmDialog'

export const {
  ModalsProvider,
  ModalsComponent,
  useManagedModal,
  openModal,
  closeModal,
} = createReactModals({
  confirm: ConfirmDialog,
})
