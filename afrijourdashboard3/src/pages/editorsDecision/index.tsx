// import React from 'react'

// const index = () => {
//   return (
//     <div>Editors Decision</div>
//   )
// }

// export default index

// import React from 'react'
import { Layout } from '@/components/custom/layout'
import { TopNav } from '@/components/top-nav'
import { UserNav } from '@/components/user-nav'
const index = () => {
     const topNav = [
    {
      title: 'Submit Review',
      href: '#',
      isActive: true,
    },
  ]
  return (
    <Layout>
{/* IMPORTANT: overflow fix for scrolling */}
          <Layout.Body className="h-[calc(100vh-80px)] overflow-y-auto p-6">
    <div>Editors Decision</div>
    </Layout.Body>
    </Layout>
  )
}

export default index