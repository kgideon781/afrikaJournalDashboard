import { createBrowserRouter } from 'react-router-dom'
import GeneralError from './pages/errors/general-error'
import NotFoundError from './pages/errors/not-found-error'
import MaintenanceError from './pages/errors/maintenance-error'
import UnauthorisedError from './pages/errors/unauthorised-error.tsx'

const router = createBrowserRouter([
  // Auth routes
  {
    path: '/sign-in',
    lazy: async () => ({
      Component: (await import('./pages/auth/sign-in')).default,
    }),
  },
  {
    path: '/reset/:uid/:token',
    lazy: async () => ({
      Component: (await import('./pages/password')).default,
    }),
  },
  {
    path: '/sign-in-2',
    lazy: async () => ({
      Component: (await import('./pages/auth/sign-in-2')).default,
    }),
  },
  {
    path: '/sign-up',
    lazy: async () => ({
      Component: (await import('./pages/auth/sign-up')).default,
    }),
  },
  {
    path: '/forgot-password',
    lazy: async () => ({
      Component: (await import('./pages/auth/forgot-password')).default,
    }),
  },
  {
    path: '/otp',
    lazy: async () => ({
      Component: (await import('./pages/auth/otp')).default,
    }),
  },

  // Main routes
  {
    path: '/',
    lazy: async () => {
      const AppShell = await import('./components/app-shell')
      return { Component: AppShell.default }
    },
    errorElement: <GeneralError />,
    children: [
      // {
      //   index: true,
      //   lazy: async () => ({
      //     // Component: (await import('./pages/home')).default,
      //     Component: (await import('./pages/dashboard')).default,
      //   }),
      // },

      {
  index: true,
  lazy: async () => ({
    Component: (await import('./pages/HomeRedirect')).default,
  }),
},



      // {
      //   path: '/',
      //   lazy: async () => ({
      //     Component: (await import('./pages/dashboard')).default,
      //   }),
      // },
      {
        path: '/',
        lazy: async () => {
          const Dashboard = (await import('./pages/dashboard')).default
          const ProtectedRoute = (await import('./ProtectedRoute')).default
          return {
            Component: (props: any) => (
              <ProtectedRoute>
                <Dashboard {...props} />
              </ProtectedRoute>
            ),
          }
        },
      },
      {
        path: 'tasks',
        lazy: async () => ({
          Component: (await import('@/pages/tasks')).default,
        }),
      },
      {
        path: 'news',
        lazy: async () => ({
          Component: (await import('@/pages/news')).default,
        }),
      },
      {
        path: 'chats',
        lazy: async () => ({
          Component: (await import('@/components/coming-soon')).default,
        }),
      },
      {
        path: 'apps',
        lazy: async () => ({
          Component: (await import('@/pages/apps')).default,
        }),
      },
      {
        path: 'users',
        lazy: async () => ({
          Component: (await import('@/components/coming-soon')).default,
        }),
      },
      {
        path: 'analytics',
        lazy: async () => ({
          Component: (await import('./pages/analytics')).default,
        }),
      },
      {
        path: 'journals',
        lazy: async () => ({
          Component: (await import('./pages/journals/index.tsx')).default,
        }),
      },
      // {
      //   path: 'upload',
      //   lazy: async () => ({
      //     Component: (await import('./pages/upload')).default,
      //   }),
      // },
      {
        path: 'upload',
        lazy: async () => {
          const Upload = (await import('./pages/upload')).default
          const ProtectedRoute = (await import('./ProtectedRoute')).default
          return {
            Component: (props: any) => (
              <ProtectedRoute>
                <Upload {...props} />
              </ProtectedRoute>
            ),
          }
        },
      },
      {
        path: 'journals/:journalId',
        lazy: async () => ({
          Component: (await import('./pages/journalDetail')).default,
        }),
      },
      {
        path: 'journal_update/',
        lazy: async () => ({
          Component: (await import('./pages/journalUpdate')).default,
        }),
      },
      {
        path: 'journal_list/',
        lazy: async () => ({
          Component: (await import('./pages/journalList')).default,
        }),
      },
      {
        path: 'pending_journals',
        lazy: async () => ({
          Component: (await import('./pages/pendingJournals')).default,
        }),
      },
      {
        path: 'volume_update/',
        lazy: async () => ({
          Component: (await import('./pages/volumeUpdate')).default,
        }),
      },
      {
        path: 'volume_list/',
        lazy: async () => ({
          Component: (await import('./pages/volumeList')).default,
        }),
      },
      {
        path: 'article_update/',
        lazy: async () => ({
          Component: (await import('./pages/articleUpdate')).default,
        }),
      },
      {
        path: 'article_list/',
        lazy: async () => ({
          Component: (await import('./pages/articleList')).default,
        }),
      },
      {
        path: 'approvals/',
        lazy: async () => ({
          Component: (await import('./pages/approvalList')).default,
        }),
      },
      {
        path: 'submit_manuscripts/',
        lazy: async () => ({
          Component: (await import('./pages/submitManuscript/index.tsx')).default,
        }),
      },
       {
        path: 'my_manuscripts/',
        lazy: async () => ({
          Component: (await import('./pages/manuscriptsList/index.tsx')).default,
        }),
      },
      {
        path: 'reviewers_list/',
        lazy: async () => ({
          Component: (await import('./pages/reviewersList/index.tsx')).default,
        }),
      },
      {
        path: 'submit_reviews/',
        lazy: async () => ({
          Component: (await import('./pages/submitReviews/index.tsx')).default,
        }),
      },
      {
        path: 'editors_list/',
        lazy: async () => ({
          Component: (await import('./pages/editorsList/index.tsx')).default,
        }),
      },
      // {
      //   path: 'editors_manuscript/',
      //   lazy: async () => ({
      //     Component: (await import('./pages/editorsManuscript/index.tsx')).default,
      //   }),
      // },
      {
      path: 'editors_manuscript/:id',
      lazy: async () => ({
        Component: (
          await import('./pages/editorsManuscript/index.tsx')
        ).default,
      }),
       },
      //  {
      //   path: 'editors_decision/',
      //   lazy: async () => ({
      //     Component: (await import('./pages/editorsDecision/index.tsx')).default,
      //   }),
      // },

      // {
      //   path: 'upload/:uploadId',
      //   lazy: async () => ({
      //     Component: (await import('./pages/uploadDetail/index')).default,
      //   }),
      // },


      {
        path: 'indexes',
        lazy: async () => ({
          Component: (await import('./pages/indexes')).default,
        }),
      },
      {
        path: 'repositories',
        lazy: async () => ({
          Component: (await import('./pages/repositories')).default,
        }),
      },
      {
        path: 'extra-components',
        lazy: async () => ({
          Component: (await import('@/pages/extra-components')).default,
        }),
      },
      {
        path: 'settings',
        lazy: async () => ({
          Component: (await import('./pages/settings')).default,
        }),
        errorElement: <GeneralError />,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('./pages/settings/profile')).default,
            }),
          },
          {
            path: 'account',
            lazy: async () => ({
              Component: (await import('./pages/settings/account')).default,
            }),
          },
          {
            path: 'appearance',
            lazy: async () => ({
              Component: (await import('./pages/settings/appearance')).default,
            }),
          },
          {
            path: 'notifications',
            lazy: async () => ({
              Component: (await import('./pages/settings/notifications'))
                .default,
            }),
          },
          {
            path: 'display',
            lazy: async () => ({
              Component: (await import('./pages/settings/display')).default,
            }),
          },
          {
            path: 'error-example',
            lazy: async () => ({
              Component: (await import('./pages/settings/error-example'))
                .default,
            }),
            errorElement: <GeneralError className='h-[50svh]' minimal />,
          },
        ],
      },
    ],
  },

  // Error routes
  { path: '/500', Component: GeneralError },
  { path: '/404', Component: NotFoundError },
  { path: '/503', Component: MaintenanceError },
  { path: '/401', Component: UnauthorisedError },

  // Fallback 404 route
  { path: '*', Component: NotFoundError },
])

export default router
