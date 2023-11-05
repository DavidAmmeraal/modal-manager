import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useRef } from "react";
import { createModal } from "../modal-manager/react/createModal";

type FoodModalProps = {
  food: string;
};

type Choice = number;
export const FoodModal = createModal<FoodModalProps, Choice>(
  function FoodModal({ isOpen, food, hide, remove, resolve }) {
    const choice = useRef<boolean>();
    const handleChoice = (value: boolean) => () => {
      choice.current = value;
      hide();
    };
    return (
      <Dialog
        open={isOpen}
        onClose={hide}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        TransitionProps={{
          onExited: () => {
            if (choice.current) {
              resolve(1);
            }
            remove();
          },
        }}
      >
        <DialogTitle id="alert-dialog-title">Eat</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Eat some {food} with your Opa?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleChoice(true)}>Jawoll</Button>
          <Button onClick={handleChoice(false)} autoFocus>
            Nein
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);
