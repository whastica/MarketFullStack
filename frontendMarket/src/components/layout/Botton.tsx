import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "primary" | "secondary" | "danger";
}

const Button = ({ color = "primary", className, ...props }: ButtonProps) => {
  const baseStyle = "px-4 py-2 rounded text-white font-bold transition";
  const colorStyles = {
    primary: "bg-blue-600 hover:bg-blue-700",
    secondary: "bg-green-600 hover:bg-green-700",
    danger: "bg-red-600 hover:bg-red-700",
  };

  return (
    <button
      className={clsx(baseStyle, colorStyles[color], className)}
      {...props}
    />
  );
};

export default Button;