import React, { useEffect } from 'react'
import { ReactModalsManager } from './ReactModalManager'

export const createModalsComponent = (manager: ReactModalsManager) => {
  return function Modals() {
    const [comps, setComps] = React.useState(manager.components)

    useEffect(() => {
      const unsubscribe = manager.subscribe(() => {
        if (manager.components !== comps) {
          setComps(manager.components)
        }
      })
      return () => unsubscribe()
    }, [])

    return comps ? (
      <>
        {Array.from(Object.entries(comps)).map(
          ([id, { component: Component }]) => {
            return <Component id={id} key={id} />
          },
        )}
      </>
    ) : null
  }
}
