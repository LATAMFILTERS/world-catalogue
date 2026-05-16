import { getHomeModel } from "@/app/features/home";

export default function Home() {
  const model = getHomeModel();
  return model.view;
}