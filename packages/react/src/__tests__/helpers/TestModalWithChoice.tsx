import { useEffect, useState } from 'react'
import { createModal } from '../../createModal/createModal'
import { TestModalProps } from './TestModal'

export type ModalChoice = 'YES' | 'NO' | 'DONT_KNOW'
export const TestModalWithChoice = createModal<TestModalProps, ModalChoice>(
  ({ title, modal }) => {
    // We need to keep track of whether the modal was open before
    // The first render modal.isOpen will be false, but we don't want
    // the useEffect to remove the modal immediatly.
    const [didOpen, setDidOpen] = useState(modal.isOpen)

    useEffect(() => {
      if (!modal.isOpen && didOpen) {
        modal.remove()
      }
      setDidOpen(modal.isOpen)
    }, [modal.isOpen, didOpen])

    const handleClose = (choice: ModalChoice) => () => {
      modal.complete(choice)
    }

    return (
      <div hidden={!modal.isOpen}>
        <h1>{title}</h1>
        <button onClick={handleClose('YES')}>Yes</button>
        <button onClick={handleClose('NO')}>No</button>
        <button onClick={handleClose('DONT_KNOW')}>Don't know</button>
        <button onClick={modal.dismiss}>Cancel</button>
      </div>
    )
  },
)
