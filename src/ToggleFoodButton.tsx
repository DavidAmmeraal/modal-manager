import { Button } from "@mui/material";
import { useManagedModal } from "./modals";

export const ToggleFoodButton = () => {
  const { show } = useManagedModal("food");

  const handleClick = async () => {
    const result = await show({ food: "🍕" });
    console.log(result);
  };

  return (
    <Button variant="contained" onClick={handleClick}>
      Toggle eat modal
    </Button>
  );
};
