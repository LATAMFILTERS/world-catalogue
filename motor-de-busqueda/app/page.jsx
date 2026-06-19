import { getHomeModel } from "./features/home";
import SectionRenderer from "./features/home/SectionRenderer";

export default function Page() {
  const model = getHomeModel();

  return (
    <div>
      {model.sections?.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          model={model}
        />
      ))}
    </div>
  );
}
