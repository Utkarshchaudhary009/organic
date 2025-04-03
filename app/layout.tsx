import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import Link from "next/link";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { TanStackProvider } from "@/lib/tanstack";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Organic - Fresh & Healthy Food",
  description: "Shop organic produce and healthy food items",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={geistSans.className}
      suppressHydrationWarning
    >
      <body className='bg-background text-foreground'>
        <ClerkProvider>
          <TanStackProvider>
            <ThemeProvider
              attribute='class'
              defaultTheme='system'
              enableSystem
              disableTransitionOnChange
            >
              <main className='min-h-screen flex flex-col items-center'>
                <Navbar />
                <div className='flex flex-col gap-20 max-w-5xl p-5'>
                  {children}
                </div>
                <Footer />
              </main>
            </ThemeProvider>
          </TanStackProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
