import { createReactModals } from "./modal-manager/react/createReactModals";
import { FoodModal } from "./modals/FoodModal";
import { DrinkModal } from "./modals/DrinkModal";

export const { ModalsProvider, ModalsComponent, modals, useManagedModal } =
  createReactModals()
    .registerModal("food", FoodModal)
    .registerModal("drink", DrinkModal);
