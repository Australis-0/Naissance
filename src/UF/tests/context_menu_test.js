var context_menu = createContextMenu({
  anchor: "#context-menu-container",
  class: "context-menu-test",
  id: "context-menu-test",
  name: "Context Menu",

  biuf_input: {
    id: "biuf_input",
    name: "BIUF Input Test",
    type: "biuf",

    x: 0,
    y: 0,

    default: "Test"
  },

  biuf_input_two: {
    id: "biuf_input_two",
    name: "BIUF Input Test Two",
    type: "biuf",

    x: 1,
    y: 0
  },

  wysiwyg_input: {
    id: "wysiwyg_input",
    name: "WYSIWYG Editor",
    type: "wysiwyg",

    width: 2,

    x: 1,
    y: 1
  },

  button_input: {
    id: "button_input",
    name: "Button Test",
    type: "button",

    x: 2,
    y: 1
  },

  colour_input: {
    id: "colour_input",
    name: "Colour Wheel",
    type: "colour",

    x: 3,
    y: 2
  },

  checkbox_input: {
    id: "checkbox_input",
    name: "Checkbox",
    type: "checkbox",

    x: 4,
    y: 2
  }
});
