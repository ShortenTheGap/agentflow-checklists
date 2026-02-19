import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { agentChecklistId } = await req.json();

    // Get the agent checklist
    const agentChecklist = await base44.asServiceRole.entities.AgentChecklist.list();
    const checklist = agentChecklist.find(ac => ac.id === agentChecklistId);

    if (!checklist) {
      return Response.json({ error: 'Checklist not found' }, { status: 404 });
    }

    // Get the template
    const template = await base44.asServiceRole.entities.ChecklistTemplate.list();
    const sourceTemplate = template.find(t => t.id === checklist.source_template);

    if (!sourceTemplate) {
      return Response.json({ error: 'Source template not found' }, { status: 404 });
    }

    // Get existing sections and tasks to delete
    const allSections = await base44.asServiceRole.entities.AgentSection.list();
    const agentSections = allSections.filter(s => s.agent_checklist === agentChecklistId);

    const allTasks = await base44.asServiceRole.entities.AgentTask.list();
    const agentTasks = allTasks.filter(t => {
      return agentSections.some(s => s.id === t.agent_section);
    });

    // Delete old tasks and sections
    for (const task of agentTasks) {
      await base44.asServiceRole.entities.AgentTask.delete(task.id);
    }

    for (const section of agentSections) {
      await base44.asServiceRole.entities.AgentSection.delete(section.id);
    }

    // Get template sections and tasks
    const templateSections = await base44.asServiceRole.entities.TemplateSection.list();
    const templateTasks = await base44.asServiceRole.entities.TemplateTask.list();

    const sourceSections = templateSections.filter(s => s.template === sourceTemplate.id);
    const sourceTasks = templateTasks.filter(t => {
      return sourceSections.some(s => s.id === t.section);
    });

    // Create new sections
    for (const sourceSection of sourceSections) {
      const newSection = await base44.asServiceRole.entities.AgentSection.create({
        agent_checklist: agentChecklistId,
        source_section: sourceSection.id,
        name: sourceSection.name,
        sort_order: sourceSection.sort_order,
        is_deleted: false
      });

      // Create tasks for this section
      const sectionTasks = sourceTasks.filter(t => t.section === sourceSection.id);
      for (const sourceTask of sectionTasks) {
        await base44.asServiceRole.entities.AgentTask.create({
          agent_section: newSection.id,
          source_task: sourceTask.id,
          name: sourceTask.name,
          sort_order: sourceTask.sort_order,
          notes: sourceTask.notes || '',
          is_deleted: false,
          is_modified: false
        });
      }
    }

    return Response.json({ success: true, message: 'Checklist refreshed successfully' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});