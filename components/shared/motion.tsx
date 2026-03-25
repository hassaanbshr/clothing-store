"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export const premiumEase = [0.22, 1, 0.36, 1] as const;

type MotionRevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  amount?: number;
};

export function MotionReveal({
  children,
  className,
  delay = 0,
  duration = 0.7,
  distance = 24,
  once = true,
  amount = 0.2,
  ...props
}: MotionRevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: distance }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={
        reduceMotion
          ? undefined
          : {
              duration,
              delay,
              ease: premiumEase,
            }
      }
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type MotionStaggerProps = HTMLMotionProps<"div"> & {
  delayChildren?: number;
  staggerChildren?: number;
  once?: boolean;
  amount?: number;
};

export function MotionStagger({
  children,
  className,
  delayChildren = 0,
  staggerChildren = 0.08,
  once = true,
  amount = 0.18,
  ...props
}: MotionStaggerProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren,
            staggerChildren,
            ease: premiumEase,
          },
        },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type MotionItemProps = HTMLMotionProps<"div"> & {
  distance?: number;
  duration?: number;
};

export function MotionItem({
  children,
  className,
  distance = 18,
  duration = 0.65,
  ...props
}: MotionItemProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={
        reduceMotion
          ? undefined
          : {
              hidden: { opacity: 0, y: distance },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration,
                  ease: premiumEase,
                },
              },
            }
      }
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
