'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/tanstack';

export default function AnimatedLogo() {
  const { data: storeData, isLoading } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse">
      </div>
    );
  }
  
  return (
    <Link href="/" className="flex items-center space-x-2">
      <motion.div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ scale: 1 }}
        animate={{ 
          scale: isHovered ? 1.05 : 1,
          rotate: isHovered ? 5 : 0
        }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {storeData?.logo ? (
          <div className="relative w-10 h-10 md:w-12 md:h-12">
            <Image
              src={storeData.logo}
              alt={storeData?.name || 'Organic'}
              fill
              className="object-contain"
              priority
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900 rounded-full">
            <motion.span 
              className="text-green-700 dark:text-green-300 text-xl font-bold"
              animate={{ 
                color: isHovered ? ['#047857', '#10b981', '#047857'] : '#047857'
              }}
              transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0 }}
            >
              O
            </motion.span>
          </div>
        )}
      </motion.div>
      <motion.span 
        className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white"
        animate={{ 
          y: isHovered ? [0, -2, 0] : 0
        }}
        transition={{ duration: 0.5 }}
      >
        {storeData?.name || 'Organic'}
        {storeData?.tagline && (
          <span className="hidden lg:inline-block text-xs text-gray-500 dark:text-gray-400 ml-2 font-normal">
            {storeData.tagline}
          </span>
        )}
      </motion.span>
    </Link>
  );
} 