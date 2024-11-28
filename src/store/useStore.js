import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import awsIcons from "../data/awsIcons.json";

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
  zoomLevel: 100,
  minZoom: 25,
  maxZoom: 200,
  shapesExpanded: true,
  expandedCategories: createExpandedCategories(awsIcons),
  searchTerm: "",
  nodes: [],
  edges: [],
  editingNodeId: null,
  clipboard: null,
  isPanning: false,
  setIsPanning: (isPanning) => set({ isPanning }),

  setZoomLevel: (level) => set({ zoomLevel: level }),

  zoomIn: () => {
    set((state) => ({
      zoomLevel: Math.min(state.zoomLevel + 25, state.maxZoom),
    }));
  },

  zoomOut: () => {
    set((state) => ({
      zoomLevel: Math.max(state.zoomLevel - 25, state.minZoom),
    }));
  },

  fitView: () => set({ zoomLevel: "fit" }),

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

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (connection) => {
    set((state) => ({
      edges: addEdge(connection, state.edges),
    }));
  },

  addNode: (newNode) => {
    set((state) => ({
      nodes: [...state.nodes, newNode],
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
  },

  isCanvasEmpty: () => {
    return get().nodes.length === 0;
  },
}));

export default useStore;
