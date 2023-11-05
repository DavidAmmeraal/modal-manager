import { Button } from "@mui/material";
import { useManagedModal } from "./modals";

export const ToggleFoodButton = () => {
  // Use a hook here, so that the modal will automatically dismount when this component dismounts.
  const { show } = useManagedModal("food");

  const handleClick = async () => {
    const result = await show({ food: "🍕" });
    if (result.isComplete) {
      console.log(result.value);
    }
  };

  return (
    <Button variant="contained" onClick={handleClick}>
      Toggle eat modal
    </Button>
  );
};
