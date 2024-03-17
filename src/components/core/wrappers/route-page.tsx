import React from "react";
import { cn } from "../../../lib/utils";
import { motion } from "framer-motion";

export default function RoutePage({
  children,
  className,
  backgroundImage,
}: {
  children: React.ReactNode;
  className?: string;
  backgroundImage?: string;
}) {
  if (backgroundImage) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 0 }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        exit={{ opacity: 0, x: 20 }}
        className={cn(
          "flex-auto bg-bg-color rounded-tl-xl overflow-hidden relative",
          className
        )}
      >
        <motion.img
          initial={{ scale: 0.9 }}
          animate={{
            scale: 1,
            transition: {
              duration: 0.25,
              type: "spring",
              stiffness: 260,
              damping: 20,
            },
          }}
          exit={{ scale: 0.8 }}
          src={backgroundImage}
          className="w-full h-full bg-cover bg-center bg-no-repeat"
        />
        <div
          className={cn(
            "absolute top-0 left-0 h-full w-full flex flex-col justify-between",
            className
          )}
        >
          {children}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "flex-auto h-full w-full flex bg-bg-color rounded-tl-xl overflow-hidden relative",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
