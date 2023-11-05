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
};

type Update = (updater: Updater) => void;
type Updater = (state: ModalsState) => ModalsState;
export type ModalsStore = ReturnType<typeof createModalsStore>;

const createDefaultState = (): ModalsState => ({
  modals: {},
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
      registerModal: registerModal(update),
    },
  };
}

const registerModal = (update: Update) => (id: string) => {
  update((state) => ({
    ...state,
    modals: {
      ...state.modals,
      [id]: {
        props: {},
        isOpen: false,
        isMounted: false,
      },
    },
  }));
};

const showModal =
  (update: Update) =>
  (
    id: string,
    props: {
      [key: string]: unknown;
    }
  ) => {
    console.log("showing modal ", id);
    update((state) => ({
      ...state,
      modals: {
        ...state.modals,
        [id]: {
          props,
          isOpen: true,
          isMounted: true,
        },
      },
    }));
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
  update((state) => ({
    ...state,
    modals: {
      ...state.modals,
      [id]: {
        ...state.modals[id],
        isOpen: false,
        isMounted: false,
      },
    },
  }));
};
