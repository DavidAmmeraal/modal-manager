import { createModalsManager } from '@davidammeraal/modal-manager-react'
import { ConfirmDialog } from './modals/ConfirmDialog'
import { SimpleModal } from './modals/SimpleModal'

export const {
  openModal,
  closeModal,
  react: {
    ModalsPortal
  },
} = createModalsManager({
  simple: SimpleModal,
  confirm: ConfirmDialog,
})
