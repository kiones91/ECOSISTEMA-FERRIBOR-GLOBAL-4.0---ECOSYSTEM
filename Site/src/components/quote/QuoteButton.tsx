"use client";

import { useQuoteModal } from './QuoteContext';
import { ReactNode } from 'react';

interface QuoteButtonProps {
  service?: string;
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

export function QuoteButton({ service, className, children, style }: QuoteButtonProps) {
  const { openQuoteModal } = useQuoteModal();
  return (
    <button onClick={() => openQuoteModal(service)} className={className} style={style}>
      {children}
    </button>
  );
}
