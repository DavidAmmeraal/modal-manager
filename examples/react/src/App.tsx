import { ModalsComponent, ModalsProvider } from './modals'
import './App.css'
import { TogglePersistentModal } from './TogglePersistentModal'

function App() {
  return (
    <div>
      <ModalsProvider>
        <TogglePersistentModal />
        <ModalsComponent />
      </ModalsProvider>
    </div>
  )
}

export default App
