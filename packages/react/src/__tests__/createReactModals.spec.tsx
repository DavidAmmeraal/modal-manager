import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createReactModals } from '../createReactModals'
import { ModalResult } from '@modal-manager/core'
import { TestModal } from './helpers/TestModal'
import { ModalChoice, TestModalWithChoice } from './helpers/TestModalWithChoice'

const setup = () => {
  const { openModal, closeModal, ModalsProvider, ModalsComponent } =
    createReactModals({
      test: TestModal,
      choice: TestModalWithChoice,
    })

  const AppWithModal = ({ children }: React.PropsWithChildren) => {
    return (
      <ModalsProvider>
        <ModalsComponent />
        {children}
      </ModalsProvider>
    )
  }

  return {
    AppWithModal,
    openModal,
    closeModal,
    ModalsComponent,
    ModalsProvider,
  }
}

describe('@modal-manager/react', () => {
  it('the provider and modals component should render without stuff breaking', async () => {
    const { AppWithModal } = setup()
    render(<AppWithModal />)
  })

  it('ModalsProvider should render its children', () => {
    const { AppWithModal } = setup()
    render(
      <AppWithModal>
        <div>a child</div>
      </AppWithModal>,
    )

    expect(screen.getByText('a child')).toBeInTheDocument()
  })

  it('should not render closed modals', () => {
    const { AppWithModal } = setup()
    render(
      <AppWithModal>
        <div>a child</div>
      </AppWithModal>,
    )

    expect(
      screen.queryByRole('button', { name: 'close' }),
    ).not.toBeInTheDocument()
  })

  describe('when using `ReactModalsManager.openModal` and `closeModal` API', () => {
    it('should open the modal when `openModal()` is called', async () => {
      const { AppWithModal, openModal } = setup()
      render(
        <AppWithModal>
          <div>a child</div>
        </AppWithModal>,
      )

      act(() => {
        openModal('test', { title: 'This is the title of the opened modal' })
      })

      expect(
        await screen.findByText('This is the title of the opened modal'),
      ).toBeInTheDocument()
    })

    it('should close the modal when `closeModal()` is called', async () => {
      const { AppWithModal, openModal, closeModal } = setup()
      render(
        <AppWithModal>
          <div>a child</div>
        </AppWithModal>,
      )

      act(() => {
        openModal('test', { title: 'This is the title of the opened modal' })
      })

      expect(
        await screen.findByText('This is the title of the opened modal'),
      ).toBeInTheDocument()

      act(() => {
        closeModal('test')
      })

      expect(
        screen.queryByText('This is the title of the opened modal'),
      ).not.toBeVisible()
    })

    it('when the modal modal is removed, it should settle any outstanding promises for `openModal` and `closeModal`', async () => {
      jest.useFakeTimers()
      const { AppWithModal, openModal, closeModal } = setup()
      render(
        <AppWithModal>
          <div>a child</div>
        </AppWithModal>,
      )

      let openPromise: Promise<ModalResult>
      let closePromise: Promise<void>

      act(() => {
        openPromise = openModal('test', {
          title: 'This is the title of the opened modal',
        })
      })

      expect(
        await screen.findByText('This is the title of the opened modal'),
      ).toBeDefined()

      act(() => {
        closePromise = closeModal('test')
      })

      act(() => {
        jest.advanceTimersByTime(1005)
      })

      expect(screen.queryByText('This is the title of the opened modal')).toBe(
        null,
      )

      // weirdness with vscode jest plugin and failing assertions in waitFor,
      // this has something to do with it:
      // https://github.com/testing-library/react-hooks-testing-library/issues/631
      jest.useRealTimers()

      await waitFor(() => {
        expect(openPromise).resolves.toStrictEqual({
          isDismissed: true,
          isComplete: false,
        })

        expect(closePromise).resolves.toBeUndefined()
      })
    })

    describe('when using a modal that will return a resolved value', () => {
      it('should resolve the promise when `complete(value)` with a `ModalResult<typeof value>` and close the modal', async () => {
        const user = userEvent.setup()
        const { AppWithModal, openModal } = setup()
        render(
          <AppWithModal>
            <div>a child</div>
          </AppWithModal>,
        )

        let openPromise: Promise<ModalResult<ModalChoice>>
        act(() => {
          openPromise = openModal('choice', {
            title: 'Make up your mind',
          })
        })

        const modalBody = await screen.findByText('Make up your mind')
        expect(modalBody).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: "Don't know" }))

        await waitFor(() => {
          expect(modalBody).not.toBeInTheDocument()
        })

        await waitFor(async () =>
          expect(await openPromise).toStrictEqual({
            isDismissed: false,
            isComplete: true,
            value: 'DONT_KNOW',
          }),
        )
      })

      it('should resolve with a cancelled value if the modal calls `dismiss()`', async () => {
        const user = userEvent.setup()
        const { AppWithModal, openModal } = setup()
        render(
          <AppWithModal>
            <div>a child</div>
          </AppWithModal>,
        )

        let openPromise: Promise<ModalResult<ModalChoice>>
        act(() => {
          openPromise = openModal('choice', {
            title: 'Make up your mind',
          })
        })

        expect(await screen.findByText('Make up your mind')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Cancel' }))

        await waitFor(async () =>
          expect(await openPromise).toStrictEqual({
            isDismissed: true,
            isComplete: false,
          }),
        )
      })
    })

    describe('when opening the same modal twice without closing before', () => {
      it('dismiss the first modal, wait for it to call `remove()`, and show the new modal', async () => {
        jest.useFakeTimers()
        const { AppWithModal, openModal } = setup()
        render(<AppWithModal />)

        let openPromise: Promise<ModalResult>
        act(() => {
          openPromise = openModal('test', {
            title: 'This is the title of the opened modal',
          })
        })

        const firstModal = await screen.findByText(
          'This is the title of the opened modal',
        )
        expect(firstModal).toBeInTheDocument()

        act(() => {
          openModal('test', {
            title: 'This is the title of the second modal',
          })
        })

        expect(firstModal).toBeInTheDocument()

        act(() => {
          jest.runAllTimers()
        })

        expect(firstModal).not.toBeInTheDocument()

        expect(
          await screen.findByText('This is the title of the second modal'),
        ).toBeInTheDocument()

        jest.useRealTimers()

        await waitFor(() => {
          expect(openPromise).resolves.toStrictEqual({
            isDismissed: true,
            isComplete: false,
          })
        })
      })
    })
  })
})
