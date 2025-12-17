import { hashPassword, generateId } from './utils';

interface Env {
  DB: D1Database;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  try {
    const { email, password, username, displayName } = await request.json();
    
    // Validate input
    if (!email || !password || !username) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate username format
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
      return new Response(JSON.stringify({ 
        error: 'Username must be 3-30 characters and contain only letters, numbers, hyphens, and underscores' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate password length
    if (password.length < 6) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if email exists
    const existingUser = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();
    
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email already exists' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if username exists
    const existingUsername = await env.DB.prepare(
      'SELECT id FROM profiles WHERE username = ?'
    ).bind(username.toLowerCase()).first();
    
    if (existingUsername) {
      return new Response(JSON.stringify({ error: 'Username already taken' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create user
    const userId = generateId();
    const passwordHash = await hashPassword(password);
    
    await env.DB.prepare(
      'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)'
    ).bind(userId, email, passwordHash).run();
    
    // Create profile
    const profileId = generateId();
    await env.DB.prepare(
      'INSERT INTO profiles (id, user_id, username, display_name) VALUES (?, ?, ?, ?)'
    ).bind(profileId, userId, username.toLowerCase(), displayName || username).run();
    
    // Create session
    const sessionId = generateId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await env.DB.prepare(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
    ).bind(sessionId, userId, expiresAt.toISOString()).run();
    
    // Return success with session cookie
    return new Response(JSON.stringify({ 
      success: true,
      user: { id: userId, email, username: username.toLowerCase() }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}