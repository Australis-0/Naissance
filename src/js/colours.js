//Colours framework
function componentToHex (c) {
  var hex = c.toString(16);

  //Return statement
  return hex.length == 1 ? "0" + hex : hex;
}

function deltaE (rgbA, rgbB) {
  let labA = RGB2Lab(rgbA);
  let labB = RGB2Lab(rgbB);
  let deltaL = labA[0] - labB[0];
  let deltaA = labA[1] - labB[1];
  let deltaB = labA[2] - labB[2];
  let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
  let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
  let deltaC = c1 - c2;
  let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  let sc = 1.0 + 0.045 * c1;
  let sh = 1.0 + 0.015 * c1;
  let deltaLKlsl = deltaL / (1.0);
  let deltaCkcsc = deltaC / (sc);
  let deltaHkhsh = deltaH / (sh);
  let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}

function generateRandomColour () {
  //Return statement
  return [randomNumber(0, 255), randomNumber(0, 255), randomNumber(0, 255)];
}

function getColourDistance (arg0_rgb, arg1_rgb) {
  //Convert from parameters
  var colour_one = arg0_rgb;
  var colour_two = arg1_rgb;

  //Declare local instance variables
  var distance = Math.sqrt(
    Math.pow((colour_one[0] - colour_two[0]), 2) +
    Math.pow((colour_one[1] - colour_two[1]), 2) +
    Math.pow((colour_one[2] - colour_two[2]), 2)
  );

  //Return statement
  return distance;
}

function hexToRGB (hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  //Return statement
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : undefined;
}

function RGBToHex (r, g, b) {
  //Return statement
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function RGB2Lab (rgb) {
  let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  //Return statement
  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}
