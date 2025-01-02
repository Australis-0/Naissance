config.mask_types = {
  add: {
    name: "Add (Brush > Mask)",

    effect: {
      all_selected_polities: {
        remove_coords: "brush"
      }
    }
  },
  intersect_add: {
    name: "Intersect Add (Brush > Intersection)",

    effect: {
      brush: {
        remove_coords: {
          value: {
            not: { //Remove any coords outside all_selected_polities from brush
              coords: "all_selected_polities"
            }
          }
        }
      },
      all_selected_polities: {
        remove_coords: "brush"
      }
    }
  },
  intersect_overlay: {
    name: "Intersect Overlay (Brush in Intersection)",

    effect: {
      brush: {
        remove_coords: {
          value: {
            not: { //Remove any coords outside all_selected_polities from brush
              coords: "all_selected_polities"
            }
          }
        }
      }
    }
  },
  subtract: {
    name: "Subtract (Mask > Brush)",

    effect: {
      brush: {
        remove_coords: {
          value: {
            is: { //Remove any coords inside all_selected_polities from brush
              coords: "all_selected_polities"
            }
          }
        }
      }
    }
  }
};
