import "./App.css";
import { ModalsComponent, ModalsProvider } from "./modals";
import { ToggleDrinkButton } from "./ToggleDrinkButton";
import { ToggleFoodButton } from "./ToggleFoodButton";

function App() {
  return (
    <div className="App">
      <ModalsProvider>
        <ToggleFoodButton />
        <ToggleDrinkButton />
        <ModalsComponent />
      </ModalsProvider>
    </div>
  );
}

export default App;
