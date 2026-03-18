"use client";

import { motion, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";

interface WordPullUpProps {
  words: string;
  delayMultiple?: number;
  wrapperFramerProps?: Variants;
  framerProps?: Variants;
  className?: string;
  underline?: boolean;
  underlinedWords?: string[];
  underlineColor?: string;
}

function WordPullUp({
  words,
  wrapperFramerProps = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  },
  framerProps = {
    hidden: { y: 30, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", damping: 15, stiffness: 100 } },
  },
  className,
  underline = false,
  underlinedWords = [],
  underlineColor = "var(--primary)",
}: WordPullUpProps) {
  const wordsArray = words.split(" ");
  
  return (
    <motion.h1
      variants={wrapperFramerProps}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      className={cn(
        "font-display text-center text-4xl font-bold leading-[5rem] tracking-[-0.02em] drop-shadow-sm",
        className,
      )}
    >
      {wordsArray.map((word, i) => {
        const cleanWord = word.replace(/[.,]/g, "");
        const shouldUnderline = underlinedWords.some(uw => cleanWord.toLowerCase().includes(uw.toLowerCase()));
        
        return (
          <motion.span
            key={i}
            variants={framerProps}
            style={{ display: "inline-block", position: "relative" }}
            className="mr-3"
          >
            {word}
            {shouldUnderline && (
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 + (i * 0.1), duration: 0.8, ease: "easeOut" }}
                className="absolute -bottom-1 left-0 h-[6px] rounded-full z-[-1]"
                style={{ backgroundColor: underlineColor }}
              />
            )}
          </motion.span>
        );
      })}
    </motion.h1>
  );
}

export { WordPullUp };
