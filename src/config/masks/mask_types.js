config.mask_types = {
  add: {
    name: "Add (Brush > Mask)",

    effect: {
      remove_brush_coords_from_selected_polities: true
    }
  },
  intersect_add: {
    name: "Intersect Add (Brush > Intersection)",

    effect: {
      remove_brush_coords_outside_selected_polities: true,
      remove_brush_coords_from_selected_polities: true
    }
  },
  intersect_overlay: {
    name: "Intersect Overlay (Brush in Intersection)",

    effect: {
      remove_brush_coords_outside_selected_polities: true
    }
  },
  subtract: {
    name: "Subtract (Mask > Brush)",

    effect: {
      remove_selected_polities_from_brush_coords: true
    }
  },
  clear: {
    name: "No Mask"
  }
};
