import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { full_name, email, role, status } = await req.json();

    const invitedUser = await base44.asServiceRole.users.inviteUser(email, role);

    const updatedUser = await base44.asServiceRole.entities.User.update(invitedUser.id, {
      full_name: full_name || invitedUser.full_name,
      status: status || 'pending_setup'
    });

    return Response.json(updatedUser);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});