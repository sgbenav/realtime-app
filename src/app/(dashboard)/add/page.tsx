import AddFriendForm from "@/components/AddFriendForm"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

export default async function AddFriend() {
  const session = await getServerSession(authOptions)
  return <main className="pt-8">
    <h1 className="font-bold text-5xl mb-8">Add Friend</h1>
    <AddFriendForm/>
  </main>
}
