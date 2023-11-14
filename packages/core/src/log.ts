const LEVELS = ['debug', 'info', 'warn', 'error'] as const

type Logger = {
  [key in (typeof LEVELS)[number]]: (...args: unknown[]) => void
}

const enabledEnvs = ['dev', 'development']

/**
 * Simple wrapper around `console` that only logs in non-production envs.
 */
export const logger = LEVELS.reduce((acc, level) => {
  return {
    ...acc,
    [level]: (() => {
      if (
        process.env.NODE_ENV &&
        enabledEnvs.includes(process.env.NODE_ENV.trim().toLowerCase())
      ) {
        return window.console.log.bind(window.console)
      } else {
        return function () {}
      }
    })(),
  }
}, {} as Logger)
