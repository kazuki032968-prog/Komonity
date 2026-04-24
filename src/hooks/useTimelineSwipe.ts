import { PanResponder } from "react-native";
import { useMemo } from "react";

import type { TimelineSectionKey } from "../types/app";

/**
 * タイムラインの横スワイプで、前後の一覧へ切り替えるための PanResponder を返します。
 */
export function useTimelineSwipe({
  activeTimelineSection,
  timelineSections,
  setActiveTimelineSection,
}: {
  activeTimelineSection: TimelineSectionKey;
  timelineSections: ReadonlyArray<{ key: TimelineSectionKey; label: string }>;
  setActiveTimelineSection: (key: TimelineSectionKey) => void;
}) {
  return useMemo(() => {
    const activeTimelineSectionIndex = timelineSections.findIndex(
      (section) => section.key === activeTimelineSection
    );

    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 18 &&
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) < 48) {
          return;
        }

        const direction = gestureState.dx < 0 ? 1 : -1;
        const nextIndex = activeTimelineSectionIndex + direction;
        const nextSection = timelineSections[nextIndex];
        if (nextSection) {
          setActiveTimelineSection(nextSection.key);
        }
      },
    });
  }, [activeTimelineSection, setActiveTimelineSection, timelineSections]);
}
