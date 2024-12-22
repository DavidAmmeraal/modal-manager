import { ModalsPortal, openModal } from './modals'
import './App.css'
import { Button } from '@mui/material'

function App() {
  const handleClick = async () => {
    await openModal('confirm', { title: 1, content: 'hi' })
  }

  const handleSimpleClick = async () => {
    await openModal('simple');
  }

  return (
    <div>
        <Button variant="contained" onClick={handleClick}>
          Open confirm dialog
        </Button>
        <Button variant="contained" onClick={handleSimpleClick}>
          Open simple modal
        </Button>
        <ModalsPortal/>
    </div>
  )
}

export default App
