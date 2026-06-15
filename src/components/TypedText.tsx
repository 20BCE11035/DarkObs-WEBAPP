"use client";
import { useEffect, useRef } from "react";
import Typed from "typed.js";

export default function TypedText() {
  const typedElement = useRef(null);

  useEffect(() => {
    const typed = new Typed(typedElement.current, {
      strings: ["Scripts", "Tools", "Spoofers"],
      typeSpeed: 100,
      backSpeed: 100,
      backDelay: 1000,
      loop: true,
    });

    return () => {
      typed.destroy();
    };
  }, []);

  return <span ref={typedElement}></span>;
}
