# UpPass Form

A **dynamic form builder and renderer** built with **Vue 3**, **TypeScript**, and **Tailwind CSS**, bundled with **Vite**.
This project allows rendering forms from a JSON schema and provides a simple admin-style builder interface to manage form configurations.

**Live Demo:** [https://uppass.netlify.app](https://uppass.netlify.app)
**Source Code:** [GitHub Repository](https://github.com/piyushdolar/uppass-form)

---

## Features

### Form Renderer

- Dynamically renders forms from JSON schema.
- Supports multiple input types:
  - Text Input
  - Number Input
  - Radio / Select Input (Single Choice)
  - Date Picker
  - Textarea
- Handles **prefill values**, **required validation**, and **number constraints**.
- Conditional visibility for fields based on other field values.
- Submit functionality simulates sending data to a backend.

### Form Builder (Admin)

- Add, remove, and reorder form items.
- Configure item properties like label, placeholder, max length, visible conditions, and validation rules.
- Save or export JSON schema for reuse.

### Tech Stack

- Vue 3 + Composition API
- TypeScript
- Tailwind CSS
- Pinia for state management
- Vite for bundling and fast development

---

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Vue (Official) Extension (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
  _(Disable Vetur if installed)_

---

## Recommended Browser Setup

- **Chromium-based browsers (Chrome, Edge, Brave, etc.):**
  - [Vue.js DevTools](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - Enable **Custom Object Formatter** in DevTools: [Guide](http://bit.ly/object-formatters)
- **Firefox:**
  - [Vue.js DevTools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - Enable **Custom Object Formatter**: [Guide](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

---

## Project Setup

Install dependencies:

```bash
npm install

#Run in development mode (hot-reload):
npm run dev

#Build for production (type-check, compile, minify):
npm run build

#Preview production build locally:
npm run preview

#Lint and auto-fix code:
npm run lint

#Format code with Prettier:
npm run format


# Directory structure
src/
 ├─ components/
 │   ├─ DynamicForm.vue        # Main form renderer
 │   ├─ Inputs/                # Input components
 │   │   ├─ TextInput.vue
 │   │   ├─ RadioInput.vue
 │   │   └─ SelectInput.vue
 ├─ stores/                    # Pinia store for schema & form state
 ├─ types/                     # TypeScript interfaces
 └─ App.vue
```

### JSON Schema Example

```
{
  "name": "step",
  "label": "Leave Form",
  "items": {
    "full_name": { "type": "Text", "rule": "required", "display": { "label": "Name" } },
    "duration": { "type": "Radio", "enum": [ { "label": "Half Day", "value": "half" }, { "label": "Full Day", "value": "full" } ] }
  },
  "days": { "type": "Number", "prefill": { "value": 1 }, "value_constraints": { "maximum": 1000000, "allow_decimal": 0 } }
}
```

## Technical Decisions

- Component-based input design for modularity and reusability.
- Reactive form state using Vue’s `reactive`.
- Type safety using TypeScript.
- Conditional visibility for dynamic form behavior.
- Vite for fast development and production bundling.

## Future Improvements

- Add more input types (date picker, multi-select, file upload).
- Advanced form validation using `yup` or `vee-validate`.
- Persist schemas and form submissions to a backend.
- Improve builder UX for non-technical users.

## License

MIT License
