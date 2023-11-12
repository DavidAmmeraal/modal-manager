import { ModalsComponent, ModalsProvider, openModal } from './modals'
import './App.css'
import { TogglePersistentModal } from './TogglePersistentModal'
import { Button } from '@mui/material'
import { ConfirmDialog } from './modals/ConfirmDialog'

function App() {
  const handleClick = () => {
    openModal(ConfirmDialog, {
      title: 'Confirm',
      content: (
        <>This was triggered through `openModal`, would you like to continue?</>
      ),
    })
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
