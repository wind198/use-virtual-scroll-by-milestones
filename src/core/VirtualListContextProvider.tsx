import { createContext, PropsWithChildren, useCallback, useState } from "react";

export type IVirtualListContext = {
  mileStonesPositionMap: Record<string, number>;
  setMileStonePosition: (milestoneId: string, position: number) => void;
  srollContainerPosition: {
    start: number;
    end: number;
  };
  setScrollContainerPosition: (payload: { start: number; end: number }) => void;
};

export const VirtualListContext = createContext<IVirtualListContext>({
  mileStonesPositionMap: {},
  srollContainerPosition: {
    start: 0,
    end: window.innerHeight,
  },
  setMileStonePosition() {},
  setScrollContainerPosition() {},
});

const VirtualListContextProvider = (props: PropsWithChildren<{}>) => {
  const [mileStonesPositionMap, setMileStonesPositionMap] = useState<
    IVirtualListContext["mileStonesPositionMap"]
  >({});

  const [windowPosition, setWindowPosition] = useState<
    IVirtualListContext["srollContainerPosition"]
  >({ start: 0, end: window.innerHeight });

  const setMileStonePosition: IVirtualListContext["setMileStonePosition"] =
    useCallback((milestoneId: string, position: number) => {
      setMileStonesPositionMap((p) => ({ ...p, [milestoneId]: position }));
    }, []);

  const updateScrollContainerPosition: IVirtualListContext["setScrollContainerPosition"] =
    useCallback((payload) => {
      setWindowPosition(payload);
    }, []);

  return (
    <VirtualListContext.Provider
      value={{
        mileStonesPositionMap,
        setMileStonePosition,
        setScrollContainerPosition: updateScrollContainerPosition,
        srollContainerPosition: windowPosition,
      }}
    >
      {props.children}
    </VirtualListContext.Provider>
  );
};
export default VirtualListContextProvider;
