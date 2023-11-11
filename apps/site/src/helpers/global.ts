import tunnel from "tunnel-rat";
// allows you to define components in one place in the virtual DOM
// and have it appear in another place in the browser on a separate render
// (normally not possible with HTML elements)

// r3f.out - renders anything defined within r3f.in components
// r3f.in - wraps any components we want to send thru the tunnel somewhere else
export const r3f = tunnel();
