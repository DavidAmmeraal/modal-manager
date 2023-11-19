/**
 * Represents the result of a finished modal interaction.
 *
 * A modal can be cancelled or completed. If it is completed, it can have a value.
 */
export type ModalResult<T = unknown> =
  | {
      isDismissed: false
      isComplete: true
      value: T
    }
  | {
      isComplete: false
      isDismissed: true
    }

export const createCompletedResult = <T>(value: T): ModalResult<T> => ({
  isComplete: true,
  isDismissed: false,
  value,
})

export const createCancelledResult = (): ModalResult => ({
  isComplete: false,
  isDismissed: true,
})
