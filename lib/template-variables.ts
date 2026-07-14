// Template variable extraction and replacement utilities

// Extract all unique placeholders from content
// Supports: {{variable_name}} and {{variable_name:default_value}}
export function extractVariables(content: string): Array<{
  name: string
  hasDefault: boolean
  defaultValue: string
}> {
  const placeholderRegex = /\{\{([^}:]+)(?::([^}]*))?\}\}/g
  const variables = new Map<string, { name: string; hasDefault: boolean; defaultValue: string }>()
  
  let match
  while ((match = placeholderRegex.exec(content)) !== null) {
    const fullMatch = match[0]
    const varName = match[1].trim()
    const defaultValue = match[2] !== undefined ? match[2] : ''
    
    if (!variables.has(varName)) {
      variables.set(varName, {
        name: varName,
        hasDefault: defaultValue !== '',
        defaultValue
      })
    }
  }
  
  return Array.from(variables.values())
}

// Replace all placeholders in content with provided values
// If no value provided and default exists, uses default
// If no value and no default, keeps placeholder as-is
export function replaceVariables(
  content: string,
  values: Record<string, string>
): string {
  const placeholderRegex = /\{\{([^}:]+)(?::([^}]*))?\}\}/g
  
  return content.replace(placeholderRegex, (fullMatch, varName, defaultValue) => {
    const trimmedName = varName.trim()
    const providedValue = values[trimmedName]
    
    if (providedValue !== undefined && providedValue !== '') {
      return providedValue
    }
    
    if (defaultValue !== undefined) {
      return defaultValue
    }
    
    return fullMatch // Keep placeholder if no value or default
  })
}

// Replace variables in all sections of a proposal/template
export function replaceVariablesInSections(
  sections: Array<{
    title?: string
    content?: { html?: string; json?: any }
    order?: number
    type?: string
  }>,
  values: Record<string, string>
): Array<{
  title?: string
  content?: { html?: string; json?: any }
  order?: number
  type?: string
}> {
  return sections.map(section => {
    const newSection = { ...section }
    
    if (newSection.content?.html) {
      newSection.content = {
        ...newSection.content,
        html: replaceVariables(newSection.content.html, values)
      }
    }
    
    if (newSection.title) {
      newSection.title = replaceVariables(newSection.title, values)
    }
    
    return newSection
  })
}

// Common variable names for sorting/formattting
export const COMMON_VARIABLES = [
  'client_name',
  'client_company',
  'client_email',
  'client_address',
  'project_name',
  'proposal_date',
  'pricing',
  'company_name',
  'valid_until',
  'contact_name',
  'contact_email'
]

// Format variable name for display (e.g., "client_name" -> "Client Name")
export function formatVariableName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}