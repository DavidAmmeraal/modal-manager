import { ModalResult, ModalsStore } from "@davidammeraal/modal-manager-core";
import { CancelModalFn, OpenModalFn, CloseModalFn, ModalsMap, ModalComponent } from "./types";
import { ReactModalsManager } from "./ReactModalsManager";
import { createModalsPortal } from "./ModalsPortal";
import { createModal } from "./createModal";


export { createModal };
export { ModalsMap, ModalComponent, ModalResult };

export type ModalsManager<T extends ModalsMap> = {
  /**
   * React specific namespace
   */
  react: {
    /**
     * This component must be placed where you want the modals to be rendered.
     */
    ModalsPortal: React.FC;
  };
  /**
   * Opens a modal, props can be passed if the modal supports it.
   *
   * Returns a promise that contains the completed value of the modal if it supports it.
   *
   * ```tsx
   * const result = await modalsManager.openModal('some-modal', { foo: 'bar' })
   *
   * if(result.isComplete) {
   *  console.log('The value is ', result.value)
   * }
   * ```
   */
  openModal: OpenModalFn<T>;
  /**
   * Allows a modal to be closed externally (so outside of the modal component itsself), in majority of cases this shouldn't be used,
   * as usually the modal should control its own lifecycle once opened through the properties injected by the `createModal`
   * higher order component.
   *
   * This will remove the modal by default (it won't wait on exit transition.)
   */
  closeModal: CloseModalFn<T>;
  /**
   * Escape hatch to close a modal without resolving it's value. Will result in the `openModal` promise to resolve with a cancelled modal result.
   */
  cancelModal: CancelModalFn<T>;
};

/**
 * Creates an instance of a modal manager.
 * @param modalsMap
 * @returns
 */
export function createModalsManager<T extends ModalsMap = ModalsMap>(
  modalsMap: T,
): ModalsManager<T> {
  const store = new ModalsStore();
  const manager = new ReactModalsManager<T>(store, modalsMap);

  return {
    react: {
      ModalsPortal: createModalsPortal(manager),
    },
    openModal: manager.openModal,
    closeModal: manager.closeModal,
    cancelModal: manager.cancelModal,
  };
}
