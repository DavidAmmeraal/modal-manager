import React, { JSXElementConstructor, useCallback, useEffect } from "react";
import { ModalResult, ModalsManager } from "../ModalsManager";
import { createPublicApi } from "../publicApi";
import { ReactModalDefinition } from "./createModal";
import { ModalsManagerProvider } from "./ModalsManagerProvider";

export class ReactModals<TModalsManager extends ModalsManager> {
  public modalsApi = createPublicApi(this.manager);
  constructor(
    private readonly manager: TModalsManager,
    private readonly components: Map<string, JSXElementConstructor<any>>
  ) {}

  public registerModal<
    T extends string,
    U extends ReactModalDefinition<any, any>
  >(id: T, definition: U) {
    const newManager = this.manager.registerModal(id, {
      createProps: definition.createProps,
      createResolveValue: definition.createResolveValue,
    });
    type ManagerType = TModalsManager extends ModalsManager<infer P>
      ? ModalsManager<
          P & {
            [k in T]: {
              createProps: U["createProps"];
              createResolveValue: U["createResolveValue"];
            };
          }
        >
      : never;
    this.components.set(id, definition.component);
    return new ReactModals(newManager as ManagerType, this.components);
  }

  public ModalsProvider = ({ children }: React.PropsWithChildren) => {
    return (
      <ModalsManagerProvider manager={this.manager}>
        {children}
      </ModalsManagerProvider>
    );
  };

  public Modals = () => {
    return (
      <>
        {Array.from(this.components.entries()).map(([id, Component]) => {
          return <Component id={id} key={id} />;
        })}
      </>
    );
  };

  public useManagedModal = <TId extends keyof TModalsManager["registry"]>(
    id: TId,
    {
      removeOnUnmount = true,
    }: {
      removeOnUnmount?: boolean;
    } = {}
  ) => {
    type ShowProps = ReturnType<TModalsManager["registry"][TId]["createProps"]>;
    type ResolveValue = ReturnType<
      TModalsManager["registry"][TId]["createResolveValue"]
    >;
    const show = useCallback(
      (props: ShowProps): Promise<ModalResult<ResolveValue>> => {
        return this.manager.show(id as string, props);
      },
      [id]
    );

    useEffect(() => {
      return () => {
        if (removeOnUnmount) {
          this.manager.remove(id as string);
        }
      };
    }, [id, removeOnUnmount]);

    return {
      show,
    };
  };
}

export function createReactModals() {
  const manager = new ModalsManager({});

  return new ReactModals(manager, new Map());
}
