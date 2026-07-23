import { Layout } from '@/components/custom/layout'
// import { Search } from '@/components/search'
// import ThemeSwitch from '@/components/theme-switch'
import { TopNav } from '@/components/top-nav'
import { UserNav } from '@/components/user-nav'
import { ChevronRight } from 'lucide-react'
export default function IndexesPage() {
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
            <h1 className='text-2xl font-bold'>Indexes</h1>
          </div>
          <div className='overflow-x-auto'>
            <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {/* Card */}
              <a
                className='group'
                href='https://www.scopus.com/home.uri?zone=header&origin=sbrowse'
              >
                <div className='relative overflow-hidden rounded-xl pt-[50%] sm:pt-[70%]'>
                  <img
                    className='absolute start-0 top-0 size-full rounded-xl object-cover transition-transform duration-500 ease-in-out group-hover:scale-105'
                    src='/images/scopus.png'
                    alt='Scopus'
                  />
                </div>
                <div className='mt-7'>
                  <h3 className='text-xl font-semibold text-gray-800 group-hover:text-gray-600 dark:text-neutral-300 dark:group-hover:text-white'>
                    Scopus
                  </h3>
                  <p className='mt-3 text-gray-800 dark:text-neutral-200'>
                    Scopus offers free features to non-subscribed users as
                    Scopus Preview. Researchers use Scopus Preview to assist
                    with research, such as searching for authors and source
                    metrics.
                  </p>
                  <p className='mt-5 inline-flex items-center gap-x-1 font-medium text-blue-600 decoration-2 group-hover:underline'>
                    Read more
                    <ChevronRight />
                  </p>
                </div>
              </a>
              {/* End Card */}
              {/* Card */}
              <a className='group' href='https://scholar.google.com/'>
                <div className='relative overflow-hidden rounded-xl pt-[50%] sm:pt-[70%]'>
                  <img
                    className='absolute start-0 top-0 size-full rounded-xl object-cover transition-transform duration-500 ease-in-out group-hover:scale-105'
                    src='/images/g_scholar.png'
                    alt='Google Scholar'
                  />
                </div>
                <div className='mt-7'>
                  <h3 className='text-xl font-semibold text-gray-800 group-hover:text-gray-600 dark:text-neutral-300 dark:group-hover:text-white'>
                    Google Scholar
                  </h3>
                  <p className='mt-3 text-gray-800 dark:text-neutral-200'>
                    Google Scholar is a freely accessible web search engine that
                    indexes the full text or metadata of scholarly literature
                    across an array of publishing formats and disciplines.
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
