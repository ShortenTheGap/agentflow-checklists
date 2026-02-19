import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { full_name, email, role, status } = await req.json();

    const baseRole = role === 'admin' ? 'admin' : 'user';
    await base44.users.inviteUser(email, baseRole);

    return Response.json({ 
      success: true, 
      message: 'User invited successfully. They will receive an email to set up their account.',
      email 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});