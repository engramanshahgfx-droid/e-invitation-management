const loadOptionalPlugin = async (pluginName) => {
  try {
    const plugin = await import(pluginName)
    return plugin.default ?? plugin
  } catch {
    return null
  }
}

const plugins = (await Promise.all([
  loadOptionalPlugin('prettier-plugin-organize-imports'),
  loadOptionalPlugin('prettier-plugin-tailwindcss'),
])).filter(Boolean)

/** @type {import("prettier").Config} */
const config = {
  semi: false,
  singleQuote: true,
  printWidth: 120,
  trailingComma: 'es5',
  // tailwindFunctions: ['clsx', 'tw'],
  ...(plugins.length > 0 ? { plugins } : {}),
  // tailwindStylesheet: './src/styles/tailwind.css',
}

export default config
