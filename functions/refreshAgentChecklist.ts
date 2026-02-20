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

    // Get existing agent sections and tasks
    const agentSections = allSections.filter(s => s.agent_checklist === agentChecklistId);
    const sectionIds = agentSections.map(s => s.id);
    const agentTasks = allTasks.filter(t => sectionIds.includes(t.agent_section));

    // Get template sections and tasks
    const sourceSections = templateSections.filter(s => s.template === checklist.source_template);
    const sourceSectionIds = sourceSections.map(s => s.id);
    const sourceTasks = templateTasks.filter(t => sourceSectionIds.includes(t.section));

    const updates = [];

    // Process sections
    for (const sourceSection of sourceSections) {
      // Find matching agent section by source_section ID
      let agentSection = agentSections.find(s => s.source_section === sourceSection.id);
      
      if (!agentSection) {
        // Create new section if it doesn't exist
        agentSection = await base44.asServiceRole.entities.AgentSection.create({
          agent_checklist: agentChecklistId,
          source_section: sourceSection.id,
          name: sourceSection.name,
          sort_order: sourceSection.sort_order,
          is_deleted: false
        });
      } else {
        // Update section name and sort order from template (preserving agent data)
        updates.push(
          base44.asServiceRole.entities.AgentSection.update(agentSection.id, {
            name: sourceSection.name,
            sort_order: sourceSection.sort_order
          })
        );
      }

      // Process tasks for this section
      const sectionSourceTasks = sourceTasks.filter(t => t.section === sourceSection.id);
      
      for (const sourceTask of sectionSourceTasks) {
        // Find matching agent task by source_task ID
        const agentTask = agentTasks.find(t => 
          t.agent_section === agentSection.id && t.source_task === sourceTask.id
        );
        
        if (!agentTask) {
          // Create new task if it doesn't exist
          updates.push(
            base44.asServiceRole.entities.AgentTask.create({
              agent_section: agentSection.id,
              source_task: sourceTask.id,
              name: sourceTask.name,
              sort_order: sourceTask.sort_order,
              notes: sourceTask.notes || '',
              is_deleted: false,
              is_modified: false
            })
          );
        } else if (!agentTask.is_modified && !agentTask.is_deleted) {
          // Update task only if it hasn't been modified by agent
          updates.push(
            base44.asServiceRole.entities.AgentTask.update(agentTask.id, {
              name: sourceTask.name,
              sort_order: sourceTask.sort_order,
              notes: sourceTask.notes || ''
            })
          );
        }
        // If task is modified or deleted by agent, preserve their changes
      }
    }

    // Execute all updates in parallel
    if (updates.length > 0) {
      await Promise.all(updates);
    }

    return Response.json({ 
      success: true, 
      message: 'Checklist synced successfully',
      updates: updates.length 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});