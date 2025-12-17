import { getSessionUser } from '../auth/utils';

interface Env {
  DB: D1Database;
}

// PATCH - Update link
export async function onRequestPatch(context: { 
  request: Request; 
  env: Env;
  params: { id: string };
}) {
  const { request, env, params } = context;
  
  try {
    const user = await getSessionUser(request, env);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { title, url, description, is_active } = await request.json();
    
    // Verify link belongs to user
    const existingLink = await env.DB.prepare(
      'SELECT user_id FROM links WHERE id = ?'
    ).bind(params.id).first();
    
    if (!existingLink || existingLink.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Link not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update link
    await env.DB.prepare(
      'UPDATE links SET title = ?, url = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(
      title,
      url,
      description || null,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      params.id
    ).run();
    
    // Get updated link
    const link = await env.DB.prepare(
      'SELECT * FROM links WHERE id = ?'
    ).bind(params.id).first();
    
    return new Response(JSON.stringify(link), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Update link error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE - Delete link
export async function onRequestDelete(context: { 
  request: Request; 
  env: Env;
  params: { id: string };
}) {
  const { request, env, params } = context;
  
  try {
    const user = await getSessionUser(request, env);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Verify link belongs to user and delete
    const result = await env.DB.prepare(
      'DELETE FROM links WHERE id = ? AND user_id = ?'
    ).bind(params.id, user.id).run();
    
    if (!result.success) {
      return new Response(JSON.stringify({ error: 'Link not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Delete link error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}