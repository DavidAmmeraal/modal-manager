import { createModal } from '@modal-manager/react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

export const DrinkModal = createModal<{ drink: string }>(function FoodModal({
  drink,
  modal: { isOpen, hide },
}) {
  console.log('rendering the drink modal', isOpen, hide)
  return (
    <Dialog
      open={isOpen}
      onClose={hide}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Drink</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Drink some {drink} with your Oma?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={hide}>Jawoll</Button>
        <Button onClick={hide} autoFocus>
          Nein
        </Button>
      </DialogActions>
    </Dialog>
  )
})
