/**
 * @fileoverview Prevents non-localized text in React components
 * @author Maxwell Garceau
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prevent non-localized text in React components",
      category: "React",
      recommended: false,
    },
    fixable: null,
    hasSuggestions: true,
    schema: [
      {
        type: "object",
        properties: {
          ignorePatterns: {
            type: "array",
            items: { type: "string" },
            description: "Regex patterns to ignore (e.g., technical strings, URLs)",
          },
          minLength: {
            type: "number",
            description: "Minimum string length to trigger the rule (default: 3)",
            default: 3,
          },
          allowedProps: {
            type: "array",
            items: { type: "string" },
            description: "Props that are allowed to contain non-localized text",
            default: ["className", "id", "data-testid", "aria-label", "title", "alt", "placeholder"]
          }
        },
        additionalProperties: false,
      },
    ],
    messages: {
      nonLocalizedText: "Non-localized text '{{text}}' found. Use t('{{key}}') from react-i18next instead.",
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const ignorePatterns = options.ignorePatterns || [
      '^[A-Z_]+$', // Constants like ERROR, SUCCESS
      '^[a-z]+://', // URLs with protocols
      '^/[a-zA-Z0-9/?=&._-]*$', // Relative URLs starting with /
      '^[0-9]+$', // Numbers
      '^[0-9]+\\.[0-9]+$', // Decimal numbers
      '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', // Email addresses
      '^[a-zA-Z0-9._-]+$', // Technical identifiers
      '^[\\s\\S]*<[^>]*>[\\s\\S]*$', // HTML-like content
      '^[\\s\\S]*\\{[^}]*\\}[\\s\\S]*$', // Template literals with variables
      '^[\\s\\S]*\\([^)]*\\)[\\s\\S]*$', // Function calls
      '^[\\s\\S]*\\.[a-zA-Z]+[\\s\\S]*$', // Method calls
      '^[0-9\\s]+$', // SVG viewBox values like "0 0 24 24"
      '^[MLHVCSQTAZmlhvcsqtaz0-9\\s.-]+$', // SVG path data
    ];
    const minLength = options.minLength || 3;
    const allowedProps = new Set(options.allowedProps || ["className", "id", "data-testid", "aria-label", "title", "alt", "placeholder", "viewBox", "fill", "stroke", "strokeLinecap", "strokeLinejoin", "strokeWidth", "d"]);
    
    // Track if useTranslation is imported and used
    let hasUseTranslation = false;
    let translationFunctionName = 't';
    
    /**
     * Check if string should be ignored
     * @param {string} text - The text to check
     * @returns {boolean} - Whether to ignore this text
     */
    function shouldIgnoreText(text) {
      if (!text || text.length < minLength) {
        return true;
      }
      
      // Check against ignore patterns
      for (const pattern of ignorePatterns) {
        if (new RegExp(pattern).test(text)) {
          return true;
        }
      }
      
      // Ignore strings that are already using t() function
      if (text.includes('t(') || text.includes('useTranslation')) {
        return true;
      }
      
      return false;
    }
    
    /**
     * Generate a suggested translation key
     * @param {string} text - The text to generate a key for
     * @returns {string} - Suggested translation key
     */
    function generateTranslationKey(text) {
      // Convert text to camelCase key
      return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map((word, index) => 
          index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join('');
    }
    
    /**
     * Report non-localized text
     * @param {ASTNode} node - The node with non-localized text
     * @param {string} text - The non-localized text
     */
    function reportNonLocalizedText(node, text) {
      const suggestedKey = generateTranslationKey(text);
      
      context.report({
        node,
        messageId: "nonLocalizedText",
        data: {
          text: text.length > 50 ? text.substring(0, 50) + '...' : text,
          key: suggestedKey,
        },
        suggest: [
          {
            desc: `Use t('${suggestedKey}') instead of hardcoded text`,
            fix: (fixer) => {
              return fixer.replaceText(node, `${translationFunctionName}('${suggestedKey}')`);
            },
          },
        ],
      });
    }

    return {
      // Check for useTranslation import
      ImportDeclaration(node) {
        if (node.source.value === 'react-i18next') {
          node.specifiers.forEach(specifier => {
            if (specifier.imported && specifier.imported.name === 'useTranslation') {
              hasUseTranslation = true;
            }
          });
        }
      },
      
      // Check for useTranslation hook usage
      VariableDeclarator(node) {
        if (node.init && 
            node.init.type === 'CallExpression' && 
            node.init.callee.name === 'useTranslation') {
          hasUseTranslation = true;
          // Extract the destructured variable name for t function
          if (node.id.type === 'ObjectPattern') {
            node.id.properties.forEach(prop => {
              if (prop.key && prop.key.name === 't' && prop.value) {
                translationFunctionName = prop.value.name;
              }
            });
          }
        }
      },
      
      // Check JSX text content
      JSXText(node) {
        if (!hasUseTranslation) return;
        
        const text = node.value.trim();
        if (!shouldIgnoreText(text)) {
          reportNonLocalizedText(node, text);
        }
      },
      
      // Check JSX attribute values
      JSXAttribute(node) {
        if (!hasUseTranslation) return;
        
        // Skip allowed props
        if (node.name && allowedProps.has(node.name.name)) {
          return;
        }
        
        if (node.value && node.value.type === 'Literal' && typeof node.value.value === 'string') {
          const text = node.value.value;
          if (!shouldIgnoreText(text)) {
            reportNonLocalizedText(node.value, text);
          }
        }
      },
      
      // Check string literals in JSX expressions
      Literal(node) {
        if (!hasUseTranslation) return;
        
        // Only check string literals that are direct children of JSX
        if (typeof node.value === 'string' && 
            node.parent && 
            (node.parent.type === 'JSXExpressionContainer' || 
             node.parent.type === 'JSXElement')) {
          const text = node.value;
          if (!shouldIgnoreText(text)) {
            reportNonLocalizedText(node, text);
          }
        }
      },
    };
  },
};
