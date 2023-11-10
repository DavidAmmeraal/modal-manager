import { ModalsComponent, ModalsProvider } from './modals'
import './App.css'
import React, { useEffect } from 'react'
import { TogglePersistentModal } from './TogglePersistentModal'

function App() {
  const [shouldShowTogglePersistentModal, setShouldShowTogglePersistentModal] =
    React.useState(true)

  useEffect(() => {
    setTimeout(() => {
      setShouldShowTogglePersistentModal(false)
    }, 10000)
  })

  return (
    <div>
      <ModalsProvider>
        {shouldShowTogglePersistentModal && <TogglePersistentModal />}
        <ModalsComponent />
      </ModalsProvider>
    </div>
  )
}

export default App
