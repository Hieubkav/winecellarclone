import { use } from 'react';
import { ArticleEditScreen } from '@/features/admin/articles/screens/ArticleEditScreen';

export default function ArticleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ArticleEditScreen articleId={Number(id)} />;
}
