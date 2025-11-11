import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { Header } from "./_components/Header";
import { Footer } from "./_components/Footer";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    // void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <Header />
      
      <main >
         layout chính app chat
      </main>

      <Footer />
    </HydrateClient>
  );
}