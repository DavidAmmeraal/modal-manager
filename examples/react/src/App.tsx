import { ModalsPortal, openModal } from './modals'
import './App.css'
import { Button } from '@mui/material'

function App() {
  const handleClick = async () => {
    await openModal('confirm', { title: 1, content: 'hi' })
  }

  return (
    <div>
        <Button variant="contained" onClick={handleClick}>
          Open modal via `openModal`
        </Button>
        <ModalsPortal/>
    </div>
  )
}

export default App
