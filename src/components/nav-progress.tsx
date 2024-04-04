"use client";

import {
  ComponentProps,
  MouseEventHandler,
  PropsWithChildren,
  createContext,
  startTransition,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Progress } from "./ui/progress";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInterval } from "@/lib/hooks";

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function useProgressState() {
  const [state, setState] = useState<"initial" | "in-progress" | "completing">(
    "initial"
  );
  const [progress, setProgress] = useState(0);

  useInterval(
    () => {
      let current = progress;

      if (current === 100) {
        setProgress(0);
      }

      let diff;
      if (current === 0) {
        diff = 15;
      } else if (current < 50) {
        diff = rand(1, 10);
      } else {
        diff = rand(1, 5);
      }

      diff = Math.min(current + diff, 99);
      setProgress(diff);
    },
    state === "in-progress" ? 750 : null
  );

  useEffect(() => {
    if (state === "initial") {
      setProgress(0);
    } else if (state === "completing") {
      setProgress(100);
    }

    if (progress === 100) {
      const timeoutId = setTimeout(() => {
        setState("initial");
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [progress, state]);

  function start() {
    setState("in-progress");
  }

  function done() {
    setState((prev) =>
      prev === "initial" || prev === "in-progress" ? "completing" : prev
    );
  }

  return { state, progress, start, done };
}

const NavProgressContext = createContext<ReturnType<
  typeof useProgressState
> | null>(null);

export function useProgress() {
  const progress = useContext(NavProgressContext);
  if (progress === null) {
    throw new Error("Need to be inside provider");
  }
  return progress;
}

export function NavProgressContainer({ children }: PropsWithChildren) {
  const processState = useProgressState();
  return (
    <NavProgressContext.Provider value={processState}>
      {processState.state !== "initial" && (
        <Progress
          value={processState.progress}
          className="h-1 rounded-none fixed top-0"
        />
      )}
      {children}
    </NavProgressContext.Provider>
  );
}

export function NavProgressLink(props: ComponentProps<typeof Link>) {
  const progress = useProgress();
  const router = useRouter();

  const onClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    props.onClick?.(e);
    if (e.defaultPrevented) {
      return;
    }

    e.preventDefault();
    progress.start();
    startTransition(() => {
      router[props.replace ? "replace" : "push"](props.href.toString(), {
        scroll: props.scroll,
      });
      progress.done();
    });
  };

  return <Link {...props} onClick={onClick} />;
}
