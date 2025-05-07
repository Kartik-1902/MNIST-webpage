import React, { useRef, useState, useEffect } from 'react';
import '/src/global.css'
const DrawingCanvas = ({ width = 280, height = 280, onClear }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  

  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    canvasRef.current.getContext('2d').beginPath();
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0].clientY) - rect.top;

    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'white';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    setPredictions(null);
    if (onClear) onClear();
  };

  const preprocessAndSend = async () => {
    const canvas = canvasRef.current;
  
    // Create a temporary canvas and resize to 28x28
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 28;
    tempCanvas.height = 28;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0, 28, 28);
  
    // Convert to image blob (PNG)
    tempCanvas.toBlob(async (blob) => {
      console.log('Blob size:', blob.size);  // Check if the blob has the right size
    
      if (!blob || blob.size === 0) {
        console.error("Blob is empty or invalid.");
        return;
      }
    
      const formData = new FormData();
      formData.append('file', blob, 'digit.png');
    
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/predict_image`, {
          method: 'POST',
          body: formData,  // Do not set Content-Type manually
        });
    
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Prediction failed:', response.status, errorData);
          return;
        }
    
        const result = await response.json();
        setPredictions({
          cnn: result.CNN.prediction,
          resnet: result.ResNet.prediction,
        });
      } catch (error) {
        console.error('Prediction error:', error);
      }
    }, 'image/png');
    
  };
   

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#0B192C] to-[#1E3E62] text-white flex flex-col items-center justify-center p-6">
  <div className="w-full max-w-4xl bg-[#0f1a2c] rounded-2xl shadow-xl p-8 border border-[#1c2f4a]">
    <h1 className="text-4xl font-bold text-center mb-8 tracking-wide text-glow">
      Draw a Digit
    </h1>

    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-[#3a4d6a] rounded-xl shadow-md bg-black touch-none w-[280px] h-[280px]"
        onMouseDown={startDrawing}
        onMouseUp={endDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={endDrawing}
        onTouchMove={draw}
      />

      <div className="space-y-6 text-sm text-gray-300 w-full max-w-sm">
        {predictions && (
          <>
            <div className="bg-[#162636] p-4 rounded-lg shadow-inner border border-[#22384d]">
              <p className="mb-1">
                <span className="text-white font-medium">CNN Prediction:</span> {predictions.cnn.class}
              </p>
              <p className="text-gray-400">
                Confidence: {(predictions.cnn.confidence * 100).toFixed(2)}%
              </p>
            </div>
            <div className="bg-[#162636] p-4 rounded-lg shadow-inner border border-[#22384d]">
              <p className="mb-1">
                <span className="text-white font-medium">ResNet Prediction:</span> {predictions.resnet.class}
              </p>
              <p className="text-gray-400">
                Confidence: {(predictions.resnet.confidence * 100).toFixed(2)}%
              </p>
            </div>
          </>
        )}
      </div>
    </div>

    <div className="mt-10 flex justify-center gap-6">
      <button
        onClick={clearCanvas}
        className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
      >
        Clear
      </button>
      <button
        onClick={preprocessAndSend}
        className="px-6 py-2 rounded-lg bg-[#FF6500] hover:bg-[#E65A00] transition-all duration-300 shadow-md hover:shadow-lg"
      >
        Predict
      </button>
    </div>
  </div>
</div>

  );
  
};

export default DrawingCanvas;
