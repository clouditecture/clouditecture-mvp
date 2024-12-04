import { useCallback, memo, useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import PropTypes from "prop-types";
import useStore from "../store/useStore";
import { NodeResizer } from "@xyflow/react";
import { makeScalableSvg } from "../utils/svgUtils";
import processedAwsIcons from "@/data/awsIcons";

const IconNode = ({ id, data, selected }) => {
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);
  const updateNodeDimensions = useStore((state) => state.updateNodeDimensions);
  const [isEditing, setIsEditing] = useState(false);
  const [labelText, setLabelText] = useState(data.name);
  const [svgContent, setSvgContent] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (processedAwsIcons[data.icon]) {
      setSvgContent(
        `<img src="${processedAwsIcons[data.icon]}" alt="${
          data.name
        }" class="w-full h-full object-contain" />`
      );
    } else {
      try {
        const decodedSvg = decodeURIComponent(data.svg);
        const scalableSvg = makeScalableSvg(decodedSvg);
        setSvgContent(scalableSvg);
      } catch (error) {
        console.error("Error processing SVG content:", error);
        setSvgContent(data.svg); // Fallback to original content
      }
    }
  }, [data.icon, data.name, data.svg]);

  const onLabelChange = useCallback((event) => {
    setLabelText(event.target.value);
  }, []);

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
    updateNodeLabel(id, labelText);
  }, [id, labelText, updateNodeLabel]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      stopEditing();
    }
  }, [stopEditing]);

  const onResize = useCallback((evt, { width, height }) => {
    updateNodeDimensions(id, width, height);
  }, [id, updateNodeDimensions]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <>
      <NodeResizer
        color="#ff0071"
        isVisible={selected}
        minWidth={50}
        minHeight={50}
        onResize={onResize}
      />
      <div
        className={`relative group max-w-fit ${
          selected ? "ring-1 ring-blue-500" : ""
        }`}
        style={{
          width: data.width || 100,
          height: data.height || 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Handles */}
        <Handle
          type="source"
          id="source-top"
          position={Position.Top}
          className="w-2 h-2 !bg-gray-800 border border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <Handle
          type="target"
          id="target-top"
          position={Position.Top}
          className="w-2 h-2 !bg-gray-800 border border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <Handle
          type="source"
          id="source-bottom"
          position={Position.Bottom}
          className="w-2 h-2 !bg-gray-800 border border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <Handle
          type="target"
          id="target-bottom"
          position={Position.Bottom}
          className="w-2 h-2 !bg-gray-800 border border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <Handle
          type="source"
          id="source-left"
          position={Position.Left}
          className="w-2 h-2 !bg-gray-800 border border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <Handle
          type="target"
          id="target-left"
          position={Position.Left}
          className="w-2 h-2 !bg-gray-800 border border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <Handle
          type="source"
          id="source-right"
          position={Position.Right}
          className="w-2 h-2 !bg-gray-800 border border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <Handle
          type="target"
          id="target-right"
          position={Position.Right}
          className="w-2 h-2 !bg-gray-800 border border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        />

        {/* SVG Container */}
        <div className="w-full h-full flex items-center justify-center">
          <div
            dangerouslySetInnerHTML={{ __html: svgContent }}
            className="w-full h-full flex items-center justify-center"
          />
        </div>

        {/* Label */}
        <div className="absolute left-0 right-0 mt-[150px] text-center w-full" onClick={startEditing} onDoubleClick={startEditing}>
          {isEditing ? (
            <input
            ref={inputRef}
              type="text"
              value={labelText}
              onChange={onLabelChange}
              onBlur={stopEditing}
              onKeyDown={handleKeyDown}
              className="text-xs border rounded px-1 bg-white w-full text-center"
              autoFocus
            />
          ) : (
            <div
              className="cursor-pointer text-xs max-w-full break-words bg-white bg-opacity-50 px-1 rounded"
              onClick={startEditing}
              title={labelText}
            >
              {labelText}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

IconNode.propTypes = {
  id: PropTypes.string,
  data: PropTypes.shape({
    category: PropTypes.string,
    name: PropTypes.string,
    svg: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
  }).isRequired,
  selected: PropTypes.bool,
};

export default memo(IconNode);

