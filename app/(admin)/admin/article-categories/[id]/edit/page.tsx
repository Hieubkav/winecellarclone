import { use } from "react";
import { ArticleCategoryFormPage } from "../../ArticleCategoryFormPage";

export default function ArticleCategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <ArticleCategoryFormPage categoryId={Number(id)} />;
}
