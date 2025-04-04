
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Products Management | Admin",
  description: "Manage your product catalog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex flex-col h-screen'>{children}</div>
  );
}
