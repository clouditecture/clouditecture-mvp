import React, { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Panel } from "@xyflow/react";
import useStore from "@/store/useStore";
import awsIcons from "@/data/awsIcons.json";

const createCategoryStructure = (icons) => {
  const structure = {};
  Object.entries(icons).forEach(([key, svg]) => {
    const parts = key.split(".");
    let current = structure;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = svg;
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    });
  });
  return structure;
};

const NestedCategory = React.memo(function NestedCategory({
  category,
  icons,
  depth,
  searchTerm,
  onIconSelect,
  parentCategory,
}) {
  const fullCategory = parentCategory
    ? `${parentCategory}.${category}`
    : category;
  const isExpanded = useStore(
    (state) => state.expandedCategories[fullCategory]
  );
  const toggleCategoryExpanded = useStore(
    (state) => state.toggleCategoryExpanded
  );

  const toggleExpand = useCallback(
    () => toggleCategoryExpanded(fullCategory),
    [toggleCategoryExpanded, fullCategory]
  );

  const filteredIcons = useMemo(() => {
    return Object.entries(icons).filter(
      ([name, value]) =>
        typeof value === "string" &&
        name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [icons, searchTerm]);

  const nestedCategories = useMemo(() => {
    return Object.entries(icons).filter(
      ([_, value]) => typeof value === "object"
    );
  }, [icons]);

  if (filteredIcons.length === 0 && nestedCategories.length === 0) {
    return null;
  }

  return (
    <div className={`mb-2 ${depth > 0 ? "ml-4" : ""}`}>
      <Button
        variant="ghost"
        className="w-full justify-between mb-2 text-left"
        onClick={toggleExpand}
      >
        <span className="truncate">{category}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 flex-shrink-0 transform transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </Button>
      {isExpanded && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
            {filteredIcons.map(([name, svg]) => (
              <div
                key={name}
                className="flex flex-col items-center justify-center py-2 px-1 border rounded cursor-pointer"
                onClick={() =>
                  onIconSelect({
                    type: "awsIcon",
                    category: fullCategory,
                    name,
                    svg: encodeURIComponent(svg),
                  })
                }
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(
                    "application/reactflow",
                    JSON.stringify({
                      type: "awsIcon",
                      category: fullCategory,
                      name,
                      svg: encodeURIComponent(svg),
                    })
                  );
                  event.dataTransfer.effectAllowed = "move";
                }}
              >
                <div className="w-12 h-12 mb-1">
                  <div
                    dangerouslySetInnerHTML={{ __html: svg }}
                    className="w-full h-full"
                  />
                </div>
                <span
                  className="text-xs text-center leading-tight truncate w-full"
                  title={name}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>
          {nestedCategories.map(([subCategory, subIcons]) => (
            <NestedCategory
              key={subCategory}
              category={subCategory}
              icons={subIcons}
              depth={depth + 1}
              searchTerm={searchTerm}
              onIconSelect={onIconSelect}
              parentCategory={fullCategory}
            />
          ))}
        </>
      )}
    </div>
  );
});

NestedCategory.propTypes = {
  category: PropTypes.string.isRequired,
  icons: PropTypes.object.isRequired,
  depth: PropTypes.number.isRequired,
  searchTerm: PropTypes.string.isRequired,
  onIconSelect: PropTypes.func.isRequired,
  parentCategory: PropTypes.string,
};

const ShapePanel = () => {
  const shapesExpanded = useStore((state) => state.shapesExpanded);
  const searchTerm = useStore((state) => state.searchTerm);
  const setSearchTerm = useStore((state) => state.setSearchTerm);
  const setSelectedIcon = useStore((state) => state.setSelectedIcon);

  const categoryStructure = useMemo(
    () => createCategoryStructure(awsIcons),
    []
  );

  const onIconSelect = useCallback(
    (iconData) => {
      setSelectedIcon(iconData);
    },
    [setSelectedIcon]
  );

  if (!shapesExpanded) return null;

  return (
    <Panel
      position="top-left"
      style={{ top: "8vh", width: 300, height: "80vh" }}
      className="bg-background border rounded-md shadow-md overflow-hidden flex flex-col"
    >
      <div className="p-4 border-b">
        <Input
          type="text"
          placeholder="Search icons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
          icon={<Search className="h-4 w-4" />}
        />
      </div>
      <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
        {Object.entries(categoryStructure).map(([category, icons]) => (
          <NestedCategory
            key={category}
            category={category}
            icons={icons}
            depth={0}
            searchTerm={searchTerm}
            onIconSelect={onIconSelect}
          />
        ))}
      </div>
    </Panel>
  );
};

export default ShapePanel;
