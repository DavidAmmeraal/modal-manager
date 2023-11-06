import {
  createCancelledResult,
  createCompletedResult,
  ModalResult,
} from "./modalResult";
import { promiseDelegate, PromiseDelegate } from "./promiseDelegate";

type ModalsState = {
  modals: {
    [key: string]: {
      props: {
        [key: string]: unknown;
      };
      isOpen: boolean;
      isMounted: boolean;
    };
  };
  promises: {
    [key: string]: PromiseDelegate<ModalResult>;
  };
};

type Update = (updater: Updater) => void;
type Updater = (state: ModalsState) => ModalsState;
export type ModalsStore = ReturnType<typeof createModalsStore>;

const createDefaultState = (): ModalsState => ({
  modals: {},
  promises: {},
});

export function createModalsStore() {
  let state: ModalsState = createDefaultState();
  const listeners = new Set<() => void>();

  const emit = () => {
    listeners.forEach((listener) => listener());
  };

  const update = (updater: Updater) => {
    const newState = updater(state);
    if (newState !== state) {
      state = newState;
      emit();
    }
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  };

  return {
    subscribe,
    getState() {
      return state;
    },
    actions: {
      showModal: showModal(update),
      hideModal: hideModal(update),
      removeModal: removeModal(update),
      resolveModal: resolveModal(update),
    },
  };
}

const showModal =
  (update: Update) =>
  (
    id: string,
    props: {
      [key: string]: unknown;
    }
  ) => {
    update((state) => {
      const promise = state.promises[id];
      if (promise) promise.resolve(createCancelledResult());
      return {
        ...state,
        modals: {
          ...state.modals,
          [id]: {
            props,
            isOpen: true,
            isMounted: true,
          },
        },
        promises: {
          ...state.promises,
          [id]: promiseDelegate(),
        },
      };
    });
  };

const hideModal = (update: Update) => (id: string) => {
  update((state) => ({
    ...state,
    modals: {
      ...state.modals,
      [id]: {
        ...state.modals[id],
        isOpen: false,
      },
    },
  }));
};

const removeModal = (update: Update) => (id: string) => {
  update((state) => {
    const { [id]: promise, ...promises } = state.promises;
    promise.resolve(createCancelledResult());
    return {
      ...state,
      modals: {
        ...state.modals,
        [id]: {
          ...state.modals[id],
          isOpen: false,
          isMounted: false,
        },
      },
      promises,
    };
  });
};

const resolveModal = (update: Update) => (id: string, value: unknown) => {
  update((state) => {
    const { [id]: promise, ...promises } = state.promises;
    promise.resolve(createCompletedResult(value));
    return {
      ...state,
      promises: { ...promises },
    };
  });
};
