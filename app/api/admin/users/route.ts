import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }), { status: 500 });
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ users: data?.users || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), { status: 500 });
  }
}
