// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModalResult<T = any> =
  | {
      isCancelled: false;
      isComplete: true;
      value: T;
    }
  | {
      isComplete: false;
      isCancelled: true;
    };

export const createCompletedResult = <T>(value: T): ModalResult<T> => ({
  isComplete: true,
  isCancelled: false,
  value,
});

export const createCancelledResult = (): ModalResult => ({
  isComplete: false,
  isCancelled: true,
});
