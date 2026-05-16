import { homeController } from "@/features/home";

export default function Home() {
  const { view, industries, stats, technologies } = homeController;

  return (
    <>
      <view.Hero />

      <view.Stats items={stats} />

      <view.Industries items={industries} />

      <view.Technologies items={technologies} />
    </>
  );
}