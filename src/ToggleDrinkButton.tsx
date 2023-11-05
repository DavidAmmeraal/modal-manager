import { Button } from "@mui/material";
import { modalsApi } from "./modals";

export const ToggleDrinkButton = () => {
  const handleClick = async () => {
    modalsApi.show("drink", { drink: "🍺" });
  };

  return (
    <Button variant="contained" onClick={handleClick}>
      Toggle drink modal
    </Button>
  );
};
