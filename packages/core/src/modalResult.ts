/**
 * Represents the result of a finished modal interaction.
 *
 * A modal can be cancelled or completed. If it is completed, it can have a value.
 */
export type ModalResult<T = unknown> =
  | {
      isCancelled: false;
      isComplete: true;
      value: T;
    }
  | {
      isComplete: false;
      isCancelled: true;
    };

export const createCompletedResult = <T = unknown>(
  value: T,
): ModalResult<T> => ({
  isComplete: true,
  isCancelled: false,
  value,
});

export const createCancelledResult = (): ModalResult => ({
  isComplete: false,
  isCancelled: true,
});
