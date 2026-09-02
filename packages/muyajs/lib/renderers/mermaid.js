import loadRenderer from './index.js'

// Mermaid does not ship Iconify collections in its core bundle. Keep the
// collections lazy so normal editor startup does not pay for them, while
// supporting the packs most Mermaid examples use out of the box.
const MERMAID_ICON_PACKS = [
  {
    name: 'fa',
    loader: async () => (await import('@iconify-json/fa6-solid')).icons
  },
  {
    name: 'fas',
    loader: async () => (await import('@iconify-json/fa6-solid')).icons
  },
  {
    name: 'far',
    loader: async () => (await import('@iconify-json/fa6-regular')).icons
  },
  {
    name: 'fab',
    loader: async () => (await import('@iconify-json/fa6-brands')).icons
  },
  {
    name: 'logos',
    loader: async () => (await import('@iconify-json/logos')).icons
  }
]

const registeredMermaidInstances = new WeakSet()
let renderId = 0
let renderQueue = Promise.resolve()

function registerMermaidIconPacks(mermaid) {
  if (registeredMermaidInstances.has(mermaid)) {
    return
  }

  mermaid.registerIconPacks(MERMAID_ICON_PACKS)
  registeredMermaidInstances.add(mermaid)
}

function getNextRenderId() {
  const id = `muyajs-mermaid-${++renderId}`
  if (typeof document !== 'undefined' && document.getElementById(id)) {
    return getNextRenderId()
  }
  return id
}

// Mermaid's configuration is global. Queue initialization and rendering so
// concurrent previews/exports cannot change the theme or ID state mid-render.
export function renderMermaid(code, theme) {
  const next = renderQueue.then(async () => {
    const mermaid = await loadRenderer('mermaid')
    registerMermaidIconPacks(mermaid)
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme
    })

    const { svg, bindFunctions } = await mermaid.render(getNextRenderId(), code)
    return { svg, bindFunctions }
  })
  renderQueue = next.then(
    () => undefined,
    () => undefined
  )
  return next
}
