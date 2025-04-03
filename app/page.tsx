import ProductDisplay from "@/components/ProductDisplay";

export default function HomePage() {
  return (
    <div className='w-full pt-24 md:pt-28'>
      {/* Hero Section */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center'>
          <h1 className='text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl'>
            <span className='block'>Fresh & Healthy</span>
            <span className='block text-green-600 dark:text-green-400'>
              Organic Food
            </span>
          </h1>
          <p className='mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl'>
            Shop the finest selection of organic produce, delivered fresh to
            your door.
          </p>
          <div className='mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8'>
            <div className='rounded-md shadow'>
              <a
                href='/products'
                className='w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 md:py-4 md:text-lg md:px-10'
              >
                Shop Now
              </a>
            </div>
            <div className='mt-3 rounded-md shadow sm:mt-0 sm:ml-3'>
              <a
                href='/categories'
                className='w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-600 dark:text-green-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 md:py-4 md:text-lg md:px-10'
              >
                Browse Categories
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Products Section */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-extrabold text-gray-900 dark:text-white'>
            Trending Products
          </h2>
          <p className='mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4'>
            Our most popular organic products that customers love
          </p>
        </div>

        <ProductDisplay limit={4} />
      </div>

      {/* Features Section */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center'>
            <div className='w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8 text-green-600 dark:text-green-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
            <h3 className='text-xl font-medium text-gray-900 dark:text-white mb-2'>
              100% Organic
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              All our products are certified organic and grown without harmful
              pesticides
            </p>
          </div>

          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center'>
            <div className='w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8 text-green-600 dark:text-green-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <h3 className='text-xl font-medium text-gray-900 dark:text-white mb-2'>
              Fast Delivery
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Fresh from our farms to your doorstep within 24 hours
            </p>
          </div>

          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center'>
            <div className='w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-8 w-8 text-green-600 dark:text-green-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                />
              </svg>
            </div>
            <h3 className='text-xl font-medium text-gray-900 dark:text-white mb-2'>
              Premium Quality
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Highest quality products with freshness and taste guaranteed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
