// import {
//   // IconChartHistogram,
//   IconLayoutDashboard,
//   IconSettings,
//   IconBook,
//   // IconMessages,
//   // IconNews,
//   // IconHome,
//   IconNotebook,
//   IconCloudUp,
//   IconLogs,
//   IconFileDescription,
//   IconColumns3,
// } from '@tabler/icons-react'
// // import {
// //   IconWorldUpload,
// //   IconUsers,
// //   IconRouteAltLeft,
// //   IconTruck,
// //   IconBoxSeam,
// // } from '@tabler/icons-react'
// import { IconTools } from '@tabler/icons-react'
// export interface NavLink {
//   title: string
//   label?: string
//   href: string
//   icon: JSX.Element
// }

// export interface SideLink extends NavLink {
//   sub?: NavLink[]
// }

// export const sidelinks: SideLink[] = [
//   {
//     title: 'Dashboard',
//     label: '',
//     href: '/',
//     icon: <IconLayoutDashboard size={18} />,
//   },
//   // {
//   //   title: 'Journals',
//   //   label: '10',
//   //   href: '',
//   //   icon: <IconNotebook size={18} />,
//   //   sub: [
//   //     {
//   //       title: 'Add Journal Description',
//   //       label: '',
//   //       href: '/journal_update',
//   //       icon: <IconFileDescription size={18} />,
//   //     },
//   //     {
//   //       title: 'Journal List',
//   //       label: '',
//   //       href: '/journal_list',
//   //       icon: <IconLogs size={18} />,
//   //     },
//   //   ],
//   // },
//   // {
//   //   title: 'Volumes',
//   //   label: '10',
//   //   href: '',
//   //   icon: <IconColumns3 size={18} />,
//   //   sub: [
//   //     {
//   //       title: 'Add Volumes To Journals',
//   //       label: '',
//   //       href: '/volume_update',
//   //       icon: <IconFileDescription size={18} />,
//   //     },
//   //     {
//   //       title: 'Volumes List',
//   //       label: '',
//   //       href: '/volume_list',
//   //       icon: <IconLogs size={18} />,
//   //     },
//   //   ],
//   // },
//   // {
//   //   title: 'Articles',
//   //   label: '10',
//   //   href: '',
//   //   icon: <IconFileDescription size={18} />,
//   //   sub: [
//   //     {
//   //       title: 'Upload Articles',
//   //       label: '',
//   //       href: '/article_update',
//   //       icon: <IconCloudUp size={18} />,
//   //     },
//   //     {
//   //       title: 'Article List',
//   //       label: '',
//   //       href: '/article_list',
//   //       icon: <IconLogs size={18} />,
//   //     },
//   //   ],
//   // },

//   // {
//   //   title: 'Journal & Article Manager',
//   //   label: '',
//   //   href: '/upload',
//   //   icon: <IconTools size={18} />,
//   // },

//   // {
//   //   title: 'Notifications',
//   //   label: '9',
//   //   href: '/chats',
//   //   icon: <IconMessages size={18} />,
//   // },

//   {
//     title: 'Submit Manuscripts',
//     label: '',
//     href: '/submit_manuscripts',
//     icon: < IconCloudUp size={18} />,
//   },
//   {
//     title: 'My Manuscripts',
//     label: '',
//     href: '/my_manuscripts',
//     icon: <IconBook size={18} />,
//   },
//   {
//     title: 'Reviewers Queue',
//     label: '',
//     href: '/reviewers_list',
//     icon: <IconBook size={18} />,
//   },
//   {
//     title: 'Submit Reviews',
//     label: '',
//     href: '/submit_reviews',
//     icon: <IconBook size={18} />,
//   },
//   {
//     title: 'Editors Queue',
//     label: '',
//     href: '/editors_list',
//     icon: <IconBook size={18} />,
//   },
//   {
//     title: 'Editors Manuscript',
//     label: '',
//     href: '/editors_manuscript',
//     icon: <IconBook size={18} />,
//   },
//   {
//     title: 'Editors Decision',
//     label: '',
//     href: '/editors_decision',
//     icon: <IconBook size={18} />,
//   },
// ]



import {
  IconLayoutDashboard,
  IconBook,
  IconBooks,
  IconCloudUp,
  IconLogs,
  IconFileDescription,
} from '@tabler/icons-react'

export interface NavLink {
  title: string
  label?: string
  href: string
  icon: JSX.Element
}

export interface SideLink extends NavLink {
  sub?: NavLink[]
}

const getUserRoles = (): string[] => {
  const tokens = localStorage.getItem('authTokens')
  if (!tokens) return []

  try {
    const access = JSON.parse(tokens)?.access
    if (!access) return []

    const payload = JSON.parse(atob(access.split('.')[1]))
    return payload?.roles ?? []
  } catch {
    return []
  }
}

export const getSideLinks = (): SideLink[] => {
  const roles = getUserRoles()

  const isAuthor = roles.includes('Author')
  const isReviewer = roles.includes('Reviewer')
  const isEditor = roles.includes('Editor')

  const links: SideLink[] = [
    // Default links visible to every authenticated user, regardless of role.
    // First entry doubles as the target HomeRedirect sends people to when
    // they land at `/` — put the most valuable overview here.
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <IconLayoutDashboard size={18} />,
    },
    {
      title: 'Journals',
      href: '/journals',
      icon: <IconBooks size={18} />,
    },
    {
      title: 'My Journals',
      href: '/journal_list',
      icon: <IconBook size={18} />,
    },
  ]

  // ================= AUTHOR =================
  if (isAuthor) {
    links.push(
      {
        title: 'Submit Journal',
        href: '/submit_journal',
        icon: <IconBooks size={18} />,
      },
      {
        title: 'Bulk Upload',
        href: '/bulk_upload',
        icon: <IconCloudUp size={18} />,
      },
      {
        title: 'Submit Manuscripts',
        href: '/submit_manuscripts',
        icon: <IconCloudUp size={18} />,
      },
      {
        title: 'My Manuscripts',
        href: '/my_manuscripts',
        icon: <IconBook size={18} />,
      }
    )
  }

  // ================= REVIEWER =================
  if (isReviewer) {
    links.push(
      {
        title: 'Reviewers Queue',
        href: '/reviewers_list',
        icon: <IconLogs size={18} />,
      },
      {
        title: 'Submit Reviews',
        href: '/submit_reviews',
        icon: <IconFileDescription size={18} />,
      }
    )
  }

  // ================= EDITOR =================
  if (isEditor) {
    links.push(
      {
        title: 'Editors Queue',
        href: '/editors_list',
        icon: <IconLogs size={18} />,
      },
      {
        title: 'Pending Journals',
        href: '/pending_journals',
        icon: <IconFileDescription size={18} />,
      },
      // "Add Journal" and "Journal List" are covered by the baseline
      // "My Journals" link — staff members see an admin toggle there
      // that switches to "All Journals" for cross-user management.
      // {
      //   title: 'Editors Manuscripts',
      //   href: '/editors_manuscript',
      //   icon: <IconBook size={18} />,
      // },
      // {
      //   title: 'Editors Decision',
      //   href: '/editors_decision',
      //   icon: <IconFileDescription size={18} />,
      // }
    )
  }

  return links
}
