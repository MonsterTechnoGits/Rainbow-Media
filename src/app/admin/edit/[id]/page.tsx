import AdminEditStoryView from '@/views/admin-edit-page';

interface AdminEditStoryPageProps {
  params: Promise<{ id: string }>;
}

const AdminEditStoryPage = async ({ params }: AdminEditStoryPageProps) => {
  const { id } = await params;
  return <AdminEditStoryView storyId={id} />;
};

export default AdminEditStoryPage;
