'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { signOut } from 'next-auth/react'
import toast from 'react-hot-toast'
import { Loader2, LogOut } from 'lucide-react'

interface SignOutButtonProps extends React.HTMLAttributes<HTMLButtonElement> {}

export default function SignOutButton({ ...props }: SignOutButtonProps) {
	const [isSigningOut, setIsSigningOut] = useState<boolean>(false)
	return (
		<Button
			{...props}
			variant="ghost"
			onClick={async () => {
				setIsSigningOut(true)
				try {
					await signOut()
				} catch (error) {
					toast.error('Something went wrong.')
				} finally {
					setIsSigningOut(false)
				}
			}}
		>
			{' '}
			{isSigningOut ? (
				<Loader2 className="animate-spin h-4 w-4" />
			) : (
				<LogOut className="w-4 h-4" />
			)}
		</Button>
	)
}
