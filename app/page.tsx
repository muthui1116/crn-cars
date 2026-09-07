// app/page.tsx  ← now clean, no hooks here
import HomeClient from "./_components/HomeClient";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  return (
    <main>
      <HomeClient category={category} />
    </main>
  );
}