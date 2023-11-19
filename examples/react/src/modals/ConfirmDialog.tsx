import { ModalResult } from '@modal-manager/core'
import { createModal } from '@modal-manager/react'
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

type X = ModalResult<boolean>

export const ConfirmDialog = createModal<ConfirmDialogProps, boolean>(
  function PersistentModal({
    title,
    content,
    modal: { isOpen, close, resolve, remove },
  }) {
    const finish = (result: boolean) => () => {
      if (result) resolve(result)
      close()
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
