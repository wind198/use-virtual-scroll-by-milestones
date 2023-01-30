import {
  createElement,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import VirtualListContextProvider, {
  IVirtualListContext,
  VirtualListContext,
} from "./VirtualListContextProvider";

type IVirtualList<T> = {
  data: T[] | null | undefined;
  renderItem: (item: T) => JSX.Element;
  itemCountBetweenTwoMilestones?: number;
  itemElementType?: any;
  intersectionOptions?: Omit<IntersectionObserverInit, "threshold">;
  direction?: "row" | "column";
};

const DistanceScalingFactorForRendering = 2;

export default function VirtualList<T>(props: IVirtualList<T>) {
  const {
    data,
    renderItem,
    intersectionOptions,
    itemCountBetweenTwoMilestones = 20,
    itemElementType,
    direction = "column",
  } = props;

  const dataCount = data?.length;

  const intervalArr = useMemo(() => {
    if (!dataCount) return [];

    const output = [] as [number, number][];

    for (let i = 0; i < data.length; i += itemCountBetweenTwoMilestones) {
      output.push([i, i + itemCountBetweenTwoMilestones]);
    }

    return output;
  }, [data, dataCount, itemCountBetweenTwoMilestones]);

  return (
    <VirtualListContextProvider>
      {intervalArr.map(([start, end], index) => (
        <Interval
          {...{ start, end }}
          itemElementType={itemElementType}
          isLast={index === intervalArr.length - 1}
          intersectionOptions={intersectionOptions}
          direction={direction}
        >
          {data?.slice(start, end).map((item) => renderItem(item))}
        </Interval>
      ))}
    </VirtualListContextProvider>
  );
}

function Interval<T>(
  props: PropsWithChildren<{
    isLast: boolean;
    itemElementType: IVirtualList<T>["itemElementType"];
    start: number;
    end: number;
    intersectionOptions?: IntersectionObserverInit;
    direction: "row" | "column";
  }>
) {
  const {
    intersectionOptions,
    isLast,
    children,
    start,
    end,
    itemElementType = "li",
    direction,
  } = props;

  const rootMarginAsNumber = useMemo(() => {
    const { rootMargin } = intersectionOptions || {};

    let rootMarginAsNumber = rootMargin ? parseFloat(rootMargin) : 300;
    if (rootMarginAsNumber < 300) {
      rootMarginAsNumber = 300;
    }
    return rootMarginAsNumber;
  }, [intersectionOptions]);

  const computedIntersectionOptions = useMemo(() => {
    const defaultOptions: IntersectionObserverInit = {
      rootMargin: "300px",
    };
    if (!intersectionOptions) return defaultOptions;

    return {
      ...defaultOptions,
      ...intersectionOptions,
      rootMargin: `${rootMarginAsNumber}px`,
      threshold: 0,
    };
  }, [intersectionOptions, rootMarginAsNumber]);

  const { mileStonesPositionMap, srollContainerPosition: windowPosition } =
    useContext(VirtualListContext);

  const startPos = useMemo(
    () => mileStonesPositionMap[start.toString()],
    [mileStonesPositionMap, start]
  );

  const endPos = useMemo(
    () => mileStonesPositionMap[end.toString()],
    [mileStonesPositionMap, end]
  );

  const shouldRenderRealList = useMemo(() => {
    if (startPos === undefined || endPos === undefined) return true;
    const { end: bottom, start: top } = windowPosition;

    if (!bottom) return true;

    if (
      startPos >
        bottom + rootMarginAsNumber * DistanceScalingFactorForRendering ||
      endPos < top - rootMarginAsNumber * DistanceScalingFactorForRendering
    ) {
      return false;
    }

    return true;
  }, [windowPosition, rootMarginAsNumber, endPos, startPos]);

  const avatarH = useMemo(() => {
    const startPos = mileStonesPositionMap[start.toString()];
    const endPos = mileStonesPositionMap[end.toString()];
    if (startPos === undefined || endPos === undefined) return 0;

    return endPos - startPos;
  }, [start, end, mileStonesPositionMap]);

  return (
    <>
      <Milestone
        milestoneId={start.toString()}
        {...{
          direction,
          itemElementType,
          intersectionOptions: computedIntersectionOptions,
        }}
      />
      {shouldRenderRealList || !avatarH
        ? children
        : createElement(itemElementType, {
            style: {
              ...(direction === "column" && { minHeight: `${avatarH}px` }),
              ...(direction === "row" && { minWidth: `${avatarH}px` }),
            },
            className: "avatar",
          })}
      {isLast && (
        <Milestone
          milestoneId={end.toString()}
          {...{
            direction,
            itemElementType,
            intersectionOptions: computedIntersectionOptions,
          }}
        />
      )}
    </>
  );
}

type IMilestoneProps = {
  milestoneId: string;
  itemElementType?: any;
  intersectionOptions?: IntersectionObserverInit;
  direction: "row" | "column";
};

const Milestone = (props: IMilestoneProps) => {
  const {
    direction,
    milestoneId,
    itemElementType: elementType = "li",
    intersectionOptions,
  } = props;

  const milestoneObserverRef = useRef<IntersectionObserver>();

  const getCurrentScrollContainerPos: () => IVirtualListContext["srollContainerPosition"] =
    useCallback(() => {
      const root = intersectionOptions?.root;
      if (!root) {
        if (direction === "row") {
          return {
            start: window.scrollX,
            end: window.innerWidth + window.scrollX,
          };
        }
        return {
          start: window.scrollY,
          end: window.innerHeight + window.scrollY,
        };
      }
      const container = root as HTMLElement;
      if (direction === "row") {
        return {
          start: container.scrollLeft,
          end: container.scrollLeft + container.clientWidth,
        };
      }
      return {
        start: container.scrollTop,
        end: container.scrollTop + container.clientHeight,
      };
    }, [intersectionOptions?.root, direction]);

  const getNodePosRelativeToScrollContainer = useCallback(
    (node: HTMLElement) => {
      const root = intersectionOptions?.root;
      if (!root) {
        const boundingRect = node.getBoundingClientRect();
        const position =
          direction === "column"
            ? boundingRect.top + window.scrollY
            : boundingRect.left + window.scrollX;
        return position;
      }

      return direction === "column" ? node.offsetTop : node.offsetLeft;
    },
    [intersectionOptions?.root, direction]
  );

  const { setMileStonePosition, setScrollContainerPosition } =
    useContext(VirtualListContext);

  const callbackRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      milestoneObserverRef.current?.disconnect();
      const observer = new IntersectionObserver(
        (entries: IntersectionObserverEntry[]) => {
          const target = entries[0].target as HTMLElement;
          // const inview = entries[0].isIntersecting;
          if (!target) return;

          setMileStonePosition(
            milestoneId,
            getNodePosRelativeToScrollContainer(target)
          );
          setScrollContainerPosition(getCurrentScrollContainerPos());
        },
        intersectionOptions
      );
      observer.observe(node);
      milestoneObserverRef.current = observer;
      return;
    },
    [
      intersectionOptions,
      milestoneId,
      setMileStonePosition,
      setScrollContainerPosition,
      getCurrentScrollContainerPos,
      getNodePosRelativeToScrollContainer,
    ]
  );

  return createElement(elementType, {
    ref: callbackRef,
    style: {
      margin: "0px",
      className: "milestone",
    },
  });
};
