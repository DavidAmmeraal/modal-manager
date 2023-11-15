import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { createReactModals } from '../createReactModals'
import { createModal } from './createModal'

type TestModalProps = {
  title: string
}

const TestModal = createModal<TestModalProps>(({ title, modal }) => {
  return (
    <div>
      <h1>{title}</h1>
    </div>
  )
})

const { openModal, ModalsProvider, ModalsComponent } = createReactModals({
  test: TestModal,
})

const TestApp = () => {
  return (
    <ModalsProvider>
      <ModalsComponent />
    </ModalsProvider>
  )
}

describe('createModal', () => {
  it('should create a modal component', async () => {
    render(<TestApp />)
    act(() => {
      openModal('test', { title: 'Test Modal' })
    })

    expect(await screen.findByText('Test Modal')).toBeInTheDocument()
  })
})
