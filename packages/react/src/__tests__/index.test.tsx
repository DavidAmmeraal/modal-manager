import React, { useEffect } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalResult, promiseWithResolvers, PromiseWithResolvers } from '@davidammeraal/modal-manager-core';
import { createModal } from '../createModal';
import { CloseModalOptions } from '../types';
import { createModalsManager, ModalsManager } from '..';


type ExampleModalProps = {
  testId?: string;
  title: string;
  description: string;
  exitTransition?: PromiseWithResolvers;
};

type ModalValue = 'confirm' | 'cancel';

const confirmLabel = 'confirm';
const confirmAndDontRemoveLabel = 'confirm and dont remove';
const modalTestId = 'modal';
const closedContent = 'modal is closed but not removed';

const ExampleModal = createModal<ExampleModalProps, ModalValue>(
  ({
    title,
    description,
    exitTransition,
    testId = 'modal',
    modal: { isOpen, complete, remove },
  }) => {
    const handleConfirm = (): void => complete('confirm');
    const handleConfirmAndDontRemove = (): void =>
      complete('confirm', { remove: false });

    useEffect(() => {
      if (!isOpen && exitTransition?.promise) {
        // Fake a closing transition
        exitTransition.promise.then(() => {
          remove();
        });
      }
    }, [exitTransition, isOpen, remove]);

    return (
      <div data-testid={testId}>
        {isOpen ? (
          <div>
            <h1>{title}</h1>
            <div>{description}</div>
            <button onClick={handleConfirm}>{confirmLabel}</button>
            <button onClick={handleConfirmAndDontRemove}>
              {confirmAndDontRemoveLabel}
            </button>
          </div>
        ) : (
          <div>{closedContent}</div>
        )}
      </div>
    );
  },
);

const map = {
  example: ExampleModal,
  anotherExample: ExampleModal,
} as const;

type ModalsManagerFixture = Pick<
  ModalsManager<typeof map>,
  'openModal' | 'closeModal' | 'cancelModal'
> & {
  renderModals: () => void;
};

/**
 * Returns ModalsManager with functions wrapped in `act()` so we don't have to do it over and over again in tests.
 * @param key
 * @param props
 * @returns
 */
const buildModalsManagerFixture = (): ModalsManagerFixture => {
  const manager = createModalsManager(map);

  const openModal = (
    key: string,
    props: Record<string, unknown>,
  ): Promise<unknown> => {
    const delegate = promiseWithResolvers<unknown>();

    act(() => {
      manager.openModal(key as never, props as never).then(v => {
        delegate.resolve(v);
      });
    });

    return delegate.promise;
  };

  const closeModal = (
    key: string,
    value: unknown,
    options: CloseModalOptions,
  ): Promise<void> => {
    const delegate = promiseWithResolvers<void>();
    act(() => {
      manager
        .closeModal(key as never, value as never, options)
        .then(() => delegate.resolve());
    });
    return delegate.promise;
  };

  const cancelModal = (key: string): void => {
    act(() => {
      manager.cancelModal(key as never);
    });
  };

  return {
    ...manager,
    openModal: openModal as typeof manager['openModal'],
    closeModal: closeModal as typeof manager['closeModal'],
    cancelModal: cancelModal as typeof manager['cancelModal'],
    renderModals: (): void => {
      render(
        <div>
          <manager.react.ModalsPortal />
        </div>,
      );
    },
  };
};

describe('modals', () => {
  describe('when calling `ModalManager.open(key, props)`', () => {
    it('should open modal for given key', async () => {
      const { renderModals, openModal } = buildModalsManagerFixture();
      renderModals();

      const data = [
        {
          title: 'title',
          description: 'description',
        },
        {
          title: 'other title',
          description: 'other description',
        },
      ];

      openModal('example', data[0]);
      openModal('anotherExample', data[1]);

      expect(await screen.findByText(data[0].title)).toBeInTheDocument();
      expect(await screen.findByText(data[1].title)).toBeInTheDocument();
    });

    it('should pass `props` parameter as props to modal', async () => {
      const { openModal, renderModals } = buildModalsManagerFixture();
      renderModals();

      const title = 'A modal title';
      const description = 'A modal description';

      openModal('example', { title, description });

      expect(await screen.findByText(title)).toBeInTheDocument();
      expect(await screen.findByText(description)).toBeInTheDocument();
    });

    it('the returned promise should resolve to `value` when modal calls `props.modal.complete(value)`', async () => {
      const { openModal, renderModals } = buildModalsManagerFixture();
      renderModals();

      expect(screen.queryByText(confirmLabel)).not.toBeInTheDocument();

      const promise = openModal('example', {
        title: 'title',
        description: 'description',
      });

      expect(await screen.findByText('title')).toBeInTheDocument();

      userEvent.click(await screen.findByText(confirmLabel));
      const res = await promise;

      expect(res).toEqual({
        isComplete: true,
        isCancelled: false,
        value: 'confirm',
      });
    });

    describe('twice for same modal', () => {
      it('should update properties of modal component with the props of the second call', async () => {
        const { openModal, renderModals } = buildModalsManagerFixture();
        renderModals();
        openModal('example', { title: 'first', description: '' });
        expect(await screen.findByText('first')).toBeInTheDocument();
        openModal('example', { title: 'second', description: '' });
        expect(await screen.findByText('second')).toBeInTheDocument();
      });

      it('should resolve both calls when `props.modal.complete()` is called by modal', async () => {
        const { openModal, renderModals } = buildModalsManagerFixture();
        renderModals();
        const first = openModal('example', { title: 'first', description: '' });

        const second = openModal('example', {
          title: 'second',
          description: '',
        });

        userEvent.click(await screen.findByText(confirmLabel));

        expect(first).resolves.toBe('confirm');
        expect(second).resolves.toBe('confirm');
      });
    });

    describe('when opening multiple modals', () => {
      it('the modals should be rendered in order as they where opened', async () => {
        const { renderModals, openModal } = buildModalsManagerFixture();

        renderModals();

        openModal('example', {
          testId: 'first',
          title: 'first modal',
          description: '',
        });

        openModal('anotherExample', {
          testId: 'second',
          title: 'second modal',
          description: '',
        });

        const firstModal = await screen.findByTestId('first');
        const secondModal = await screen.findByTestId('second');

        expect(firstModal.compareDocumentPosition(secondModal)).toBe(
          Node.DOCUMENT_POSITION_FOLLOWING,
        );
      });
    });
  });

  describe('when calling `props.modal.complete()` from within modal', () => {
    it('should unmount by default', async () => {
      const { openModal, renderModals } = buildModalsManagerFixture();
      renderModals();

      expect(screen.queryByText(confirmLabel)).not.toBeInTheDocument();

      const promise = openModal('example', {
        title: 'title',
        description: 'description',
      });

      expect(await screen.findByText('title')).toBeInTheDocument();

      userEvent.click(await screen.findByText(confirmLabel));
      await promise;

      expect(screen.queryByText('title')).not.toBeInTheDocument();
    });

    describe('with `options.remove` set to `false`', () => {
      const buildCallCompleteWithoutRemoveFixture = (): {
        callRemove: () => void;
        setup: () => Promise<void>;
        openPromise: Promise<ModalResult<ModalValue>>;
      } => {
        const { renderModals, openModal } = buildModalsManagerFixture();

        const exitTransition = promiseWithResolvers();
        const openPromise = promiseWithResolvers<ModalResult<ModalValue>>();

        return {
          setup: async (): Promise<void> => {
            renderModals();
            openModal('example', {
              title: 'title',
              description: 'description',
              exitTransition,
            }).then(openPromise.resolve);

            expect(await screen.findByText('title')).toBeInTheDocument();

            await userEvent.click(
              await screen.findByText(confirmAndDontRemoveLabel),
            );
          },
          callRemove: (): void => {
            act(() => {
              exitTransition.resolve();
            });
          },
          openPromise: openPromise.promise,
        };
      };
      it('should hide the modal but not unmount it', async () => {
        const { setup } = buildCallCompleteWithoutRemoveFixture();
        await setup();
        expect(await screen.findByText(closedContent)).toBeInTheDocument();
      });

      it('should unmount after `remove()` is called by modal', async () => {
        const { setup, callRemove } = buildCallCompleteWithoutRemoveFixture();
        await setup();
        expect(screen.getByTestId(modalTestId)).toBeInTheDocument();
        callRemove();
        await waitFor(() => {
          expect(screen.queryByTestId(modalTestId)).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('when calling `ModalManager.closeModal(key, value)`', () => {
    describe('on an open modal', () => {
      it('the return promise should resolve the pending promise returned from `ModalManager.openModal()` with the value passed to `ModalManager.closeModal(key, value)`', async () => {
        const { openModal, closeModal } = buildModalsManagerFixture();

        const pendingOpenPromise = openModal('example', {
          title: 'title',
          description: 'description',
        });

        await closeModal('example', 'cancel');

        expect(pendingOpenPromise).resolves.toEqual({
          isComplete: true,
          isCancelled: false,
          value: 'cancel',
        });
      });

      it('should remove the modal by default', async () => {
        const {
          openModal,
          closeModal,
          renderModals,
        } = buildModalsManagerFixture();

        renderModals();

        openModal('example', {
          testId: '1',
          title: 'title',
          description: 'description',
        });

        expect(await screen.findByTestId('1')).toBeInTheDocument();
        await closeModal('example', 'cancel');
        expect(screen.queryByTestId('1')).not.toBeInTheDocument();
      });

      it('should not remove the modal if `options.remove` is set to `false`', async () => {
        const {
          openModal,
          closeModal,
          renderModals,
        } = buildModalsManagerFixture();

        renderModals();

        openModal('example', {
          testId: '1',
          title: 'title',
          description: 'description',
        });

        expect(await screen.findByTestId('1')).toBeInTheDocument();
        closeModal('example', 'cancel', { remove: false });
        expect(screen.getByTestId('1')).toBeInTheDocument();
      });
    });

    describe('on a modal that is not open', () => {
      it('the returned promise should resolve immediately', () => {
        const { closeModal } = buildModalsManagerFixture();
        expect(closeModal('example', 'cancel')).resolves.toBeUndefined();
      });
    });
  });

  describe('when calling `ModalManager.cancelModal(key)`', () => {
    it('should immediately remove the modal', async () => {
      const {
        renderModals,
        openModal,
        cancelModal,
      } = buildModalsManagerFixture();

      renderModals();

      openModal('example', {
        title: 'some title',
        description: 'some description',
      });

      expect(await screen.findByTestId(modalTestId)).toBeInTheDocument();

      cancelModal('example');

      expect(screen.queryByTestId(modalTestId)).not.toBeInTheDocument();
    });

    it('should resolve and promises returned by `ModalManager.openModal(key)` with a cancelled ModalResult without a value', async () => {
      const {
        renderModals,
        openModal,
        cancelModal,
      } = buildModalsManagerFixture();

      renderModals();

      const promise = openModal('example', {
        title: 'some title',
        description: 'some description',
      });

      expect(await screen.findByTestId(modalTestId)).toBeInTheDocument();

      cancelModal('example');

      const result = await promise;
      expect(result).toMatchObject({
        isCancelled: true,
      });
    });
  });
});
