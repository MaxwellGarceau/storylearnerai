/**
 * @fileoverview Prevents duplicate type definitions across the codebase
 * @author Maxwell Garceau
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prevent duplicate type definitions across the codebase",
      category: "TypeScript",
      recommended: false,
    },
    fixable: null,
    hasSuggestions: true,
    schema: [
      {
        type: "object",
        properties: {
          ignoreTypes: {
            type: "array",
            items: { type: "string" },
            description: "Types to ignore (e.g., primitive types)",
          },
          minComplexity: {
            type: "number",
            description: "Minimum complexity to trigger the rule (default: 2)",
            default: 2,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      duplicateType: "Duplicate type definition '{{type}}' found. Consider creating a reusable type alias.",
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const ignoreTypes = new Set(options.ignoreTypes || ['string', 'number', 'boolean', 'any', 'unknown', 'never', 'void', 'null', 'undefined']);
    const minComplexity = options.minComplexity || 2;
    
    // Store all type definitions found in the codebase
    const typeRegistry = new Map();
    
    /**
     * Calculate type complexity
     * @param {string} typeString - The type as a string
     * @returns {number} - Complexity score
     */
    function calculateComplexity(typeString) {
      if (!typeString) return 0;
      
      let complexity = 0;
      
      // Union types
      if (typeString.includes('|')) {
        complexity += typeString.split('|').length;
      }
      
      // Intersection types
      if (typeString.includes('&')) {
        complexity += typeString.split('&').length;
      }
      
      // Generic types
      if (typeString.includes('<')) {
        complexity += 2;
      }
      
      // Array types
      if (typeString.includes('[]') || typeString.includes('Array<')) {
        complexity += 1;
      }
      
      // Object types with properties
      if (typeString.includes('{') && typeString.includes('}')) {
        const propertyCount = (typeString.match(/[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/g) || []).length;
        complexity += propertyCount;
      }
      
      // Function types
      if (typeString.includes('=>')) {
        complexity += 2;
      }
      
      return complexity;
    }
    
    /**
     * Normalize type string for comparison
     * @param {string} typeString - The type as a string
     * @returns {string} - Normalized type string
     */
    function normalizeType(typeString) {
      if (!typeString) return '';
      
      // Remove extra whitespace
      let normalized = typeString.replace(/\s+/g, ' ').trim();
      
      // Sort union types alphabetically
      if (normalized.includes('|')) {
        const parts = normalized.split('|').map(part => part.trim()).sort();
        normalized = parts.join(' | ');
      }
      
      // Sort intersection types alphabetically
      if (normalized.includes('&')) {
        const parts = normalized.split('&').map(part => part.trim()).sort();
        normalized = parts.join(' & ');
      }
      
      return normalized;
    }
    
    /**
     * Check if type should be ignored
     * @param {string} typeString - The type as a string
     * @returns {boolean} - Whether to ignore this type
     */
    function shouldIgnoreType(typeString) {
      if (!typeString) return true;
      
      // Check against ignore list
      for (const ignoreType of ignoreTypes) {
        if (typeString === ignoreType || typeString.startsWith(ignoreType + '<')) {
          return true;
        }
      }
      
      // Check complexity
      const complexity = calculateComplexity(typeString);
      if (complexity < minComplexity) {
        return true;
      }
      
      return false;
    }
    
    /**
     * Report duplicate type
     * @param {ASTNode} node - The node with the duplicate type
     * @param {string} typeString - The duplicate type string
     * @param {string} originalLocation - Location of the original type definition
     */
    function reportDuplicateType(node, typeString, originalLocation) {
      context.report({
        node,
        messageId: "duplicateType",
        data: {
          type: typeString,
        },
        suggest: [
          {
            desc: `Create a type alias for '${typeString}'`,
            fix: (fixer) => {
              // This would need to be implemented based on your preferred naming convention
              const typeName = generateTypeName(typeString);
              return fixer.insertTextBefore(node, `type ${typeName} = ${typeString};\n\n`);
            },
          },
        ],
      });
    }
    
    /**
     * Generate a type name from the type string
     * @param {string} typeString - The type as a string
     * @returns {string} - Generated type name
     */
    function generateTypeName(typeString) {
      // Simple naming convention - can be enhanced
      const normalized = typeString
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
      
      return normalized + 'Type';
    }

    function visitTypeString(node, typeString) {
      const normalized = normalizeType(typeString);
      if (shouldIgnoreType(normalized)) {
        return;
      }
      if (typeRegistry.has(normalized)) {
        const originalLocation = typeRegistry.get(normalized);
        reportDuplicateType(node, normalized, originalLocation);
      } else {
        typeRegistry.set(normalized, {
          line: node.loc && node.loc.start ? node.loc.start.line : 0,
          column: node.loc && node.loc.start ? node.loc.start.column : 0,
          file: context.getFilename(),
        });
      }
    }

    return {
      // Process variable declarations that have type annotations
      VariableDeclarator(node) {
        if (node.id && node.id.typeAnnotation) {
          const typeString = context.getSourceCode().getText(node.id.typeAnnotation.typeAnnotation);
          visitTypeString(node.id.typeAnnotation, typeString);
        }
      },

      // Process any type annotation (covers unions, intersections, function types, object literals, etc.)
      TSTypeAnnotation(node) {
        if (node.typeAnnotation) {
          const typeString = context.getSourceCode().getText(node.typeAnnotation);
          visitTypeString(node, typeString);
        }
      },

      // Keep specific handlers for completeness (in case parser doesn't attach annotations in some cases)
      TSUnionType(node) {
        const typeString = context.getSourceCode().getText(node);
        visitTypeString(node, typeString);
      },
      TSIntersectionType(node) {
        const typeString = context.getSourceCode().getText(node);
        visitTypeString(node, typeString);
      },
      TSFunctionType(node) {
        const typeString = context.getSourceCode().getText(node);
        visitTypeString(node, typeString);
      },
      TSTypeLiteral(node) {
        const typeString = context.getSourceCode().getText(node);
        visitTypeString(node, typeString);
      },
    };
  },
};
