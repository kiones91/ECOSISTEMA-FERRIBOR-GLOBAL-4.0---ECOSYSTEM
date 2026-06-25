"use client";

import { useEffect } from 'react';

export function ClientEffects() {
  useEffect(() => {
    // Custom cursor
    const cursor = document.getElementById('custom-cursor');
    const onMouseMove = (e: MouseEvent) => {
      if (cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      }
    };
    document.addEventListener('mousemove', onMouseMove);

    const hoverables = document.querySelectorAll('.cursor-hover');
    const onMouseOver = () => cursor?.classList.add('hovered');
    const onMouseOut = () => cursor?.classList.remove('hovered');
    hoverables.forEach((el) => {
      el.addEventListener('mouseover', onMouseOver);
      el.addEventListener('mouseout', onMouseOut);
    });

    // Scroll reveal
    const revealOnViewportScroll = () => {
      const reveals = document.querySelectorAll('.reveal-item');
      const windowHeight = window.innerHeight;
      const elementVisible = 80;
      reveals.forEach((reveal) => {
        const elementTop = reveal.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
          reveal.classList.add('active');
        }
      });
    };
    window.addEventListener('scroll', revealOnViewportScroll);
    revealOnViewportScroll();

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', revealOnViewportScroll);
      hoverables.forEach((el) => {
        el.removeEventListener('mouseover', onMouseOver);
        el.removeEventListener('mouseout', onMouseOut);
      });
    };
  }, []);

  return null;
}
