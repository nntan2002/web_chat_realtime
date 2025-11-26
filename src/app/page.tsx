import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { Header } from "./_components/Header";
import { Footer } from "./_components/Footer";
import { Main } from "./_components/Main";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    // void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <Header />
      <Main />
      {/* <Footer /> */}
    </HydrateClient>
  );
}