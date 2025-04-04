import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/utils/roles';
import AdminStats from './components/AdminStats';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Organic',
  description: 'Admin dashboard for Organic store',
};

export default async function AdminDashboard() {
  const isUserAdmin = await isAdmin();
  
  // Double-check admin status (middleware should catch this, but this is a backup)
  if (!isUserAdmin) {
    redirect('/');
  }
  
  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <AdminStats />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <DashboardCard 
          title="Products"
          description="Manage your product catalog"
          link="/admin/products"
          count={0}
        />
        <DashboardCard 
          title="Orders"
          description="View and manage customer orders"
          link="/admin/orders"
          count={0}
        />
        <DashboardCard 
          title="Users"
          description="Manage user accounts and roles"
          link="/admin/users"
          count={0}
        />
        <DashboardCard 
          title="Categories"
          description="Organize your product catalog"
          link="/admin/categories"
          count={0}
        />
        <DashboardCard 
          title="Settings"
          description="Configure store settings"
          link="/admin/settings"
        />
        <DashboardCard 
          title="Store Info"
          description="Update store information"
          link="/admin/store"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  link,
  count,
}: {
  title: string;
  description: string;
  link: string;
  count?: number;
}) {
  return (
    <Link href={link} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
          {count !== undefined && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
              {count}
            </span>
          )}
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </Link>
  );
} 