

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.B42CosGb.js","_app/immutable/chunks/Ba8sbP-i.js","_app/immutable/chunks/DpoBZXP3.js","_app/immutable/chunks/CkpaVJWi.js"];
export const stylesheets = [];
export const fonts = [];
