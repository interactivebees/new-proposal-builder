'use client'

import { useState, useEffect } from 'react'
import { extractVariables, formatVariableName } from '@/lib/template-variables'

interface Variable {
  name: string
  hasDefault: boolean
  defaultValue: string
}

interface VariableInputFormProps {
  content: string
  onSubmit: (values: Record<string, string>) => void
  onSkip: () => void
}

export default function VariableInputForm({ content, onSubmit, onSkip }: VariableInputFormProps) {
  const [variables, setVariables] = useState<Variable[]>([])
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    const extracted = extractVariables(content)
    setVariables(extracted)
    
    // Pre-fill defaults
    const defaults: Record<string, string> = {}
    extracted.forEach(v => {
      if (v.hasDefault) {
        defaults[v.name] = v.defaultValue
      }
    })
    setValues(defaults)
  }, [content])

  const handleChange = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(values)
  }

  if (variables.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-card)] rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-[var(--text-heading)] mb-2">
            Fill in Template Variables
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            This template contains placeholders. Fill in the values below to customize your proposal.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {variables.map((variable) => (
              <div key={variable.name}>
                <label 
                  htmlFor={variable.name}
                  className="block text-sm font-medium text-[var(--text-body)] mb-1"
                >
                  {formatVariableName(variable.name)}
                  {variable.hasDefault && (
                    <span className="text-[var(--text-muted)] font-normal ml-2">
                      (default: {variable.defaultValue})
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  id={variable.name}
                  value={values[variable.name] || ''}
                  onChange={(e) => handleChange(variable.name, e.target.value)}
                  placeholder={`Enter ${formatVariableName(variable.name).toLowerCase()}`}
                  className="w-full px-3 py-2 border border-[var(--border-default)] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}

            <div className="flex justify-end space-x-3 pt-4 border-t border-[var(--border-light)]">
              <button
                type="button"
                onClick={onSkip}
                className="px-4 py-2 border border-[var(--border-default)] rounded-md shadow-sm text-sm font-medium text-[var(--text-body)] bg-[var(--bg-card)] hover:bg-[var(--hover-bg)]"
              >
                Skip
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Apply Values
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}