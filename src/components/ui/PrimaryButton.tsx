import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}
export default function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="
        bg-primary-100 hover:bg-primary-80 focus:bg-primary-60
        text-white font-medium py-2 px-4 rounded-md
        transition-colors disabled:opacity-50 disabled:pointer-events-none
      "
    >
      {children}
    </button>
  );
}