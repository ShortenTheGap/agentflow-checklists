import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all templates
    const templates = await base44.entities.ChecklistTemplate.list();

    // Build complete template data with sections and tasks
    const templatesData = [];

    for (const template of templates) {
      // Fetch sections for this template
      const sections = await base44.entities.TemplateSection.filter({ template: template.id });

      // Fetch tasks for all sections
      const sectionsData = [];
      for (const section of sections) {
        const tasks = await base44.entities.TemplateTask.filter({ section: section.id });
        sectionsData.push({
          ...section,
          tasks
        });
      }

      templatesData.push({
        ...template,
        sections: sectionsData
      });
    }

    const jsonData = JSON.stringify(templatesData, null, 2);
    
    return new Response(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename=templates_export.json'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});