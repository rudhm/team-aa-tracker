import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function test() {
  const { data, error } = await supabase
    .from('video_tasks')
    .update({ is_urgent: true })
    .eq('id', 'cae9c2fd-0e42-4342-80d5-2670a2312678')
    .select('id')
    .single()
    
  console.log("Error:", error)
}
test()
