import { createReactModals } from '@modal-manager/react'
import { ConfirmDialog } from './modals/ConfirmDialog'

export const {
  useManagedModal,
  openModal,
  closeModal,
  ModalsComponent,
  ModalsProvider,
} = createReactModals({
  confirm: ConfirmDialog,
})
