import { authOptions } from '@/lib/auth'
import { addFriendValidator } from '@/lib/validations/addFriendValidator'
import { getServerSession } from 'next-auth'

export async function POST(req: Request) {
	try {
		const body = await req.json()

		const { email: emailToAdd } = addFriendValidator.parse(body)

		const response = await fetch(
			`${process.env.UPSTASH_REDIS_REST_URL}/get/user:email:${emailToAdd}`,
			{
				headers: {
					Authorization: `Basic ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
				},
				cache: 'no-store',
			},
		)

		const data = (await response.json()) as { result: string }
		const idToAdd = data.result

		if (!idToAdd) {
			return new Response('User not found', { status: 400 })
		}

		const session = await getServerSession(authOptions)

		if (!session) {
			return new Response('Unauthorized', { status: 401 })
		}

    if(session.user.id === idToAdd) {
      return new Response('You cannot add yourself as a friend', { status: 400 })
    }
	} catch (error) {}
}
