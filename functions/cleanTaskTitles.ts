import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all template tasks
    const tasks = await base44.asServiceRole.entities.TemplateTask.filter({});
    
    const textToRemove = ' Logic Tree (Customization Options):';
    let updatedCount = 0;

    // Update tasks that contain the text
    for (const task of tasks) {
      if (task.name && task.name.includes(textToRemove)) {
        const newName = task.name.replace(textToRemove, '');
        await base44.asServiceRole.entities.TemplateTask.update(task.id, {
          name: newName
        });
        updatedCount++;
      }
    }

    return Response.json({ 
      success: true, 
      message: `Updated ${updatedCount} task titles`,
      updatedCount 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});