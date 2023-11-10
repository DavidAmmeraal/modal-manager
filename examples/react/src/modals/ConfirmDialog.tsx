import { createModal } from '@modal-manager/react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

type ConfirmDialog = {
  title: React.ReactNode
  content: React.ReactNode
}

export const ConfirmDialog = createModal<ConfirmDialog>(
  function PersistentModal({
    title,
    content,
    modal: { isOpen, hide, resolve, cancel },
  }) {
    const finish = (result: boolean) => () => {
      if (result) resolve()
      else cancel()
      hide()
    }

    return (
      <Dialog
        open={isOpen}
        onClose={finish(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {content}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={finish(true)}>Ok</Button>
          <Button onClick={finish(false)} autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  },
)
