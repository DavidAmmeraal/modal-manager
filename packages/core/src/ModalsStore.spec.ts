import { ModalsStore } from './ModalsStore'



const setupStore = () => new ModalsStore();

describe('modalStore', () => {
  it('should construct without params', () => {
    const store = setupStore();
    expect(store).toBeTruthy()
  })
  it('should register a modal with a string key', () => {
    const store = setupStore();
    store.register('test')
    expect(store.getModalState('test')).toEqual({
      props: {},
      isOpen: false,
      isMounted: false,
    })
  })

  it('should register multiple modals', () => {
    const store = setupStore();
    store.register('test')
    store.register('test2')
    expect(store.getModalState('test')).toBeDefined()
    expect(store.getModalState('test2')).toBeDefined()
  })


  describe('when calling `subscribe` on store', () => {
    it('should return a function to unsubscribe', () => {
      const store = setupStore();
      store.register('test');
      const listener = jest.fn();
      const unsubscribe = store.subscribe('test', listener)
      store.open('test', {}) 
      expect(listener).toHaveBeenCalledTimes(1)
      unsubscribe()
      store.close('test'); 
      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('when calling `open` on store', () => {
    it('should take props and store them', async () => {
      const store = setupStore();
      store.register('test')
      store.open('test', { foo: 'foo' })

      expect(store.getModalState('test')?.props).toEqual({ foo: 'foo' })
    })

    it('should update the modal state to reflect it is open', async () => {
      const store = setupStore();
      store.register('test');
      store.open('test', { foo: 'foo' })
      expect(store.getModalState('test')).toStrictEqual({
        isOpen: true,
        isMounted: true,
        props: { foo: 'foo'}
      })
    })

    it('should return a promise that resolves when the modal is resolved', async () => {
      const store = setupStore();
      store.register('test');
      const promise = store.open('test', { foo: 'foo' });
      store.resolve('test', 'foo')
      expect(promise).resolves.toStrictEqual({
        isDismissed: false,
        isComplete: true,
        value: 'foo',
      })
    })

    it('should update listeners', async () => {
      const listener = jest.fn();
      const store = setupStore();
      store.register('test');
      store.subscribe('test', listener);
      expect(listener).not.toHaveBeenCalled()
      store.open('test', {});
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should throw if the modal is not registered', async () => {
      const store = setupStore();
      expect(() => store.open('test', {})).toThrow(
        'No registered modal for key "test"',
      )
    })
  })

  describe('when calling `close` on store', () => {
    it('should update the modal state to reflect that it is closing and update the listeners', async () => {
      const store = setupStore();
      const listener = jest.fn();
      store.register('test');
      store.subscribe('test', listener);
      store.open('test', { foo: 'foo' })
      expect(listener).toHaveBeenCalledTimes(1);
      store.close('test');


      expect(store.getModalState('test')).toStrictEqual({
        props: {
          foo: 'foo',
        },
        isOpen: false,
        isMounted: true,
      })

      expect(listener).toHaveBeenCalledTimes(2);
    })


    it('should return a promise that resolves when the modal is finished closing', async () => {
      const store = setupStore();
      const listener = jest.fn();
      store.register('test');
      store.subscribe('test', listener);
      store.open('test', { foo: 'foo' })
      expect(listener).toHaveBeenCalledTimes(1);
      const promise = store.close('test');

      // Calling remove will resolve the promise returned by `close`.
      store.remove('test')

      expect(promise).resolves.toBeUndefined()
    })

    it('should return a promise that resolve immediatly if the modal is not open', async () => {
      const store = setupStore();
      store.register('test');
      const promise = store.close('test');

      expect(promise).resolves.toBeUndefined()
    })

    it("should throw if specified modal doesn't exist", async () => {
      const store = setupStore();
      expect(() => store.close('test')).toThrow(
        'No registered modal for key "test"',
      )
    })
  })

  describe('when calling `hide` on store', () => {
    it('should update the modal state to reflect that it is no longer open', async () => {
      const store = setupStore();
      store.register('test');
      store.open('test', {});
      store.hide('test')

      expect(store.getModalState('test')).toStrictEqual({
        props: {},
        isOpen: false,
        isMounted: true,
      })
    })
  })

  describe('when calling `resolve` on store', () => {
    it('should resolve any pending `open` promise', async () => {
      const store = setupStore();
      store.register('test');
      const promise = store.open('test', {});
      store.resolve('test', 'foo')

      expect(promise).resolves.toStrictEqual({
        isDismissed: false,
        isComplete: true,
        value: 'foo',
      })
    })
  })

  describe('when calling `remove` on store', () => {
    it('should update the modal state to reflect that it is no longer mounted', async () => {
      const store = setupStore();
      store.register('test');
      store.open('test', {});
      store.close('test');
      store.remove('test')

      expect(store.getModalState('test')).toStrictEqual({
        props: {},
        isOpen: false,
        isMounted: false,
      })
    })

    it('should update the listeners', async () => {
      const store = setupStore();
      const listener = jest.fn();
      store.register('test');
      store.subscribe('test', listener);
      store.open('test', {});
      store.close('test');
      expect(listener).toHaveBeenCalledTimes(2)
      store.remove('test')
      expect(listener).toHaveBeenCalledTimes(3)
    })

    it('if there are any pending `open` promises, it should resolve them with a cancelled result', () => {
      const store = setupStore();
      const listener = jest.fn();
      store.register('test');
      store.subscribe('test', listener);
      const promise = store.open('test', {});
      store.remove('test')

      expect(promise).resolves.toEqual({
        isDismissed: true,
        isComplete: false,
      })
    })

    it('should resolve any pending `close` promise', async () => {
      const store = setupStore();
      const listener = jest.fn();
      store.register('test');
      store.subscribe('test', listener);
      store.open('test', {});
      const promise = store.close('test');
      store.remove('test')

      expect(promise).resolves.toBeUndefined()
    })
  })
})
