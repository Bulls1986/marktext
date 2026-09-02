import type { IconLoader, Mermaid, MermaidConfig, RenderResult } from 'mermaid';
import loadRenderer from './index';

type MermaidRenderResult = Pick<RenderResult, 'svg' | 'bindFunctions'>;

// Mermaid deliberately keeps icon collections out of its core bundle. The
// loaders below preserve that behaviour: the icon data is downloaded by the
// bundler only when a diagram actually references that pack.
const mermaidIconPacks: IconLoader[] = [
    {
        name: 'fa',
        loader: async () => (await import('@iconify-json/fa6-solid')).icons,
    },
    {
        name: 'fas',
        loader: async () => (await import('@iconify-json/fa6-solid')).icons,
    },
    {
        name: 'far',
        loader: async () => (await import('@iconify-json/fa6-regular')).icons,
    },
    {
        name: 'fab',
        loader: async () => (await import('@iconify-json/fa6-brands')).icons,
    },
    {
        name: 'logos',
        loader: async () => (await import('@iconify-json/logos')).icons,
    },
];

const registeredMermaidInstances = new WeakSet<object>();
let renderId = 0;
let renderQueue: Promise<void> = Promise.resolve();

function registerMermaidIconPacks(mermaid: Mermaid) {
    if (registeredMermaidInstances.has(mermaid))
        return;

    mermaid.registerIconPacks(mermaidIconPacks);
    registeredMermaidInstances.add(mermaid);
}

function getNextRenderId() {
    const id = `muya-mermaid-${++renderId}`;
    if (typeof document !== 'undefined' && document.getElementById(id))
        return getNextRenderId();
    return id;
}

/**
 * Run Mermaid renders serially because Mermaid's configuration is global.
 * Serialising initialization and rendering prevents a light export or a
 * second preview from changing the theme of a render already in flight.
 */
function enqueueMermaidRender<T>(task: () => Promise<T>): Promise<T> {
    const next = renderQueue.then(task);
    renderQueue = next.then(
        () => undefined,
        () => undefined,
    );
    return next;
}

/**
 * Render Mermaid from the original source text using Mermaid's current API.
 *
 * The old integration put the source in `innerHTML` and called `run`. That
 * treats Mermaid code as HTML and also creates a new ID generator for every
 * call. `render` keeps the source as text, returns an isolated SVG, and lets
 * us give every diagram a unique root ID.
 */
export function renderMermaid(
    code: string,
    theme: string,
): Promise<MermaidRenderResult> {
    return enqueueMermaidRender(async () => {
        const mermaid = (await loadRenderer('mermaid')) as Mermaid;
        registerMermaidIconPacks(mermaid);
        mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'strict',
            theme: theme as MermaidConfig['theme'],
        });

        const { svg, bindFunctions } = await mermaid.render(getNextRenderId(), code);
        return { svg, bindFunctions };
    });
}
