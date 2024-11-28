import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useStore from "../store/useStore";
import IconNode from "./IconNode";
import Topbar from "./Topbar";
import ShapePanel from "./ShapePanel";

const nodeTypes = {
  iconNode: IconNode,
};

function CanvasContent({ canvasRef }) {
  const {
    zoomLevel,
    minZoom,
    maxZoom,
    addNode,
    isPanning,
    setZoomLevel,
    setIsPanning,
    onNodesChange: storeOnNodesChange,
    onEdgesChange: storeOnEdgesChange,
    onConnect: storeOnConnect,
    deleteSelected,
  } = useStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { zoomTo, fitView } = useReactFlow();

  const handleKeyDown = useCallback(
    (event) => {
      if (event.code === "Space") {
        setIsPanning(true);
      } else if (event.code === "Delete" || event.code === "Backspace") {
        deleteSelected();
      }
    },
    [setIsPanning, deleteSelected]
  );

  const handleKeyUp = useCallback(
    (event) => {
      if (event.code === "Space") {
        setIsPanning(false);
      }
    },
    [setIsPanning]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (zoomLevel === "fit") {
      fitView();
    } else {
      zoomTo(zoomLevel / 100);
    }
  }, [zoomLevel, zoomTo, fitView]);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds));
      storeOnConnect(params);
    },
    [setEdges, storeOnConnect]
  );

  const onNodesChangeWrapper = useCallback(
    (changes) => {
      onNodesChange(changes);
      storeOnNodesChange(changes);
    },
    [onNodesChange, storeOnNodesChange]
  );

  const onEdgesChangeWrapper = useCallback(
    (changes) => {
      onEdgesChange(changes);
      storeOnEdgesChange(changes);
    },
    [onEdgesChange, storeOnEdgesChange]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = canvasRef.current.getBoundingClientRect();
      const iconData = JSON.parse(
        event.dataTransfer.getData("application/reactflow")
      );

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode = {
        id: `${iconData.category}-${iconData.name}-${Date.now()}`,
        type: "iconNode",
        position,
        data: { ...iconData },
      };

      setNodes((nds) => nds.concat(newNode));
      addNode(newNode);
    },
    [setNodes, addNode, canvasRef]
  );

  const onMoveEnd = useCallback(
    (event, viewport) => {
      setZoomLevel(Math.round(viewport.zoom * 100));
    },
    [setZoomLevel]
  );

  return (
    <div ref={canvasRef} style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeWrapper}
        onEdgesChange={onEdgesChangeWrapper}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        panOnDrag={isPanning}
        selectionOnDrag={!isPanning}
        panOnScroll={false}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        minZoom={minZoom / 100}
        maxZoom={maxZoom / 100}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        zoomOnScroll={false}
        defaultViewport={{ x: 0, y: 0, zoom: zoomLevel / 100 }}
        selectNodesOnDrag={true}
      >
        <Background variant="dots" gap={16} size={1} />
      </ReactFlow>
    </div>
  );
}

function Canvas({ canvasRef }) {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlowProvider>
        <Topbar canvasRef={canvasRef} />
        <CanvasContent canvasRef={canvasRef} />
        <ShapePanel />
      </ReactFlowProvider>
    </div>
  );
}

export default Canvas;
