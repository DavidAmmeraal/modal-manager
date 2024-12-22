import { createModalsManager } from '@davidammeraal/modal-manager-react'
import { ConfirmDialog } from './modals/ConfirmDialog'

export const {
  openModal,
  closeModal,
  react: {
    ModalsPortal
  },
} = createModalsManager({
  confirm: ConfirmDialog,
})
