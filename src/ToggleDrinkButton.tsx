import { Button } from "@mui/material";
import { useManagedModal } from "./modals";

export const ToggleDrinkButton = () => {
  const { show } = useManagedModal("drink");

  const handleClick = async () => {
    const result = show({ drink: "🍺" });
  };

  return (
    <Button variant="contained" onClick={() => show({ drink: "🍺" })}>
      Toggle drink modal
    </Button>
  );
};
