import { Button } from '@mui/material'
import React from 'react'
import { useManagedModal } from './modals'

export const TogglePersistentModal = () => {
  const { show } = useManagedModal('confirm')
  const [state, setState] = React.useState(1)

  const handleClick = async () => {
    const result = await show({
      title: 'Confirm',
      content: <>This is a modal that is being displayed here.</>,
    })
    if (result.isComplete) {
      setState(state + 1)
    }
  }

  return (
    <Button variant="contained" onClick={handleClick}>
      Toggle drink modal {state}
    </Button>
  )
}
