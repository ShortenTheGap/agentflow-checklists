import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { agentChecklistId } = await req.json();

    // Fetch all data in parallel
    const [allChecklists, allSections, allTasks, templateSections, templateTasks] = await Promise.all([
      base44.asServiceRole.entities.AgentChecklist.list(),
      base44.asServiceRole.entities.AgentSection.list(),
      base44.asServiceRole.entities.AgentTask.list(),
      base44.asServiceRole.entities.TemplateSection.list(),
      base44.asServiceRole.entities.TemplateTask.list()
    ]);

    const checklist = allChecklists.find(ac => ac.id === agentChecklistId);
    if (!checklist) {
      return Response.json({ error: 'Checklist not found' }, { status: 404 });
    }

    // Get sections and tasks to delete
    const agentSections = allSections.filter(s => s.agent_checklist === agentChecklistId);
    const sectionIds = agentSections.map(s => s.id);
    const agentTasks = allTasks.filter(t => sectionIds.includes(t.agent_section));

    // Delete in parallel
    await Promise.all([
      ...agentTasks.map(t => base44.asServiceRole.entities.AgentTask.delete(t.id)),
      ...agentSections.map(s => base44.asServiceRole.entities.AgentSection.delete(s.id))
    ]);

    // Get template sections and tasks
    const sourceSections = templateSections.filter(s => s.template === checklist.source_template);
    const sourceSectionIds = sourceSections.map(s => s.id);
    const sourceTasks = templateTasks.filter(t => sourceSectionIds.includes(t.section));

    // Create new sections and tasks
    for (const sourceSection of sourceSections) {
      const newSection = await base44.asServiceRole.entities.AgentSection.create({
        agent_checklist: agentChecklistId,
        source_section: sourceSection.id,
        name: sourceSection.name,
        sort_order: sourceSection.sort_order,
        is_deleted: false
      });

      const sectionTasks = sourceTasks.filter(t => t.section === sourceSection.id);
      await Promise.all(
        sectionTasks.map(sourceTask =>
          base44.asServiceRole.entities.AgentTask.create({
            agent_section: newSection.id,
            source_task: sourceTask.id,
            name: sourceTask.name,
            sort_order: sourceTask.sort_order,
            notes: sourceTask.notes || '',
            is_deleted: false,
            is_modified: false
          })
        )
      );
    }

    return Response.json({ success: true, message: 'Checklist refreshed successfully' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});