import { createReactModals } from "./modal-manager/react/createReactModals";
import { FoodModal } from "./modals/FoodModal";
import { DrinkModal } from "./modals/DrinkModal";

export const { ModalsProvider, Modals, modalsApi, useManagedModal } =
  createReactModals()
    .registerModal("food", FoodModal)
    .registerModal("drink", DrinkModal);
