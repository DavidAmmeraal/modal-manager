import { Button } from "@mui/material";
import { modals } from "./modals";

export const ToggleDrinkButton = () => {
  const handleClick = async () => {
    // Here we are using the modals object directly, but we could also use the hook.
    // The downside of this method is that modal won't automatically dismount when this component dismounts.
    modals.show("drink", { drink: "🍺" });
  };

  return (
    <Button variant="contained" onClick={handleClick}>
      Toggle drink modal
    </Button>
  );
};
