export function standardizeIconSize(svg, width = 48, height = 48) {
  if (typeof svg !== "string") {
    console.error("Expected SVG to be a string, but received:", svg);
    return "";
  }

  let cleanedSvg = svg.replace(/(width|height)="[^"]*"/g, "");
  const viewBoxMatch = cleanedSvg.match(/viewBox="([^"]*)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : `0 0 ${width} ${height}`;

  if (!viewBoxMatch) {
    cleanedSvg = cleanedSvg.replace("<svg", `<svg viewBox="${viewBox}"`);
  }

  cleanedSvg = cleanedSvg.replace(
    "<svg",
    `<svg width="${width}" height="${height}"`
  );

  return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">${cleanedSvg}</div>`;
}
