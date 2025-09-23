// lib/utils/chat-router.ts
import { createClient } from '@/lib/supabase/client'

export async function routeToChat(userId: string, roomId: string) {
  const supabase = createClient()
  
  const { data: userData, error } = await supabase
    .from('users')
    .select('user_type')
    .eq('id', userId)
    .single()

  if (error || !userData) {
    console.error('User fetch error:', error)
    return '/chat'
  }

  const userType = userData.user_type as string
  
  if (userType === 'advertiser') {
    return `/chat/advertiser/${roomId}`
  } else if (userType === 'influencer') {
    return `/chat/influencer/${roomId}`
  }
  
  return `/chat/${roomId}`
}