import { createReactModals } from '@modal-manager/react'
import { DrinkModal } from './modals/DrinkModal'
import { FoodModal } from './modals/FoodModal'

export const {
  ModalsProvider,
  ModalsComponent,
  useManagedModal,
  ReactModalManager,
} = createReactModals()
  .registerModal('food', FoodModal)
  .registerModal('drink', DrinkModal)
