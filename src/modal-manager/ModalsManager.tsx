import {
  createCancelledResult,
  createCompletedResult,
  ModalResult,
} from "./modalResult";
import { createModalsStore } from "./modalsStore";
import { promiseDelegate, PromiseDelegate } from "./promiseDelegate";

export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };

export type ModalDefinition = {
  createProps: (...args: any[]) => {
    [key: string]: any;
  };
  createResolveValue: (...args: any[]) => any;
  promiseDelegate?: PromiseDelegate<ModalResult>;
};

export class ModalsManager<
  ModalsRegistry extends Record<string, ModalDefinition> = any
> {
  constructor(
    public readonly registry: ModalsRegistry,
    public readonly store = createModalsStore()
  ) {}

  public registerModal<
    TId extends string,
    SpecificModalDefinition extends ModalDefinition
  >(id: TId, component: SpecificModalDefinition) {
    const nextRegistry = {
      ...this.registry,
      [id]: component,
    } as ModalsRegistry & { [k in TId]: SpecificModalDefinition };
    this.store.actions.registerModal(id);
    return new ModalsManager(nextRegistry, this.store);
  }

  public show<TId extends keyof ModalsRegistry>(
    id: TId,
    props: ReturnType<ModalsRegistry[TId]["createProps"]>
  ) {
    const existingPromiseDelegate = this.registry[id].promiseDelegate;
    if (existingPromiseDelegate) {
      existingPromiseDelegate.resolve(createCancelledResult());
    }
    const delegate =
      promiseDelegate<
        ModalResult<ReturnType<ModalsRegistry[TId]["createResolveValue"]>>
      >();

    this.registry[id].promiseDelegate = delegate;
    this.store.actions.showModal(id as string, props);

    return delegate.promise;
  }

  public hide<TId extends keyof ModalsRegistry>(id: TId) {
    this.store.actions.hideModal(id as string);
  }

  public remove<TId extends keyof ModalsRegistry>(id: TId) {
    const existingPromiseDelegate = this.registry[id].promiseDelegate;
    if (existingPromiseDelegate) {
      existingPromiseDelegate.resolve(createCancelledResult());
      this.registry[id].promiseDelegate = undefined;
    }
    this.store.actions.removeModal(id as string);
  }

  public resolve<TId extends keyof ModalsRegistry>(id: TId, value: unknown) {
    const delegate = this.registry[id].promiseDelegate;
    if (delegate) {
      delegate.resolve(createCompletedResult(value));
      this.registry[id].promiseDelegate = undefined;
    }
  }
}

export const createModalsManager = () => new ModalsManager({});
