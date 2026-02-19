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
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = await base44.asServiceRole.entities.User.filter({ email });
    const invitedUser = users[0];
    
    if (!invitedUser) {
      throw new Error('User creation failed');
    }

    const updateData = {
      full_name: full_name,
      status: status || 'pending_setup'
    };
    
    if (role && role !== 'user') {
      updateData.role = role;
    }
    
    const updatedUser = await base44.asServiceRole.entities.User.update(invitedUser.id, updateData);

    return Response.json(updatedUser);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});