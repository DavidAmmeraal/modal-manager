import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { createModal } from "../modal-manager/react/createModal";

export const DrinkModal = createModal<{ drink: string }>(function FoodModal({
  isOpen,
  drink,
  hide,
}) {
  console.log("rendering the drink modal");
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
  );
});
