import { useEffect, useState } from 'react'
import { createModal } from '../../createModal/createModal'

export type TestModalProps = {
  title: string
}

export const TestModal = createModal<TestModalProps>(({ title, modal }) => {
  // We need to keep track of whether the modal was open before
  // The first render modal.isOpen will be false, but we don't want
  // the useEffect to remove the modal immediatly.
  const [didOpen, setDidOpen] = useState(modal.isOpen)

  useEffect(() => {
    if (!modal.isOpen && didOpen) {
      // We're faking an exit transition here.
      const timeout = setTimeout(() => {
        modal.remove()
      }, 1000)

      return () => {
        clearTimeout(timeout)
      }
    }
    setDidOpen(modal.isOpen)
  }, [modal.isOpen, didOpen])

  return (
    <div hidden={!modal.isOpen}>
      <h1>{title}</h1>
      <button onClick={modal.complete}>close</button>
    </div>
  )
})
