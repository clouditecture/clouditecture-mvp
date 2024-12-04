
export function decodeSvg(svgString) {
  // Remove any surrounding quotes and unescape the string
  const unescapedSvg = svgString.replace(/^"|"$/g, "").replace(/\\"/g, '"');

  // Remove XML declaration
  const cleanSvg = unescapedSvg.replace(/<\?xml[^>]+\?>/, "");

  // Remove fixed width and height, keep viewBox
  return cleanSvg.replace(/(width|height)="\d+(?:px)?"/g, "");
}

/**
 * Converts SVG string to a data URL
 * @param {string} svgString - The SVG string
 * @returns {string} - Data URL of the SVG
 */
export function svgToDataUrl(svgString) {
  const encodedSvg = encodeURIComponent(svgString);
  return `data:image/svg+xml,${encodedSvg}`;
}

export function makeScalableSvg(svgString) {
  try {
    // Unescape the SVG string
    const unescapedSvg = svgString.replace(/\\n/g, "\n").replace(/\\"/g, '"');

    // Create a temporary div to parse the SVG string
    const div = document.createElement("div");
    div.innerHTML = unescapedSvg.trim();

    // Get the SVG element
    const svgElement = div.querySelector("svg");
    if (!svgElement) {
      console.error("No SVG element found in the provided string");
      return svgString;
    }

    // Ensure viewBox attribute
    if (!svgElement.getAttribute("viewBox")) {
      const width = svgElement.getAttribute("width") || "48";
      const height = svgElement.getAttribute("height") || "48";
      svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
    }

    // Set width and height to 100%
    svgElement.setAttribute("width", "100%");
    svgElement.setAttribute("height", "100%");

    // Ensure proper scaling
    svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");

    // Remove any duplicate viewBox, width, or height attributes
    const attributes = svgElement.attributes;
    const seenAttributes = new Set();
    for (let i = attributes.length - 1; i >= 0; i--) {
      const attr = attributes[i];
      if (seenAttributes.has(attr.name)) {
        svgElement.removeAttribute(attr.name);
      } else {
        seenAttributes.add(attr.name);
      }
    }

    return svgElement.outerHTML;
  } catch (error) {
    console.error("Error processing SVG:", error);
    return svgString; // Return original content if any error occurs
  }
}
