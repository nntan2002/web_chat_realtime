import Image from "next/image";
import { auth } from "~/server/auth";
import { SignInButton, ButtonDropdown } from "../components/ui/Button";

export async function Header() {
  const session = await auth();

  return (
    <header className="relative bg-gradient-to-br from-emerald-500 via-sky-500 to-blue-600 border-b-4 border-green-300 shadow-2xl">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between relative z-10">
        <h2 className="text-xl font-semibold text-white drop-shadow-lg transform hover:scale-110 transition-transform">
          <Image src="/logo.png"
            alt="Logo projects"
            width={70}
            height={70}
          />
        </h2>
        <div className="status-user">
          {session ? (
            <>
              <div className="relative group">
                <button className="flex items-center gap-3 rounded-full bg-white/20 backdrop-blur-sm text-white border-2 border-white/40 hover:bg-white/30 hover:border-white/60 px-3 py-2 transition-all cursor-pointer transform hover:scale-105">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "User avatar"}
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-white/60"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/30 border-2 border-white/60 flex items-center justify-center text-sm font-semibold text-white">
                      {session.user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  <span className="text-sm font-medium text-white">
                    {session.user.name ?? session.user.email}
                  </span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover:rotate-180 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-gradient-to-br from-emerald-500 via-sky-500 to-blue-600 border-b-4 border-green-300 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 backdrop-blur-sm">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-white border-b-2 border-white/30">
                      <p className="font-medium text-white">
                        {session.user.name ?? "User"}
                      </p>
                      <p className="text-xs truncate text-white/80">
                        {session.user.email}
                      </p>
                    </div>
                    <ButtonDropdown
                      label="Profile"
                      type="custom"
                      callbackUrl="/profile"
                    />
                    <ButtonDropdown
                      label="Setting"
                      type="custom"
                      callbackUrl="/setting"
                    />
                    <ButtonDropdown
                      label="Sign Out"
                      type="signOut"
                      callbackUrl="/"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <SignInButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
