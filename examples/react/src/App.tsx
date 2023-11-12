import { ModalsComponent, ModalsProvider, openModal } from './modals'
import './App.css'
import { TogglePersistentModal } from './TogglePersistentModal'
import { Button } from '@mui/material'

function App() {
  const handleClick = async () => {
    openModal('confirm', { title: 'Confirm', content: 'hi' })
  }

  return (
    <div>
      <ModalsProvider>
        <TogglePersistentModal />
        <Button variant="contained" onClick={handleClick}>
          Open modal via `openModal`
        </Button>
        <ModalsComponent />
      </ModalsProvider>
    </div>
  )
}

export default App
