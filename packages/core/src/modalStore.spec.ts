import { ModalsStore } from './ModalsStore'

let store = new ModalsStore()

const testListener = jest.fn()

function registerTestModal() {
  store.register('test')
}
function openTestModal() {
  store.register('test')
  store.subscribe('test', testListener)
  return store.open('test', { foo: 'foo' })
}

function closeTestModal() {
  return store.close('test')
}

describe('modalStore', () => {
  beforeEach(() => {
    store = new ModalsStore()
    jest.clearAllMocks()
  })

  it('should construct without params', () => {
    expect(store).toBeTruthy()
  })

  it('should register a modal with a string key', () => {
    store.register('test')
    expect(store.getModalState('test')).toEqual({
      props: {},
      isOpen: false,
      isMounted: false,
    })
  })

  it('should register a modal with a function key', () => {
    const fn = () => 'test'
    store.register(fn)
    expect(store.getModalState(fn)).toEqual({
      props: {},
      isOpen: false,
      isMounted: false,
    })
  })

  it('should register multiple modals', () => {
    const fn = () => 'test'
    store.register('test')
    store.register(fn)
    expect(store.getModalState('test')).toBeDefined()
    expect(store.getModalState(fn)).toBeDefined()
  })

  describe('when calling `subscribe` on store', () => {
    it('should return a function to unsubscribe', () => {
      registerTestModal()
      const unsubscribe = store.subscribe('test', testListener)
      openTestModal()
      expect(testListener).toHaveBeenCalledTimes(1)
      unsubscribe()
      closeTestModal()
      expect(testListener).toHaveBeenCalledTimes(1)
    })
  })

  describe('when calling `open` on store', () => {
    it('should take props and store them', async () => {
      openTestModal()
      expect(store.getModalState('test')?.props).toEqual({ foo: 'foo' })
    })

    it('should update the modal state to reflect it is open', async () => {
      openTestModal()
      expect(store.getModalState('test')?.isOpen).toBe(true)
      expect(store.getModalState('test')?.isMounted).toBe(true)
    })

    it('should return a promise that resolves when the modal is resolved', async () => {
      const promise = openTestModal()

      store.resolve('test', 'foo')
      expect(promise).resolves.toEqual({
        isCancelled: false,
        isComplete: true,
        value: 'foo',
      })
    })

    it('should update listeners', async () => {
      expect(testListener).not.toHaveBeenCalled()
      openTestModal()
      expect(testListener).toHaveBeenCalled()
    })

    it('should throw if the modal is not registered', async () => {
      expect(() => store.open('test', {})).toThrow(
        'No registered modal for key "test"',
      )
    })
  })

  describe('when calling `close` on store', () => {
    it('should update the modal state to reflect that it is closing', async () => {
      openTestModal()
      closeTestModal()

      expect(store.getModalState('test')).toEqual({
        props: {
          foo: 'foo',
        },
        isOpen: false,
        isMounted: true,
      })
    })

    it('should update the listeners', async () => {
      openTestModal()
      expect(testListener).toHaveBeenCalledTimes(1)
      closeTestModal()
      expect(testListener).toHaveBeenCalledTimes(2)
    })

    it('should return a promise that resolves when the modal is finished closing', async () => {
      openTestModal()
      const result = closeTestModal()

      // Calling remove will resolve the promise returned by `close`.
      store.remove('test')

      expect(result).resolves.toBeUndefined()
    })

    it('should return a promise that resolve immediatly if the modal is not open', async () => {
      store.register('test')
      const result = closeTestModal()

      expect(result).resolves.toBeUndefined()
    })

    it("should throw if specified modal doesn't exist", async () => {
      expect(() => store.close('test')).toThrow(
        'No registered modal for key "test"',
      )
    })
  })

  describe('when calling `hide` on store', () => {
    it('should update the modal state to reflect that it is no longer open', async () => {
      openTestModal()
      store.hide('test')

      expect(store.getModalState('test')).toEqual({
        props: {
          foo: 'foo',
        },
        isOpen: false,
        isMounted: true,
      })
    })
  })

  describe('when calling `resolve` on store', () => {
    it('should resolve any pending `open` promise', async () => {
      const promise = openTestModal()
      store.resolve('test', 'foo')

      expect(promise).resolves.toEqual({
        isCancelled: false,
        isComplete: true,
        value: 'foo',
      })
    })
  })

  describe('when calling `remove` on store', () => {
    it('should update the modal state to reflect that it is no longer mounted', async () => {
      openTestModal()
      store.remove('test')

      expect(store.getModalState('test')).toEqual({
        props: {
          foo: 'foo',
        },
        isOpen: false,
        isMounted: false,
      })
    })

    it('should update the listeners', async () => {
      openTestModal()
      expect(testListener).toHaveBeenCalledTimes(1)
      store.remove('test')
      expect(testListener).toHaveBeenCalledTimes(2)
    })

    it('if there are any pending `open` promises, it should resolve them with a cancelled result', () => {
      const promise = openTestModal()
      store.remove('test')

      expect(promise).resolves.toEqual({
        isCancelled: true,
        isComplete: false,
      })
    })

    it('should resolve any pending `close` promise', async () => {
      openTestModal()
      const result = closeTestModal()

      store.remove('test')

      expect(result).resolves.toBeUndefined()
    })
  })
})
