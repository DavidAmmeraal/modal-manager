import { ModalsStore } from './ModalsStore'

const listener = jest.fn()
let store: ModalsStore

const openModal = (props: Record<string, unknown> = {}) => {
  store = new ModalsStore()
  store.subscribe(listener)
  store.register('test')
  return store.open('test', props)
}

const closeModal = () => {
  return store.close('test')
}

describe('modalStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should construct without params', () => {
    expect(new ModalsStore()).toBeTruthy()
  })

  it('should register a modal', () => {
    const store = new ModalsStore()
    store.register('test')
    expect(store.getModalState('test')).toEqual({
      props: {},
      isOpen: false,
      isMounted: false,
    })
  })

  describe('when opening a modal', () => {
    it('should take props and store them', async () => {
      openModal({ foo: 'foo' })
      expect(store.getModalState('test').props).toEqual({ foo: 'foo' })
    })

    it('should update the modal state to reflect it is open', async () => {
      openModal()
      expect(store.getModalState('test')).toMatchObject({
        isOpen: true,
        isMounted: true,
        props: {},
      })
    })

    it('should return a promise that resolves when the modal is resolved', async () => {
      const promise = openModal()

      store.resolve('test', 'foo')
      expect(promise).resolves.toEqual({
        isCancelled: false,
        isComplete: true,
        value: 'foo',
      })
    })

    it('should update listeners', async () => {
      expect(listener).not.toHaveBeenCalled()
      openModal()
      expect(listener).toHaveBeenCalled()
    })
  })

  describe('when closing a modal', () => {
    it('should update the modal state to reflect that it is closing', async () => {
      openModal()
      closeModal()

      expect(store.getModalState('test')).toEqual({
        props: {},
        isOpen: false,
        isMounted: true,
      })
    })
  })
})
