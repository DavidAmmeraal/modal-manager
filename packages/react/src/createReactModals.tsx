import React, { useCallback, useEffect } from "react";

import { ModalResult, ModalsManager } from "@modal-manager/core";
import { ModalComponent } from "./createModal";
import { ModalsManagerProvider } from "./ModalsManagerProvider";

type ComponentsMap = Record<string, ModalComponent>;

export class ReactModals<T extends ComponentsMap | undefined = undefined> {
  constructor(
    private readonly manager: ModalsManager,
    private components: T = undefined as T
  ) {}

  public registerModal<Id extends string, Component extends ModalComponent>(
    id: Id,
    component: Component
  ) {
    this.components = {
      ...this.components,
      [id]: component,
    };
    return this as unknown as ReactModals<
      T extends undefined
        ? { [k in Id]: Component }
        : T & { [k in Id]: Component }
    >;
  }

  public ModalsProvider = ({ children }: React.PropsWithChildren) => {
    return (
      <ModalsManagerProvider manager={this.manager}>
        {children}
      </ModalsManagerProvider>
    );
  };

  public ModalsComponent = () => {
    return this.components ? (
      <>
        {Array.from(Object.entries(this.components)).map(([id, Component]) => {
          return <Component id={id} key={id} />;
        })}
      </>
    ) : null;
  };

  public useManagedModal = <TId extends keyof T>(
    id: TId,
    {
      removeOnUnmount = true,
    }: {
      removeOnUnmount?: boolean;
    } = {}
  ) => {
    type PropsAndResult = T[TId] extends ModalComponent<infer P, infer U>
      ? [props: P, result: U]
      : never;
    const show = useCallback(
      (props: PropsAndResult[0]): ModalResult<PropsAndResult[1]> => {
        return this.manager.show(id as string, props) as unknown as ModalResult<
          PropsAndResult[1]
        >;
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
  const manager = new ModalsManager();

  return new ReactModals(manager);
}
