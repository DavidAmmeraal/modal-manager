import { ModalsComponent, ModalsProvider, openModal } from './modals'
import './App.css'
import { TogglePersistentModal } from './TogglePersistentModal'
import { Button } from '@mui/material'

function App() {
  const handleClick = async () => {
    await openModal('confirm', { title: 1, content: 'hi' })
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
