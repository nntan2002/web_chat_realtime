"use client";

import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ScanFace } from 'lucide-react';

interface ButtonDropdownProps {
  label: string;
  onClickAction?: () => void;
  type?: "signIn" | "signOut" | "custom";
  callbackUrl?: string;
}

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("discord", { callbackUrl: "/" })}
      className="flex items-center gap-3 rounded-full bg-white/20 backdrop-blur-sm text-white border-2 border-white/40 hover:bg-white/30 hover:border-white/60 px-3 py-2 transition-all cursor-pointer transform hover:scale-105"
    >
      Sign In with Discord
      <ScanFace />
    </button>
  );
}

export function ButtonDropdown({
  label,
  type = "custom", // Mặc định là 'custom' nếu không chỉ định
  callbackUrl = "/", // URL mặc định nếu không được cung cấp
}: ButtonDropdownProps) {
  const router = useRouter();

  const handleClick = () => {
      if (type === "signOut") {
        signOut({ callbackUrl: callbackUrl });
      } else{
        router.push(callbackUrl);
      }
    }
  return (
    <button
      onClick={handleClick}
      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/20 transition transform hover:translate-x-1"
    >
      {label}
    </button>
  );
}

