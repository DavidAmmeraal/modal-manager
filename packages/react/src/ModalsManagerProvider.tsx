import { type ModalsManager } from '@modal-manager/core'
import { createContext, useContext } from 'react'

type ModalsManagerContextValue = {
  manager: ModalsManager
}

const ModalsManagerContext = createContext<
  ModalsManagerContextValue | undefined
>(undefined)

type ModalsProviderProps = React.PropsWithChildren<{ manager: ModalsManager }>

export function ModalsManagerProvider({
  manager,
  children,
}: ModalsProviderProps) {
  return (
    <ModalsManagerContext.Provider value={{ manager }}>
      {children}
    </ModalsManagerContext.Provider>
  )
}

export function useModalsManager() {
  const context = useContext(ModalsManagerContext)
  if (!context?.manager) {
    throw new Error('useModalsManager must be used within a ModalsProvider')
  }
  return context.manager
}
