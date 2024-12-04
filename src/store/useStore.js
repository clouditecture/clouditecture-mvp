import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import awsIcons from "../data/awsIcons.json";

/**
 * Creates an object with all categories expanded
 * @param {Object} icons - The icon object to create categories from
 * @param {string} prefix - The prefix for nested categories
 * @returns {Object} An object with all categories set to true
 */
const createExpandedCategories = (icons, prefix = "") => {
  return Object.keys(icons).reduce((acc, key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    acc[fullKey] = true;
    if (typeof icons[key] === "object" && !icons[key]["<?xml"]) {
      Object.assign(acc, createExpandedCategories(icons[key], fullKey));
    }
    return acc;
  }, {});
};

const useStore = create((set, get) => ({
  // Canvas state
  zoomLevel: 100,
  minZoom: 25,
  maxZoom: 200,
  isPanning: false,

  // UI state
  shapesExpanded: true,
  expandedCategories: createExpandedCategories(awsIcons),
  searchTerm: "",

  // Flow state
  nodes: [],
  edges: [],
  editingNodeId: null,
  clipboard: null,

  // History state
  history: [],
  currentHistoryIndex: -1,

  setGetCanvasSnapshot: (getCanvasSnapshot) => set({ getCanvasSnapshot }),

  // Getter for the canvas snapshot
  getCanvasSnapshot: null,

  // Canvas actions
  setIsPanning: (isPanning) => set({ isPanning }),
  setZoomLevel: (level) => set({ zoomLevel: level }),
  zoomIn: () =>
    set((state) => ({
      zoomLevel: Math.min(state.zoomLevel + 25, state.maxZoom),
    })),
  zoomOut: () =>
    set((state) => ({
      zoomLevel: Math.max(state.zoomLevel - 25, state.minZoom),
    })),
  fitView: () => set({ zoomLevel: "fit" }),

  // UI actions
  toggleShapes: () =>
    set((state) => ({ shapesExpanded: !state.shapesExpanded })),
  toggleCategoryExpanded: (category) =>
    set((state) => ({
      expandedCategories: {
        ...state.expandedCategories,
        [category]: !state.expandedCategories[category],
      },
    })),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setSelectedIcon: (iconData) => set({ selectedIcon: iconData }),

  // History actions
  pushToHistory: () => {
    const { nodes, edges } = get();
    const newHistoryEntry = { nodes: [...nodes], edges: [...edges] };

    set((state) => ({
      history: [
        ...state.history.slice(0, state.currentHistoryIndex + 1),
        newHistoryEntry,
      ],
      currentHistoryIndex: state.currentHistoryIndex + 1,
    }));
  },

  undo: () => {
    const { currentHistoryIndex, history } = get();
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      const { nodes, edges } = history[newIndex];
      set({ nodes, edges, currentHistoryIndex: newIndex });
    }
  },

  redo: () => {
    const { currentHistoryIndex, history } = get();
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      const { nodes, edges } = history[newIndex];
      set({ nodes, edges, currentHistoryIndex: newIndex });
    }
  },

  canUndo: () => get().currentHistoryIndex > 0,
  canRedo: () => get().currentHistoryIndex < get().history.length - 1,

  // Flow actions
  onNodesChange: (changes) => {
    set((state) => {
      const newNodes = applyNodeChanges(changes, state.nodes);
      return { nodes: newNodes };
    });
    get().pushToHistory();
  },

  onEdgesChange: (changes) => {
    set((state) => {
      const newEdges = applyEdgeChanges(changes, state.edges);
      return { edges: newEdges };
    });
    get().pushToHistory();
  },

  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge(connection, state.edges),
    }));
    get().pushToHistory();
  },

  addNode: (newNode) => {
    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
    get().pushToHistory();
  },

  updateNodeDimensions: (nodeId, width, height) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, width, height } }
          : node
      ),
    }));
  },

  updateNodeLabel: (nodeId, newLabel) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, name: newLabel } }
          : node
      ),
    }));
    get().pushToHistory();
  },

  setNodeEditing: (nodeId) => {
    set({ editingNodeId: nodeId });
  },

  cutNodes: () => {
    set((state) => {
      const selectedNodes = state.nodes.filter((node) => node.selected);
      const remainingNodes = state.nodes.filter((node) => !node.selected);
      return {
        nodes: remainingNodes,
        clipboard: selectedNodes,
      };
    });
    get().pushToHistory();
  },

  copyNodes: () => {
    set((state) => ({
      clipboard: state.nodes.filter((node) => node.selected),
    }));
  },

  pasteNodes: () => {
    set((state) => {
      if (!state.clipboard) return state;
      const newNodes = state.clipboard.map((node) => ({
        ...node,
        id: `${node.id}-copy-${Date.now()}`,
        position: { x: node.position.x + 20, y: node.position.y + 20 },
      }));
      return {
        nodes: [...state.nodes, ...newNodes],
      };
    });
    get().pushToHistory();
  },

  deleteSelected: () => {
    const selectedNodes = get().nodes.filter((node) => node.selected);
    const selectedEdges = get().edges.filter((edge) => edge.selected);

    if (selectedNodes.length === 0 && selectedEdges.length === 0) return;

    const nodesToRemove = new Set(selectedNodes.map((node) => node.id));

    set({
      nodes: get().nodes.filter((node) => !nodesToRemove.has(node.id)),
      edges: get().edges.filter(
        (edge) =>
          !selectedEdges.includes(edge) &&
          !nodesToRemove.has(edge.source) &&
          !nodesToRemove.has(edge.target)
      ),
    });
    get().pushToHistory();
  },

  isCanvasEmpty: () => {
    return get().nodes.length === 0;
  },
}));

export default useStore;
