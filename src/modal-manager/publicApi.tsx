import { ModalsManager } from "./ModalsManager";

export const createPublicApi = <TModalsManager extends ModalsManager>(
  manager: TModalsManager
) => {
  return {
    show: manager.show.bind(manager) as TModalsManager["show"],
    hide: manager.hide.bind(manager) as TModalsManager["hide"],
    remove: manager.remove.bind(manager) as TModalsManager["remove"],
  };
};
