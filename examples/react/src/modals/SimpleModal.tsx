import { createModal } from '@davidammeraal/modal-manager-react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

export type ConfirmDialogProps = {
  title: React.ReactNode
  content: React.ReactNode
}


export const SimpleModal = createModal(
  function PersistentModal({
    modal: { isOpen, complete, remove },
  }) {
    const finish = (result: boolean) => () => {
      if (result) complete()
    }

    return (
      <Dialog
        open={isOpen}
        onClose={finish(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        TransitionProps={{
          onExited: () => {
            remove()
          },
        }}
      >
        <DialogTitle id="alert-dialog-title">Title</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Content
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
