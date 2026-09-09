require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const today = new Date();
  today.setUTCHours(0,0,0,0);
  const { data, error } = await supabase.from('video_tasks').select('*').gte('created_at', today.toISOString());
  console.log(`Found ${data ? data.length : 0} tasks created today.`);
}
check();
