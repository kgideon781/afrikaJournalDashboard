import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/custom/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useContext } from 'react'
import { Link } from 'react-router-dom'
import AuthContext from '../AuthContext'
import { FaUserSlash } from "react-icons/fa";
export function UserNav() {
  const authContext = useContext(AuthContext)
  if (!authContext) {
    return <div> Loading...</div>
  }
  // Now it's safe to access loginUser method from authContext
  const { user, logoutUser } = authContext
  // console.log(user)
  const handleLogout = () => {
    // Logic for logging out the user
    console.log('User logged out')
    logoutUser()
    // You can add your logout logic here, like clearing tokens, redirecting, etc.
    // For example:
    // localStorage.removeItem('token');
    // window.location.href = '/login'; // Redirect to login page
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src='/avatars/01.png' alt='@shadcn' />
            <AvatarFallback>
              {user && user.user_name
                ? user.user_name.charAt(0).toUpperCase() +
                  user.user_name.charAt(1)?.toLowerCase()
                : <FaUserSlash />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>
              {user ? user.user_name : ''}
            </p>
            <p className='text-xs leading-none text-muted-foreground'>
              {/* mikekigoni5@gmail.com */}
              {/* {user.user_name} */}
              {/* {user.email} */}
              {user ? user.email : ''}
            </p>
          </div>
        </DropdownMenuLabel>
        {/* <DropdownMenuSeparator /> */}
        {user && <DropdownMenuSeparator />}

        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          {user?.is_staff && (
            <DropdownMenuItem asChild>
              <Link to='/users_list' className='w-full cursor-pointer'>
                Registered users
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>New Team</DropdownMenuItem>
        </DropdownMenuGroup>
        {/* <DropdownMenuSeparator /> */}
        {user && <DropdownMenuSeparator />}

        {/* <DropdownMenuItem onClick={handleLogout}>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem> */}
        {user && (
          <DropdownMenuItem onClick={handleLogout}>
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
