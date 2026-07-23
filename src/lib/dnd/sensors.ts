"use client";

import {
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type PointerActivationConstraint,
} from "@dnd-kit/core";

/**
 * 모바일 터치 + 마우스 드래그를 모두 지원하는 dnd-kit 센서 설정.
 * - TouchSensor: 짧은 delay로 스크롤과 드래그를 구분
 * - MouseSensor: PC 클릭 드래그
 */
const touchActivation: PointerActivationConstraint = {
  delay: 200,
  tolerance: 10,
};

const mouseActivation: PointerActivationConstraint = {
  distance: 6,
};

export function useBoardSensors() {
  return useSensors(
    useSensor(TouchSensor, {
      activationConstraint: touchActivation,
    }),
    useSensor(MouseSensor, {
      activationConstraint: mouseActivation,
    }),
  );
}
