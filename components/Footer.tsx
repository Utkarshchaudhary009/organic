"use client";

import { useState } from "react";
import { useStore } from "@/lib/tanstack";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterLink {
  title: string;
  url: string;
  category: "quick_links" | "information";
}

export default function Footer() {
  const { data: storeData, isLoading } = useStore();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the newsletter subscription
    // For now we'll just reset the form
    setEmail("");
    alert("Thank you for subscribing!");
  };

  const currentYear = new Date().getFullYear();

  // Extract footer links from store data
  const quickLinks: FooterLink[] =
    storeData?.footer_links?.filter(
      (link: FooterLink) => link.category === "quick_links"
    ) || [];

  const informationLinks: FooterLink[] =
    storeData?.footer_links?.filter(
      (link: FooterLink) => link.category === "information"
    ) || [];

  // Check if newsletter is enabled
  const showNewsletter = storeData?.newsletter_enabled !== false;

  // Format social links for easier access
  const socialLinks = storeData?.social_links || {};

  return (
    <footer className='bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-20'>
      <div className='container mx-auto px-4 py-12'>
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {/* Store Info */}
          <div>
            <div className='flex items-center mb-4'>
              {storeData?.logo ? (
                <div className='relative w-10 h-10 mr-2'>
                  <Image
                    src={storeData.logo}
                    alt={storeData?.name || "Organic"}
                    fill
                    className='object-contain'
                  />
                </div>
              ) : (
                <div className='w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-2'>
                  <span className='text-green-700 dark:text-green-300 text-xl font-bold'>
                    O
                  </span>
                </div>
              )}
              <span className='text-xl font-semibold text-gray-900 dark:text-white'>
                {storeData?.name || "Organic"}
              </span>
            </div>

            <p className='text-gray-600 dark:text-gray-400 mb-6'>
              {storeData?.description ||
                "Premium organic products for a healthy lifestyle. Fresh from farm to your table."}
            </p>

            {/* Contact Info */}
            <div className='space-y-3'>
              {storeData?.contact_email && (
                <div className='flex items-center'>
                  <Mail
                    size={18}
                    className='text-green-600 dark:text-green-400 mr-2'
                  />
                  <a
                    href={`mailto:${storeData.contact_email}`}
                    className='text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                  >
                    {storeData.contact_email}
                  </a>
                </div>
              )}

              {storeData?.contact_phone && (
                <div className='flex items-center'>
                  <Phone
                    size={18}
                    className='text-green-600 dark:text-green-400 mr-2'
                  />
                  <a
                    href={`tel:${storeData.contact_phone}`}
                    className='text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                  >
                    {storeData.contact_phone}
                  </a>
                </div>
              )}

              {storeData?.address && (
                <div className='flex'>
                  <MapPin
                    size={18}
                    className='text-green-600 dark:text-green-400 mr-2 flex-shrink-0 mt-1'
                  />
                  <address className='text-gray-600 dark:text-gray-400 not-italic'>
                    {storeData.address}
                  </address>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          {quickLinks.length > 0 && (
            <div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                Quick Links
              </h3>
              <ul className='space-y-2'>
                {quickLinks.map((link, index) => (
                  <li key={`quick-${index}`}>
                    <Link
                      href={link.url}
                      className='text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 flex items-center'
                    >
                      <ChevronRight
                        size={14}
                        className='mr-1'
                      />
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Information */}
          {informationLinks.length > 0 && (
            <div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                Information
              </h3>
              <ul className='space-y-2'>
                {informationLinks.map((link, index) => (
                  <li key={`info-${index}`}>
                    <Link
                      href={link.url}
                      className='text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 flex items-center'
                    >
                      <ChevronRight
                        size={14}
                        className='mr-1'
                      />
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Newsletter */}
          {showNewsletter && (
            <div>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                Newsletter
              </h3>
              <p className='text-gray-600 dark:text-gray-400 mb-4'>
                Subscribe to our newsletter for the latest updates and organic
                food tips.
              </p>
              <form
                onSubmit={handleSubscribe}
                className='mb-6'
              >
                <div className='relative'>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='Your email address'
                    required
                    className='w-full py-2 px-4 pr-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500'
                  />
                  <button
                    type='submit'
                    className='absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-green-600 rounded-md p-1 hover:bg-green-700 transition'
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>

              {/* Social Media */}
              <div>
                <h3 className='text-md font-semibold text-gray-900 dark:text-white mb-3'>
                  Follow Us
                </h3>
                <div className='flex space-x-3'>
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-green-500 hover:text-white dark:hover:bg-green-500 dark:hover:text-white transition'
                    >
                      <Facebook size={16} />
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a
                      href={socialLinks.twitter}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-green-500 hover:text-white dark:hover:bg-green-500 dark:hover:text-white transition'
                    >
                      <Twitter size={16} />
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-green-500 hover:text-white dark:hover:bg-green-500 dark:hover:text-white transition'
                    >
                      <Instagram size={16} />
                    </a>
                  )}
                  {socialLinks.youtube && (
                    <a
                      href={socialLinks.youtube}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-green-500 hover:text-white dark:hover:bg-green-500 dark:hover:text-white transition'
                    >
                      <Youtube size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer */}
        <div className='mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center'>
          <div className='text-gray-600 dark:text-gray-400 text-sm mb-4 md:mb-0'>
            © {currentYear} {storeData?.name || "Organic"}. All rights
            reserved.
          </div>

          <div className='flex items-center space-x-2'>
            <span className='text-gray-600 dark:text-gray-400 text-sm'>
              Theme:
            </span>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
