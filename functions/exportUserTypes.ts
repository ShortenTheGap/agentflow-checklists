import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all user types
    const userTypes = await base44.entities.UserType.list();

    // Build complete user type data with templates
    const userTypesData = [];

    for (const userType of userTypes) {
      // Fetch templates for this user type
      const templates = await base44.entities.ChecklistTemplate.filter({ user_type: userType.id });

      // Fetch sections and tasks for each template
      const templatesData = [];
      for (const template of templates) {
        const sections = await base44.entities.TemplateSection.filter({ template: template.id });
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

      userTypesData.push({
        ...userType,
        templates: templatesData
      });
    }

    const jsonData = JSON.stringify(userTypesData, null, 2);
    
    return new Response(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename=user_types_export.json'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});