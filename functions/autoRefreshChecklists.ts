import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    // Determine which template was affected
    let templateId;
    
    if (event.entity_name === 'TemplateSection') {
      const section = data;
      templateId = section.template;
    } else if (event.entity_name === 'TemplateTask') {
      // Get the section to find the template
      const sections = await base44.asServiceRole.entities.TemplateSection.list();
      const section = sections.find(s => s.id === data.section);
      if (!section) return Response.json({ success: true });
      templateId = section.template;
    } else {
      return Response.json({ success: true });
    }

    // Find all agent checklists using this template
    const allChecklists = await base44.asServiceRole.entities.AgentChecklist.list();
    const affectedChecklists = allChecklists.filter(ac => ac.source_template === templateId);

    // Refresh each checklist
    for (const checklist of affectedChecklists) {
      // Get existing sections and tasks
      const allSections = await base44.asServiceRole.entities.AgentSection.list();
      const agentSections = allSections.filter(s => s.agent_checklist === checklist.id);

      const allTasks = await base44.asServiceRole.entities.AgentTask.list();
      const agentTasks = allTasks.filter(t => {
        return agentSections.some(s => s.id === t.agent_section);
      });

      // Delete old tasks and sections
      const taskIds = agentTasks.map(t => t.id);
      const sectionIds = agentSections.map(s => s.id);
      
      for (const taskId of taskIds) {
        await base44.asServiceRole.entities.AgentTask.delete(taskId);
      }

      for (const sectionId of sectionIds) {
        await base44.asServiceRole.entities.AgentSection.delete(sectionId);
      }

      // Get template sections and tasks
      const templateSections = await base44.asServiceRole.entities.TemplateSection.list();
      const templateTasks = await base44.asServiceRole.entities.TemplateTask.list();

      const sourceSections = templateSections.filter(s => s.template === templateId);
      const sourceTasks = templateTasks.filter(t => {
        return sourceSections.some(s => s.id === t.section);
      });

      // Create new sections
      for (const sourceSection of sourceSections) {
        const newSection = await base44.asServiceRole.entities.AgentSection.create({
          agent_checklist: checklist.id,
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
    }

    return Response.json({ success: true, refreshed: affectedChecklists.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});