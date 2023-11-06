import { createModalsStore } from "./modalsStore";

export class ModalsManager {
  constructor(public readonly store = createModalsStore()) {}

  public show(id: string, props: Record<string, unknown>) {
    this.store.actions.showModal(id, props);
    return this.store.getState().promises[id].promise;
  }

  public hide(id: string) {
    this.store.actions.hideModal(id);
  }

  public remove(id: string) {
    this.store.actions.removeModal(id);
  }

  public resolve(id: string, value: unknown) {
    this.store.actions.resolveModal(id, value);
  }
}
