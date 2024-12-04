import { useState, useCallback } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import useStore from "@/store/useStore";
import { useReactFlow } from "@xyflow/react";
import html2canvas from "html2canvas";

const DownloadButton = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { isCanvasEmpty } = useStore();
  const { getNodes, getEdges, getViewport } = useReactFlow();

  const downloadImage = useCallback(async () => {
    setIsDownloading(true);

    try {
      const nodes = getNodes();
      const edges = getEdges();

      if (nodes.length === 0) {
        console.warn("No nodes to export");
        return;
      }

      const nodesBounds = getRectOfNodes(nodes);
      const width = Math.max(nodesBounds.width, 1);
      const height = Math.max(nodesBounds.height, 1);
      const transform = getTransformForBounds(
        nodesBounds,
        width,
        height,
        0.5,
        20
      );

      const element = document.querySelector(".react-flow__viewport");
      if (!element) {
        console.error("Viewport element not found");
        return;
      }

      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        width: width,
        height: height,
        scale: 2,
        logging: true,
        allowTaint: true,
        useCORS: true,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector(
            ".react-flow__viewport"
          );
          if (clonedElement) {
            clonedElement.style.transform = `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`;
          }
          fixSvgPatterns(clonedDoc);
        },
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "clouditecture-diagram.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsDownloading(false);
    }
  }, [getNodes, getEdges, getViewport]);

  // Helper functions
  const getRectOfNodes = (nodes) => {
    const nodesWith = nodes.filter((node) => node.width && node.height);

    if (nodesWith.length === 0) {
      return { x: 0, y: 0, width: 1, height: 1 };
    }

    return nodesWith.reduce(
      (acc, node) => {
        const x = node.position.x;
        const y = node.position.y;
        const w = node.width || 0;
        const h = node.height || 0;

        acc.left = Math.min(acc.left, x);
        acc.top = Math.min(acc.top, y);
        acc.right = Math.max(acc.right, x + w);
        acc.bottom = Math.max(acc.bottom, y + h);

        return acc;
      },
      { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }
    );
  };

  const getTransformForBounds = (bounds, width, height, minZoom, padding) => {
    const xZoom = width / (bounds.width * (1 + padding));
    const yZoom = height / (bounds.height * (1 + padding));
    const zoom = Math.min(xZoom, yZoom);
    const clampedZoom = Math.max(minZoom, zoom);
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const x = -centerX * clampedZoom + width / 2;
    const y = -centerY * clampedZoom + height / 2;
    return [x, y, clampedZoom];
  };

  const fixSvgPatterns = (doc) => {
    const patterns = doc.querySelectorAll("pattern");
    patterns.forEach((pattern) => {
      ["x", "y", "width", "height"].forEach((attr) => {
        const value = pattern.getAttribute(attr);
        if (value === "Infinity" || value === "NaN" || value === "-Infinity") {
          pattern.setAttribute(attr, "0");
        }
      });
      const transform = pattern.getAttribute("patternTransform");
      if (transform && transform.includes("Infinity")) {
        pattern.removeAttribute("patternTransform");
      }
    });
  };

  return (
    <Button
      variant="outline"
      onClick={downloadImage}
      disabled={isCanvasEmpty() || isDownloading}
      aria-label="Download diagram"
    >
      <Download className="mr-2 h-4 w-4" />
      {isDownloading ? "Downloading..." : "Download"}
    </Button>
  );
};

export default DownloadButton;
