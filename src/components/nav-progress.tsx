"use client";

import {
  ComponentProps,
  MouseEventHandler,
  PropsWithChildren,
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  const [state, setState] = useState<"initial" | "in-progress" | "complete">(
    "initial"
  );
  const [progress, setProgress] = useState(0);

  useInterval(
    () => {
      let current = progress;
      let diff;
      if (current === 0) {
        diff = 15;
      } else if (current < 50) {
        diff = rand(1, 10);
      } else {
        diff = rand(1, 5);
      }

      const newProgress = Math.min(current + diff, 99);
      setProgress(newProgress);
    },
    state === "in-progress" ? 750 : null
  );

  useEffect(() => {
    if (state === "complete") {
      setProgress(100);
    }

    if (progress === 100) {
      const timeoutId = setTimeout(() => {
        setState("initial");
        setProgress(0);
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [progress, state]);

  const start = useCallback(() => {
    setState("in-progress");
    setProgress(0);
  }, []);

  const done = useCallback(() => {
    setState("complete");
  }, []);

  return { state, progress, start, done };
}

const NavProgressContext = createContext<{
  start: () => void;
  done: () => void;
} | null>(null);

function useProgress() {
  const progress = useContext(NavProgressContext);
  if (progress === null) {
    throw new Error("Need to be inside provider");
  }
  return progress;
}

export function NavProgressContainer({ children }: PropsWithChildren) {
  const processState = useProgressState();
  const contextValue = useMemo(
    () => ({
      start: processState.start,
      done: processState.done,
    }),
    [processState.done, processState.start]
  );
  return (
    <NavProgressContext.Provider value={contextValue}>
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
