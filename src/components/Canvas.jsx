// import { useCallback, useEffect } from "react";
// import PropTypes from "prop-types";
// import {
//   ReactFlow,
//   Background,
//   useNodesState,
//   useEdgesState,
//   useReactFlow,
//   ReactFlowProvider,
//   addEdge,
//   MarkerType
// } from "@xyflow/react";
// import "@xyflow/react/dist/style.css";
// import useStore from "../store/useStore";
// import IconNode from "./IconNode";
// import Topbar from "./Topbar";
// import ShapePanel from "./ShapePanel";

// const nodeTypes = {
//   iconNode: IconNode,
// };

// function CanvasContent({ canvasRef }) {
//   const {
//     zoomLevel,
//     minZoom,
//     maxZoom,
//     addNode,
//     isPanning,
//     setZoomLevel,
//     setIsPanning,
//     onNodesChange: storeOnNodesChange,
//     onEdgesChange: storeOnEdgesChange,
//     onConnect: storeOnConnect,
//     deleteSelected,
//     isCanvasEmpty,
//     nodes: storeNodes,
//     edges: storeEdges,
//   } = useStore();

//   const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
//   const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);
//   const { zoomTo, fitView } = useReactFlow();

//   useEffect(() => {
//     setNodes(storeNodes);
//     setEdges(storeEdges);
//   }, [storeNodes, storeEdges, setNodes, setEdges]);

//   const handleKeyDown = useCallback(
//     (event) => {
//       if (event.code === "Space") {
//         setIsPanning(true);
//       } else if (event.code === "Delete") {
//         deleteSelected();
//       }
//     },
//     [setIsPanning, deleteSelected]
//   );

//   const handleKeyUp = useCallback(
//     (event) => {
//       if (event.code === "Space") {
//         setIsPanning(false);
//       }
//     },
//     [setIsPanning]
//   );

//   useEffect(() => {
//     window.addEventListener("keydown", handleKeyDown);
//     window.addEventListener("keyup", handleKeyUp);

//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       window.removeEventListener("keyup", handleKeyUp);
//     };
//   }, [handleKeyDown, handleKeyUp]);

//   useEffect(() => {
//     if (zoomLevel === "fit") {
//       fitView();
//     } else {
//       zoomTo(zoomLevel / 100);
//     }
//   }, [zoomLevel, zoomTo, fitView]);

//   const onConnect = useCallback(
//     (params) => {
//       const newEdge = {
//         ...params,
//         markerEnd: {
//           type: MarkerType.ArrowClosed,
//           width: 20,
//           height: 20,
//           color: '#00000'
//         }
//       }
//       setEdges((eds) => addEdge(newEdge, eds));
//       storeOnConnect(newEdge);

//       // Find the source and target nodes
//       const sourceNode = nodes.find((node) => node.id === params.source);
//       const targetNode = nodes.find((node) => node.id === params.target);

//       // Create and log the connection data
//       const connectionData = {
//         source: {
//           id: sourceNode.id,
//           name: sourceNode.data.name,
//           category: sourceNode.data.category,
//         },
//         target: {
//           id: targetNode.id,
//           name: targetNode.data.name,
//           category: targetNode.data.category,
//         },
//         connectionType: params.type,
//       };

//       console.log(JSON.stringify(connectionData, null, 2));
//     },
//     [setEdges, storeOnConnect, nodes]
//   );

//   const onNodesChangeWrapper = useCallback(
//     (changes) => {
//       onNodesChange(changes);
//       storeOnNodesChange(changes);
//     },
//     [onNodesChange, storeOnNodesChange]
//   );

//   const onEdgesChangeWrapper = useCallback(
//     (changes) => {
//       onEdgesChange(changes);
//       storeOnEdgesChange(changes);
//     },
//     [onEdgesChange, storeOnEdgesChange]
//   );

//   const onDragOver = useCallback((event) => {
//     event.preventDefault();
//     event.dataTransfer.dropEffect = "move";
//   }, []);

//   const onDrop = useCallback(
//     (event) => {
//       event.preventDefault();

//       const reactFlowBounds = canvasRef.current.getBoundingClientRect();
//       const iconData = JSON.parse(
//         event.dataTransfer.getData("application/reactflow")
//       );

//       const position = {
//         x: event.clientX - reactFlowBounds.left,
//         y: event.clientY - reactFlowBounds.top,
//       };

//       const newNode = {
//         id: `${iconData.category}-${iconData.name}-${Date.now()}`,
//         type: "iconNode",
//         position,
//         data: { ...iconData, width: 100, height: 100 },
//       };

//       setNodes((nds) => nds.concat(newNode));
//       addNode(newNode);
//     },
//     [setNodes, addNode, canvasRef]
//   );

//   const onMoveEnd = useCallback(
//     (event, viewport) => {
//       setZoomLevel(Math.round(viewport.zoom * 100));
//     },
//     [setZoomLevel]
//   );

//   useEffect(() => {
//     const handleBeforeUnload = (event) => {
//       if (!isCanvasEmpty()) {
//         event.preventDefault();
//         event.returnValue = "";
//       }
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);

//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, [isCanvasEmpty]);

//   return (
//     <div ref={canvasRef} style={{ width: "100%", height: "100%" }}>
//       <ReactFlow
//       proOptions={{ hideAttribution: true}}
//         nodes={nodes}
//         edges={edges}
//         onNodesChange={onNodesChangeWrapper}
//         onEdgesChange={onEdgesChangeWrapper}
//         onConnect={onConnect}
//         onDragOver={onDragOver}
//         onDrop={onDrop}
//         panOnDrag={isPanning}
//         selectionOnDrag={!isPanning}
//         panOnScroll={false}
//         onMoveEnd={onMoveEnd}
//         nodeTypes={nodeTypes}
//         minZoom={minZoom / 100}
//         maxZoom={maxZoom / 100}
//         zoomOnPinch={false}
//         zoomOnDoubleClick={false}
//         zoomOnScroll={false}
//         defaultViewport={{ x: 0, y: 0, zoom: zoomLevel / 100 }}
//         selectNodesOnDrag={true}
//       >
//         <Background variant="dots" gap={16} size={1} />
//       </ReactFlow>
//     </div>
//   );
// }

// CanvasContent.propTypes = {
//   canvasRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) })
//     .isRequired,
// };

// function Canvas({ canvasRef }) {
//   return (
//     <div style={{ width: "100%", height: "100vh" }}>
//       <ReactFlowProvider>
//         <Topbar canvasRef={canvasRef} />
//         <CanvasContent canvasRef={canvasRef} />
//         <ShapePanel />
//       </ReactFlowProvider>
//     </div>
//   );
// }

// Canvas.propTypes = {
//   canvasRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) })
//     .isRequired,
// };

// export default Canvas;




import { useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  addEdge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import useStore from "../store/useStore";
import IconNode from "./IconNode";
import Topbar from "./Topbar";
import ShapePanel from "./ShapePanel";
import { toPng } from "html-to-image";

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
    isCanvasEmpty,
    nodes: storeNodes,
    edges: storeEdges,
    setGetCanvasSnapshot,
  } = useStore();

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);
  const { zoomTo, fitView, getNodes, getEdges, getViewport } = useReactFlow();

  const reactFlowWrapper = useRef(null);

  useEffect(() => {
    setNodes(storeNodes);
    setEdges(storeEdges);
  }, [storeNodes, storeEdges, setNodes, setEdges]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.code === "Space") {
        setIsPanning(true);
      } else if (event.code === "Delete") {
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
      const newEdge = {
        ...params,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: "#000000",
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      storeOnConnect(newEdge);

      // Find the source and target nodes
      const sourceNode = nodes.find((node) => node.id === params.source);
      const targetNode = nodes.find((node) => node.id === params.target);

      // Create and log the connection data
      const connectionData = {
        source: {
          id: sourceNode.id,
          name: sourceNode.data.name,
          category: sourceNode.data.category,
        },
        target: {
          id: targetNode.id,
          name: targetNode.data.name,
          category: targetNode.data.category,
        },
        connectionType: params.type,
      };

      console.log(JSON.stringify(connectionData, null, 2));
    },
    [setEdges, storeOnConnect, nodes]
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

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
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
        data: { ...iconData, width: 100, height: 100 },
      };

      setNodes((nds) => nds.concat(newNode));
      addNode(newNode);
    },
    [setNodes, addNode]
  );

  const onMoveEnd = useCallback(
    (event, viewport) => {
      setZoomLevel(Math.round(viewport.zoom * 100));
    },
    [setZoomLevel]
  );

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isCanvasEmpty()) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isCanvasEmpty]);

  const getCanvasSnapshot = useCallback(() => {
    console.log("getCanvasSnapshot called");
    if (reactFlowWrapper.current) {
      console.log("reactFlowWrapper found, attempting to generate PNG");
      return toPng(reactFlowWrapper.current, {
        filter: (node) => {
          const result =
            !node.classList?.contains("react-flow__panel") &&
            !node.classList?.contains("react-flow__attribution");
          console.log("Filtering node:", node, "Result:", result);
          return result;
        },
        quality: 1,
        pixelRatio: 2,
        fontEmbedCSS: "",
        imagePlaceholder:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==",
      })
        .then((dataUrl) => {
          console.log(
            "PNG generated successfully, type:",
            typeof dataUrl,
            "value:",
            dataUrl
          );
          return dataUrl;
        })
        .catch((error) => {
          console.error("Error generating PNG:", error);
          throw error;
        });
    }
    console.log("reactFlowWrapper not found");
    return Promise.resolve(null);
  }, []);

  useEffect(() => {
    setGetCanvasSnapshot(getCanvasSnapshot);
  }, [setGetCanvasSnapshot, getCanvasSnapshot]);

  useEffect(() => {
    setGetCanvasSnapshot(() => getCanvasSnapshot);
  }, [setGetCanvasSnapshot, getCanvasSnapshot]);

  return (
    <div ref={reactFlowWrapper} style={{ width: "100%", height: "100%" }}>
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

CanvasContent.propTypes = {
  canvasRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) })
    .isRequired,
};

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

Canvas.propTypes = {
  canvasRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) })
    .isRequired,
};

export default Canvas;

