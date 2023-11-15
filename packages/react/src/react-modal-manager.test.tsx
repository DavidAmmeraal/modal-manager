import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { createReactModals } from './createReactModals'
import { createModal } from './createModal/createModal'

type TestModalProps = {
  title: string
}

const TestModal = createModal<TestModalProps>(({ title, modal }) => {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={modal.close}>close</button>
    </div>
  )
})

const { openModal, closeModal, ModalsProvider, ModalsComponent } =
  createReactModals({
    test: TestModal,
  })

const TestApp = ({ children }: React.PropsWithChildren) => {
  return (
    <ModalsProvider>
      <ModalsComponent />
      {children}
    </ModalsProvider>
  )
}

describe('@modal-manager/react', () => {
  it('the provider and modals component should render without stuff breaking', async () => {
    render(<TestApp />)
  })

  it('ModalsProvider should render its children', () => {
    render(
      <TestApp>
        <div>a child</div>
      </TestApp>,
    )

    expect(screen.getByText('a child')).toBeInTheDocument()
  })

  it('should not render closed modals', () => {
    render(<TestApp />)

    expect(
      screen.queryByRole('button', { name: 'close' }),
    ).not.toBeInTheDocument()
  })

  it('should open the modal when `openModal` is called', () => {
    render(<TestApp />)

    act(() => {
      openModal('test', { title: 'This is the title of the opened modal' })
    })

    expect(
      screen.getByText('This is the title of the opened modal'),
    ).toBeInTheDocument()
  })

  it('should close the modal when `closeModal` is called', () => {
    render(<TestApp />)

    act(() => {
      openModal('test', { title: 'This is the title of the opened modal' })
    })

    expect(
      screen.getByText('This is the title of the opened modal'),
    ).toBeInTheDocument()

    act(() => {
      closeModal('test')
    })

    expect(
      screen.getByText('This is the title of the opened modal'),
    ).not.toBeInTheDocument()
  })
})
