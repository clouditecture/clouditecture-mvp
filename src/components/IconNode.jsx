import { useCallback, memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import PropTypes from "prop-types";
import useStore from "../store/useStore";

const IconNode = ({ id, data, selected }) => {
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);
  const [isEditing, setIsEditing] = useState(false);
  const [labelText, setLabelText] = useState(data.name);

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

  return (
    <div
      className={`relative group max-w-fit ${selected ? "ring-1 ring-blue-500" : ""}`}
    >
      <Handle
        type="source"
        id="top-source"
        position={Position.Top}
        className="w-2 h-2 !bg-gray-800 border border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
      <Handle
        type="target"
        id="top-target"
        position={Position.Top}
        className="w-2 h-2 !bg-gray-800 border border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      <Handle
        type="source"
        id="right-source"
        position={Position.Right}
        className="w-2 h-2 !bg-gray-800 border border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity right-0 top-1/2 translate-x-1/2 -translate-y-1/2"
      />
      <Handle
        type="target"
        id="right-target"
        position={Position.Right}
        className="w-2 h-2 !bg-gray-800 border border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity right-0 top-1/2 translate-x-1/2 -translate-y-1/2"
      />

      <Handle
        type="source"
        id="bottom-source"
        position={Position.Bottom}
        className="w-2 h-2 !bg-gray-800 border border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
      />
      <Handle
        type="target"
        id="bottom-target"
        position={Position.Bottom}
        className="w-2 h-2 !bg-gray-800 border border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
      />

      <Handle
        type="source"
        id="left-source"
        position={Position.Left}
        className="w-2 h-2 !bg-gray-800 border border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
      />
      <Handle
        type="target"
        id="left-target"
        position={Position.Left}
        className="w-2 h-2 !bg-gray-800 border border-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      <div className="flex items-center justify-center w-full h-full">
        <div
          dangerouslySetInnerHTML={{ __html: decodeURIComponent(data.svg) }}
          className="w-full h-full"
        />
      </div>

      <div className="absolute left-0 right-0 mt-2 text-center w-full">
        {isEditing ? (
          <input
            type="text"
            value={labelText}
            onChange={onLabelChange}
            onBlur={stopEditing}
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
  );
};

IconNode.propTypes = {
  id: PropTypes.string,
  data: PropTypes.shape({
    category: PropTypes.string,
    name: PropTypes.string,
    svg: PropTypes.string,
  }),
  selected: PropTypes.bool,
};

export default memo(IconNode);
