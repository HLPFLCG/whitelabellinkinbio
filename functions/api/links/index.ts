import { getSessionUser } from '../auth/utils';
import { generateId } from '../auth/utils';

interface Env {
  DB: D1Database;
}

// GET - Get user's links
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  try {
    const user = await getSessionUser(request, env);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get links
    const { results } = await env.DB.prepare(
      'SELECT * FROM links WHERE user_id = ? ORDER BY position ASC'
    ).bind(user.id).all();
    
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Get links error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST - Create new link
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  try {
    const user = await getSessionUser(request, env);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { title, url, description } = await request.json();
    
    if (!title || !url) {
      return new Response(JSON.stringify({ error: 'Title and URL are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate URL format
    if (!url.match(/^https?:\/\/.+/)) {
      return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get max position
    const maxPos = await env.DB.prepare(
      'SELECT MAX(position) as max_pos FROM links WHERE user_id = ?'
    ).bind(user.id).first();
    
    const position = (maxPos?.max_pos as number || 0) + 1;
    
    // Create link
    const linkId = generateId();
    await env.DB.prepare(
      'INSERT INTO links (id, user_id, title, url, description, position) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(linkId, user.id, title, url, description || null, position).run();
    
    // Get created link
    const link = await env.DB.prepare(
      'SELECT * FROM links WHERE id = ?'
    ).bind(linkId).first();
    
    return new Response(JSON.stringify(link), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Create link error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}