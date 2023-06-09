import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { pusherServer } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { addFriendValidator } from '@/lib/validations/addFriendValidator'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

export async function POST(req: Request) {
	try {
		const body = await req.json()

		const { email: emailToAdd } = addFriendValidator.parse(body.email)

		const idToAdd = (await fetchRedis(
			'get',
			`user:email:${emailToAdd}`,
		)) as string

		if (!idToAdd) {
			return new Response('User not found', { status: 400 })
		}

		const session = await getServerSession(authOptions)

		if (!session) {
			return new Response('Unauthorized', { status: 401 })
		}

		const isAlreadyAdded = (await fetchRedis(
			'sismember',
			`user:${idToAdd}:incoming_friend_requests`,
			session.user.id,
		)) as 0 | 1

		// Check if the user has already sent a friend request
		if (isAlreadyAdded) {
			return new Response('You have already sent a friend request', {
				status: 400,
			})
		}

		// Check if the user is already friends
		const isAlreadyFriend = (await fetchRedis(
			'sismember',
			`user:${session.user.id}:friends`,
			idToAdd,
		)) as 0 | 1

		if (isAlreadyFriend) {
			return new Response('You are already friends', { status: 400 })
		}

		if (session.user.id === idToAdd) {
			return new Response('You cannot add yourself as a friend', {
				status: 400,
			})
		}

    pusherServer.trigger(toPusherKey(`user:${idToAdd}:incoming_friend_requests`), 'incoming_friend_requests', {
      senderId: session.user.id,
      senderEmail: session.user.email,
    })

		db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)

		return new Response('Friend request sent', { status: 200 })
	} catch (error) {
		if (error instanceof z.ZodError) {
			return new Response('Invalid request payload', { status: 422 })
		}

		return new Response('Invalid request', { status: 400 })
	}
}
