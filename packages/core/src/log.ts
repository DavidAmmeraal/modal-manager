const LEVELS = ['debug', 'info', 'warn', 'error'] as const

type Logger = {
  [key in (typeof LEVELS)[number]]: (...args: unknown[]) => void
}

export const logger = LEVELS.reduce((acc, level) => {
  return {
    ...acc,
    [level]: (...args: unknown[]) => {
      if (process.env.NODE_ENV === 'production') console[level](...args)
    },
  }
}, {} as Logger)
