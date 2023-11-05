import { createReactModals } from "./modal-manager/react/createReactModals";
import { FoodModal } from "./modals/FoodModal";
import { DrinkModal } from "./modals/DrinkModal";

export const { useManagedModal, ModalsProvider, Modals, manager } =
  createReactModals()
    .registerModal("food", FoodModal)
    .registerModal("drink", DrinkModal);
