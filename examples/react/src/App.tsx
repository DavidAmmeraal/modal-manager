import { ModalsComponent, ModalsProvider } from "./modals";
import { ToggleDrinkButton } from "./ToggleDrinkButton";
import { ToggleFoodButton } from "./ToggleFoodButton";
import "./App.css";

function App() {
  return (
    <div>
      <ModalsProvider>
        <ToggleFoodButton />
        <ToggleDrinkButton />
        <ModalsComponent />
      </ModalsProvider>
    </div>
  );
}

export default App;
