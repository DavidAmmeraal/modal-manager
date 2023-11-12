import { Button } from '@mui/material'
import { useManagedModal } from './modals'

export const TogglePersistentModal = () => {
  const { open } = useManagedModal('confirm')

  const onClick = () => {
    open({
      title: 'Confirm',
      content: <>Are you sure?</>,
    }).then(result => {
      console.log('result', result)
    })
  }

  return (
    <Button variant="contained" onClick={onClick}>
      Toggle confirm modal
    </Button>
  )
}
