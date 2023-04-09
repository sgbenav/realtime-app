import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function toPusherKey(key: string) {
	return key.replace(/:/g, '__')
}

export function chatHrefConstructor(firstId: string, secondId: string) {
	const sortedIds = [firstId, secondId].sort()
	return `${sortedIds[0]}--${sortedIds[1]}`
}
