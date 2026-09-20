<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## UI consistency

Use `components/BrandSelect.tsx` for all selection menus. Do not introduce native `<select>` menus: CSS cannot consistently style their open popup across browsers. Preserve keyboard navigation, visible focus, accessible labels, form submission, outside-click dismissal and Escape.
