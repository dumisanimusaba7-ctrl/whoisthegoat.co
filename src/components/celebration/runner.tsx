"use client";

import { useImperativeHandle, useRef, type Ref } from "react";

import { Car, type CarHandle } from "./car";
import { Figure, type FigureHandle } from "./figure";
import { Phone, type PhoneHandle } from "./phone";
import { restState, type Runner, type RunnerState } from "./timeline";

export type RunnerHandle = {
  draw: (state: RunnerState) => void;
  /** Back to where the celebration ends, with effects cleared. */
  rest: () => void;
};

/**
 * Whatever runs along the result bar for an option: a figure, a car or a
 * phone. Rendered at rest; a celebration drives it through `handle`.
 */
export function RunnerView({
  runner,
  handle,
  mirrored = false,
  className,
}: {
  runner: Runner;
  handle?: Ref<RunnerHandle>;
  mirrored?: boolean;
  className?: string;
}) {
  const figure = useRef<FigureHandle>(null);
  const car = useRef<CarHandle>(null);
  const phone = useRef<PhoneHandle>(null);

  useImperativeHandle(handle, () => {
    const draw = (state: RunnerState) => {
      if (state.pose) figure.current?.setPose(state.pose);
      if (state.effects) figure.current?.setEffects(state.effects);
      if (state.car) car.current?.set(state.car);
      if (state.phone) phone.current?.set(state.phone);
    };
    return { draw, rest: () => draw(restState(runner)) };
  }, [runner]);

  const rest = restState(runner);
  switch (runner.kind) {
    case "figure":
      return (
        <Figure
          kit={runner.kit}
          pose={rest.pose!}
          prop={runner.prop}
          label={runner.label}
          handle={figure}
          mirrored={mirrored}
          className={className}
        />
      );
    case "car":
      return <Car livery={runner.livery} state={rest.car!} handle={car} mirrored={mirrored} className={className} />;
    case "phone":
      return <Phone device={runner.device} state={rest.phone!} handle={phone} className={className} />;
  }
}

/**
 * The point of the drawing that stands on the end of the result, as a
 * fraction of its width: a figure's centre, a car's nose.
 */
export function runnerAnchor(runner: Runner, mirrored: boolean): number {
  const anchor = runner.kind === "car" ? 0.9 : 0.5;
  return mirrored ? 1 - anchor : anchor;
}
