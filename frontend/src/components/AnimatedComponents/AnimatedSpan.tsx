"use client";
import { HTMLMotionProps, motion } from "framer-motion";
import React, { forwardRef } from "react";

type Props = HTMLMotionProps<"span"> & {};

const AnimatedSpan = forwardRef<HTMLSpanElement, Props>((props, ref) => {
  return <motion.span ref={ref} {...props} />;
});
AnimatedSpan.displayName = "AnimatedSpan";
export default AnimatedSpan;
