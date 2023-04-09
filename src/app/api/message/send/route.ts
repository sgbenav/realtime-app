import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { Message, messageValidator } from '@/lib/validations/messageValidator'
import { nanoid } from 'nanoid'

export async function POST(req: Request) {
	try {
		const { chatId, text }: { chatId: string; text: string } = await req.json()
		const session = await getServerSession(authOptions)

		if (!session) {
			return new Response('Unauthorized', { status: 401 })
		}

		const [firstUserId, secondUserId] = chatId.split('--')

		if (firstUserId !== session.user.id && secondUserId !== session.user.id) {
			return new Response('Unauthorized', { status: 401 })
		}

		const friendId =
			firstUserId === session.user.id ? secondUserId : firstUserId

		const friendList = (await fetchRedis(
			'smembers',
			`user:${session.user.id}:friends`,
		)) as string[]
		const isFriend = friendList.includes(friendId)

		if (!isFriend) {
			return new Response('Unauthorized', { status: 401 })
		}

		const rawSender = (await fetchRedis(
			'get',
			`user:${session.user.id}`,
		)) as string
		const sender = JSON.parse(rawSender) as User

		const timestamp = Date.now()

		const messageData: Message = {
			id: nanoid(),
			senderId: session.user.id,
			text,
			timestamp,
		}

		const message = messageValidator.parse(messageData)

		// all validations passed, send message

		await db.zadd(`chat:${chatId}:messages`, {
			score: timestamp,
			member: JSON.stringify(message),
		})

		return new Response('Success', { status: 200 })
	} catch (error) {
		if (error instanceof Error) {
			return new Response(error.message, { status: 500 })
		}

		return new Response('Internal Server Error', { status: 500 })
	}
}
