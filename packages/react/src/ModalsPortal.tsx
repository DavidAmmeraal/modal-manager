import React, { useSyncExternalStore } from 'react';

import { ReactModalsManager } from './ReactModalsManager';
import { ModalsMap } from './types';

export const createModalsPortal = <T extends ModalsMap>(
  manager: ReactModalsManager<T>,
) => {
  return function ModalsPortal(): React.ReactElement {
    const modals = useSyncExternalStore(
      listener => manager.store.subscribe(listener),
      () => manager.store.mountedModals,
    );
    return (
      <>
        {new Array(...modals).map(k => {
          const { component: Component } = manager.components[k];
          return <Component key={k} id={k} store={manager.store} />;
        })}
      </>
    );
  };
};
