import { useEffect } from "react";
import {
  ChevronDown,
  Redo,
  Undo,
  Scissors,
  Copy,
  Clipboard,
  Trash,
  ZoomIn,
  ZoomOut,
  ChevronDownIcon,
  Bot,
  ChevronUp,
  CircleUserIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import useStore from "../store/useStore";
import DownloadButton from "./DownloadButton";

export default function Topbar() {
  const {
    zoomLevel,
    zoomIn,
    zoomOut,
    setZoomLevel,
    fitView,
    shapesExpanded,
    toggleShapes,
    cutNodes,
    copyNodes,
    pasteNodes,
    deleteSelected,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useStore();

    // Add Ctrl + Mouse Scroll functionality
    useEffect(() => {
      const handleWheel = (event) => {
        if (event.ctrlKey) {
          event.preventDefault(); // Prevent browser zoom
          if (event.deltaY < 0) {
            zoomIn(); // Scroll up: Zoom in
          } else {
            zoomOut(); // Scroll down: Zoom out
          }
        }
      };
  
      window.addEventListener("wheel", handleWheel, { passive: false });
  
      return () => {
        window.removeEventListener("wheel", handleWheel);
      };
    }, [zoomIn, zoomOut]);

  return (
    <div className="absolute top-4 left-4 right-4 flex items-center justify-between p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 rounded-lg shadow-md">
      {/* Tools on the left */}
      <div className="flex items-center space-x-4 max-w-fit">
        {/* Shapes toggle */}
        <Button
          variant="ghost"
          onClick={toggleShapes}
          aria-label={shapesExpanded ? "Collapse shapes" : "Expand shapes"}
        >
          Shapes
          {shapesExpanded ? (
            <ChevronUp className="h-4 w-4 ml-2" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-2" />
          )}
        </Button>

        <Separator orientation="vertical" className="h-8" />

        {/* Action buttons */}
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={!canUndo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={!canRedo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={cutNodes}>
            <Scissors className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={copyNodes}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={pasteNodes}>
            <Clipboard className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={deleteSelected}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Zoom controls */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {zoomLevel === "fit" ? "Fit" : `${zoomLevel}%`}{" "}
                <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setZoomLevel(25)}>
                25%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setZoomLevel(50)}>
                50%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setZoomLevel(75)}>
                75%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setZoomLevel(100)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setZoomLevel(150)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setZoomLevel(200)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={fitView}>
                Fit to Screen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Logo and Title in the center */}
      <div className="flex items-center space-x-2 max-w-fit">
        <img
          src="/logo.svg?height=32&width=32"
          alt="Clouditecture Logo"
          className="h-8 w-8"
        />
        <h1 className="text-xl font-bold">Clouditecture</h1>
      </div>

      {/* AI Assistant Button on the right */}
      <div className="max-w-fit gap-4 flex flex-row justify-between items-center">
        <Button variant="outline">
          <Bot className="mr-2 h-4 w-4" />
          AI Assistant
        </Button>
        <DownloadButton />
        <CircleUserIcon />
      </div>
    </div>
  );
}
