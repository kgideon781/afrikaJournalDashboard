import { Layout } from '@/components/custom/layout'
// import { Search } from '@/components/search'
// import ThemeSwitch from '@/components/theme-switch'
import { TopNav } from '@/components/top-nav'
import { UserNav } from '@/components/user-nav'
import { ChevronRight } from 'lucide-react'
export default function Repositories() {
  return (
    <Layout>
      {/* ===== Top Heading ===== */}
      <Layout.Header>
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center space-x-4'>
          {/* <Search />
          <ThemeSwitch /> */}
          <UserNav />
        </div>
      </Layout.Header>

      {/* ===== Main ===== */}
      <Layout.Body>
        <div>
          <div className='mb-4 flex items-center justify-between'>
            <h1 className='text-2xl font-bold'>Repositories</h1>
          </div>
          <div className='overflow-x-auto'>
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {/* Card */}
              <a className='group' href='https://sabinet.co.za/'>
                <div className='relative overflow-hidden rounded-xl pt-[50%] sm:pt-[70%]'>
                  <img
                    className='absolute start-0 top-0 size-full rounded-xl object-cover transition-transform duration-500 ease-in-out group-hover:scale-105'
                    src='/images/sabinet.png'
                    alt='Sabinet'
                  />
                </div>
                <div className='mt-7'>
                  <h3 className='text-xl font-semibold text-gray-800 group-hover:text-gray-600 dark:text-neutral-300 dark:group-hover:text-white'>
                    Sabinet
                  </h3>
                  <p className='mt-3 text-gray-800 dark:text-neutral-200'>
                    Sabinet is an online database of full text South and
                    Southern African journals. It includes coverage of a wide
                    variety of topic areas; much of its content is in English,
                    but there are also publications in various other European
                    and African languages (particularly Afrikaans
                  </p>
                  <p className='mt-5 inline-flex items-center gap-x-1 font-medium text-blue-600 decoration-2 group-hover:underline'>
                    Read more
                    <ChevronRight />
                  </p>
                </div>
              </a>
              {/* End Card */}
              {/* Card */}
              <a className='group' href='https://www.ajol.info/index.php/ajol'>
                <div className='relative overflow-hidden rounded-xl pt-[50%] sm:pt-[70%]'>
                  <img
                    className='absolute start-0 top-0 size-full rounded-xl object-cover transition-transform duration-500 ease-in-out group-hover:scale-105'
                    src='/images/ajol.png'
                    alt='African Journals Online'
                  />
                </div>
                <div className='mt-7'>
                  <h3 className='text-xl font-semibold text-gray-800 group-hover:text-gray-600 dark:text-neutral-300 dark:group-hover:text-white'>
                    AJOL
                  </h3>
                  <p className='mt-3 text-gray-800 dark:text-neutral-200'>
                    African Journals OnLine is a South African non-profit
                    organisation, which is in the headquarters of Grahamstown,
                    it is dedicated to improve the online visibility and access
                    to the published scholarly research of African-based
                    academics.
                  </p>
                  <p className='mt-5 inline-flex items-center gap-x-1 font-medium text-blue-600 decoration-2 group-hover:underline'>
                    Read more
                    <ChevronRight />
                  </p>
                </div>
              </a>
              {/* End Card */}
            </div>
          </div>
        </div>
      </Layout.Body>
    </Layout>
  )
}

const topNav = [
  {
    title: 'Home',
    href: '/',
    isActive: true,
  },
]
