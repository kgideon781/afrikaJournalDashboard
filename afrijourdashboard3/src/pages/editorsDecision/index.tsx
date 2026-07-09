// import React from 'react'

// const index = () => {
//   return (
//     <div>Editors Decision</div>
//   )
// }

// export default index

// import React from 'react'
import { Layout } from '@/components/custom/layout'
const index = () => {
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