import { type ModalsStore } from '@modal-manager/core'
import { createContext, useContext } from 'react'

const ModalsStoreContext = createContext<ModalsStore | undefined>(undefined)

type ModalsProviderProps = React.PropsWithChildren<{
  store: ModalsStore
}>

export function ModalsStoreProvider({ store, children }: ModalsProviderProps) {
  return (
    <ModalsStoreContext.Provider value={store}>
      {children}
    </ModalsStoreContext.Provider>
  )
}

export function useModalsStore() {
  const val = useContext(ModalsStoreContext)
  if (!val) {
    throw new Error('useModalsStore must be used within a ModalsStoreProvider')
  }
  return val
}
