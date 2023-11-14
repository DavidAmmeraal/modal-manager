import { ModalsStore } from '@modal-manager/core'
import { ModalsStoreProvider } from './ModalsStoreProvider'

export const createModalsProvider = (store: ModalsStore) => {
  return function ModalsProvider({ children }: React.PropsWithChildren) {
    return <ModalsStoreProvider store={store}>{children}</ModalsStoreProvider>
  }
}
