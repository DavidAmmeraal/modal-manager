import "./App.css";
import { Modals, ModalsProvider } from "./modals";
import { ToggleDrinkButton } from "./ToggleDrinkButton";
import { ToggleFoodButton } from "./ToggleFoodButton";

function App() {
  return (
    <div className="App">
      <ModalsProvider>
        <ToggleFoodButton />
        <ToggleDrinkButton />
        <Modals />
      </ModalsProvider>
    </div>
  );
}

export default App;
