import { createContext, useContext } from "react";
import { ModalsManager } from "../ModalsManager";

type ModalsManagerContextValue = {
  manager: ModalsManager;
};

const ModalsManagerContext = createContext<
  ModalsManagerContextValue | undefined
>(undefined);

type ModalsProviderProps = React.PropsWithChildren<{ manager: ModalsManager }>;

export function ModalsManagerProvider({
  manager,
  children,
}: ModalsProviderProps) {
  return (
    <ModalsManagerContext.Provider value={{ manager }}>
      {children}
    </ModalsManagerContext.Provider>
  );
}

export function useModalsManager() {
  const context = useContext(ModalsManagerContext);
  if (!context) {
    throw new Error("useModalsManager must be used within a ModalsProvider");
  }
  return context.manager;
}
