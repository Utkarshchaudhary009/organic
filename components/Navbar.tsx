'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore} from '@/lib/tanstack';
import { useUser, UserButton } from '@clerk/nextjs';
import { ShoppingCart, Menu, X, User, Heart, LayoutDashboard } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import SearchInput from './SearchInput';
import CartCount from './CartCount';
import CategoryMenu from './CategoryMenu';
import AnimatedLogo from './AnimatedLogo';
import { getUserRole } from '@/utils/rolesClient';
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { data: storeData } = useStore();
  const { user, isSignedIn } = useUser();
  const pathname = usePathname();
  
  // Check if user is admin
  useEffect(() => {
    const checkUserRole = async () => {
      if (isSignedIn && user) {
        const userRole = await getUserRole();
        setIsAdmin(userRole === 'admin');
      } else {
        setIsAdmin(false);
      }
    };
    checkUserRole();
  }, [isSignedIn, user]);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  // Close menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 w-full z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-white dark:bg-gray-900 shadow-md py-2'
          : 'bg-transparent py-4'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <AnimatedLogo />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={cn(
                "text-sm font-medium hover:text-green-600 dark:hover:text-green-400 transition", 
                pathname === "/" ? "text-green-600 dark:text-green-400" : "text-gray-700 dark:text-gray-200"
              )}
            >
              Home
            </Link>
            <Link 
              href="/products" 
              className={cn(
                "text-sm font-medium hover:text-green-600 dark:hover:text-green-400 transition", 
                pathname === "/products" || pathname.startsWith("/products/") 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-gray-700 dark:text-gray-200"
              )}
            >
              Products
            </Link>
            <CategoryMenu />
            <Link 
              href="/about" 
              className={cn(
                "text-sm font-medium hover:text-green-600 dark:hover:text-green-400 transition", 
                pathname === "/about" ? "text-green-600 dark:text-green-400" : "text-gray-700 dark:text-gray-200"
              )}
            >
              About
            </Link>
            
            {/* Admin Link - Only visible to admins */}
            {isAdmin && (
              <Link 
                href="/admin" 
                className={cn(
                  "text-sm font-medium hover:text-green-600 dark:hover:text-green-400 transition", 
                  pathname === "/admin" || pathname.startsWith("/admin/") 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-gray-700 dark:text-gray-200"
                )}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* User & Cart Actions */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <SearchInput />
            
            {isSignedIn ? (
              <>
                {/* Admin Dashboard Icon - Only visible to admins */}
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className={cn(
                      "p-2 text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400",
                      pathname.startsWith("/admin") ? "text-green-600 dark:text-green-400" : ""
                    )}
                    aria-label="Admin Dashboard"
                  >
                    <LayoutDashboard size={20} />
                  </Link>
                )}
                
                <Link href="/wishlist" className="p-2 text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 relative">
                  <Heart size={20} />
                  {/* Wishlist indicator would go here */}
                </Link>
                <Link href="/cart" className="p-2 text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 relative">
                  <ShoppingCart size={20} />
                  <CartCount />
                </Link>
                <UserButton />  
              </>
            ) : (
              <Link 
                href="/sign-in" 
                className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-gray-700 dark:text-gray-200"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col transition-transform duration-300 transform pt-20 pb-6 px-6",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Close sidebar button */}
        <button
          className="absolute top-6 right-6 p-2 text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 rounded-full bg-gray-100 dark:bg-gray-800"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
        
        <div className="mb-6 mt-2">
          <SearchInput mobile />
        </div>
        
        <nav className="flex flex-col space-y-6">
          <Link 
            href="/" 
            className={cn(
              "text-lg font-medium border-b border-gray-200 dark:border-gray-700 pb-2", 
              pathname === "/" ? "text-green-600 dark:text-green-400" : "text-gray-700 dark:text-gray-200"
            )}
          >
            Home
          </Link>
          <Link 
            href="/products" 
            className={cn(
              "text-lg font-medium border-b border-gray-200 dark:border-gray-700 pb-2", 
              pathname === "/products" || pathname.startsWith("/products/") 
                ? "text-green-600 dark:text-green-400" 
                : "text-gray-700 dark:text-gray-200"
            )}
          >
            Products
          </Link>
          <Link 
            href="/categories" 
            className={cn(
              "text-lg font-medium border-b border-gray-200 dark:border-gray-700 pb-2", 
              pathname === "/categories" || pathname.startsWith("/categories/") 
                ? "text-green-600 dark:text-green-400" 
                : "text-gray-700 dark:text-gray-200"
            )}
          >
            Categories
          </Link>
          <Link 
            href="/about" 
            className={cn(
              "text-lg font-medium border-b border-gray-200 dark:border-gray-700 pb-2", 
              pathname === "/about" ? "text-green-600 dark:text-green-400" : "text-gray-700 dark:text-gray-200"
            )}
          >
            About
          </Link>
          
          {/* Admin Link - Only visible to admins */}
          {isAdmin && (
            <Link 
              href="/admin" 
              className={cn(
                "text-lg font-medium border-b border-gray-200 dark:border-gray-700 pb-2", 
                pathname === "/admin" || pathname.startsWith("/admin/") 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-gray-700 dark:text-gray-200"
              )}
            >
              Admin Dashboard
            </Link>
          )}
          
          {!isSignedIn ? (
            <Link 
              href="/sign-in" 
              className="mt-4 flex items-center justify-center px-4 py-3 text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
            >
              Sign In
            </Link>
          ) : (
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4 mb-4">
                {user?.imageUrl ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-green-500">
                    <Image
                      src={user.imageUrl}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User size={20} className="text-gray-600 dark:text-gray-300" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user?.fullName || 'User'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.primaryEmailAddress?.emailAddress || ''}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <Link 
                  href="/profile" 
                  className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400"
                >
                  Profile
                </Link>
                <Link 
                  href="/orders" 
                  className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400"
                >
                  My Orders
                </Link>
                <Link 
                  href="/wishlist" 
                  className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400"
                >
                  Wishlist
                </Link>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
