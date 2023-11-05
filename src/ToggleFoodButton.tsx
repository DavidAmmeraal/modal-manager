import { Button } from "@mui/material";
import { useManagedModal } from "./modals";

export const ToggleFoodButton = () => {
  const { show } = useManagedModal("food");
  const { show: showDrink } = useManagedModal("drink");

  const handleClick = async () => {
    const result = await show({ food: "🍞" });
  };

  return (
    <Button
      variant="contained"
      onClick={() =>
        show({
          food: "🍞",
        })
      }
    >
      Toggle eat modal
    </Button>
  );
};
