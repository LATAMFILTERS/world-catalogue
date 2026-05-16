import { getHomeModel } from "@/app/features/home";
import HomeRenderer from "@/app/features/home/view/HomeRenderer";

export default function Home() {
  const model = getHomeModel();

  return <HomeRenderer sections={model.sections} />;
}