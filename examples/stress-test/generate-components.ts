import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const COMPONENT_COUNT = 5000;
const COMPONENTS_DIR = "src/components/generated";

// Generate a simple component
function generateSimpleComponent(name: string, index: number): string {
  return `<script lang="ts">
  let componentId = ${index};
  let name = "${name}";
</script>

<div>
  <h3>Component {componentId}: {name}</h3>
  <p>This is a simple component.</p>
</div>
`;
}

// Generate component with props
function generateComponentWithProps(name: string, index: number): string {
  return `<script lang="ts">
  export let title: string = "Default Title";
  export let count: number = 0;
  export let isActive: boolean = false;
  
  let componentId = ${index};
</script>

<div>
  <h3>{title} (ID: {componentId})</h3>
  <p>Count: {count}</p>
  <div>Status: {isActive ? 'Active' : 'Inactive'}</div>
</div>
`;
}

// Generate component with reactive state
function generateComponentWithState(name: string, index: number): string {
  return `<script lang="ts">
  let count = 0;
  let clicks = 0;
  let componentId = ${index};
  
  function increment() {
    count++;
    clicks++;
  }
  
  function decrement() {
    count--;
    clicks++;
  }
  
  $: doubled = count * 2;
  $: message = count > 10 ? "High count!" : count < 0 ? "Negative!" : "Normal";
</script>

<div>
  <h3>Counter Component {componentId}</h3>
  <div>
    <button on:click={decrement}>-</button>
    <span>{count}</span>
    <button on:click={increment}>+</button>
  </div>
  <p>Doubled: {doubled}</p>
  <p>Status: {message}</p>
  <small>Total clicks: {clicks}</small>
</div>
`;
}

// Generate component with events
function generateComponentWithEvents(name: string, index: number): string {
  return `<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher<{
    click: { componentId: number; timestamp: number };
    hover: { componentId: number };
  }>();
  
  let componentId = ${index};
  let isHovered = false;
  let clickCount = 0;
  
  function handleClick() {
    clickCount++;
    dispatch('click', {
      componentId,
      timestamp: Date.now()
    });
  }
  
  function handleMouseEnter() {
    isHovered = true;
    dispatch('hover', { componentId });
  }
  
  function handleMouseLeave() {
    isHovered = false;
  }
</script>

<div 
  on:click={handleClick}
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
>
  <h3>Event Component {componentId}</h3>
  <p>Click me! Clicks: {clickCount}</p>
  <p>Hover state: {isHovered ? 'Hovered' : 'Not hovered'}</p>
</div>
`;
}

// Generate component with slot for children
function generateComponentWithChildren(name: string, index: number): string {
  return `<script lang="ts">
  export let title: string = "Container Component";
  let componentId = ${index};
  let childrenCount = 0;
  
  $: childrenCount = Math.floor(Math.random() * 5) + 1;
</script>

<div>
  <header>
    <h3>{title} {componentId}</h3>
    <span>Children: {childrenCount}</span>
  </header>
  
  <main>
    <slot>
      <p>Default content when no children are provided</p>
      {#each Array(childrenCount) as _, i}
        <div>Child {i + 1}</div>
      {/each}
    </slot>
  </main>
  
  <footer>
    <small>Container component #{componentId}</small>
  </footer>
</div>
`;
}

// Component types for variety
const componentTypes = [
  "simple",
  "with-props", 
  "with-state",
  "with-events",
  "with-children"
] as const;

type ComponentType = typeof componentTypes[number];

// Generate component based on type
function generateComponent(name: string, index: number, type: ComponentType): string {
  switch (type) {
    case "simple":
      return generateSimpleComponent(name, index);
    case "with-props":
      return generateComponentWithProps(name, index);
    case "with-state":
      return generateComponentWithState(name, index);
    case "with-events":
      return generateComponentWithEvents(name, index);
    case "with-children":
      return generateComponentWithChildren(name, index);
    default:
      return generateSimpleComponent(name, index);
  }
}

// Generate index file that exports all components
function generateIndexFile(componentNames: string[]): string {
  const imports = componentNames
    .map((name, index) => `import Component${index} from './${name}.svelte';`)
    .join('\n');
  
  const exports = componentNames
    .map((_, index) => `  Component${index},`)
    .join('\n');
  
  return `${imports}

export {
${exports}
};

export const componentList = [
${componentNames.map((_, index) => `  Component${index},`).join('\n')}
];

export const componentCount = ${componentNames.length};
`;
}

async function main() {
  console.log(`🚀 Generating ${COMPONENT_COUNT} Svelte components...`);
  
  // Create the generated components directory
  await mkdir(COMPONENTS_DIR, { recursive: true });
  
  const componentNames: string[] = [];
  const startTime = Date.now();
  
  // Generate components in batches for better performance
  const batchSize = 100;
  const totalBatches = Math.ceil(COMPONENT_COUNT / batchSize);
  
  for (let batch = 0; batch < totalBatches; batch++) {
    const batchStart = batch * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, COMPONENT_COUNT);
    const promises: Promise<void>[] = [];
    
    for (let i = batchStart; i < batchEnd; i++) {
      const type = componentTypes[i % componentTypes.length];
      const name = `Component${i.toString().padStart(4, '0')}`;
      const fileName = `${name}.svelte`;
      const filePath = join(COMPONENTS_DIR, fileName);
      
      componentNames.push(name);
      
      const content = generateComponent(name, i, type);
      promises.push(writeFile(filePath, content));
    }
    
    await Promise.all(promises);
    
    const progress = ((batch + 1) / totalBatches * 100).toFixed(1);
    console.log(`📦 Batch ${batch + 1}/${totalBatches} complete (${progress}%)`);
  }
  
  // Generate index file
  console.log('📋 Generating index file...');
  const indexContent = generateIndexFile(componentNames);
  await writeFile(join(COMPONENTS_DIR, 'index.ts'), indexContent);
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log(`✅ Successfully generated ${COMPONENT_COUNT} components in ${duration.toFixed(2)}s`);
  console.log(`📁 Components created in: ${COMPONENTS_DIR}`);
  console.log(`📊 Component distribution:`);
  
  componentTypes.forEach(type => {
    const count = Math.ceil(COMPONENT_COUNT / componentTypes.length);
    console.log(`   - ${type}: ~${count} components`);
  });
  
  console.log('\n🏗️  Run "bun run build" to test build performance!');
}

if (import.meta.main) {
  main().catch(console.error);
}