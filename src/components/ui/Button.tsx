import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = ({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) => {
  return <button className={`btn ${variant} ${className}`.trim()} {...props} />;
};
