import { useRef } from "react";
import Canvas from "@/components/Canvas";
import { ReactFlowProvider } from "@xyflow/react";

const Home = () => {
  const canvasRef = useRef(null);

  return (
    <ReactFlowProvider>
      <div className="w-screen h-screen">
        <Canvas canvasRef={canvasRef} />
      </div>
    </ReactFlowProvider>
  );
};

export default Home;
