import React, { useRef, useState, useEffect } from 'react';
import '/src/global.css'
const DrawingCanvas = ({ width = 280, height = 280, onClear }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [slowStart, setSlowStart] = useState(false);
  
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
  
    setIsPredicting(true);
    setSlowStart(false);
  
    // Detect cold start if it takes longer than 4 seconds
    const slowTimer = setTimeout(() => setSlowStart(true), 4000);
  
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 28;
    tempCanvas.height = 28;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0, 28, 28);
  
    tempCanvas.toBlob(async (blob) => {
      if (!blob || blob.size === 0) {
        console.error("Blob is empty or invalid.");
        clearTimeout(slowTimer);
        setIsPredicting(false);
        return;
      }
  
      const formData = new FormData();
      formData.append('file', blob, 'digit.png');
  
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/predict_image`, {
          method: 'POST',
          body: formData,
        });
  
        clearTimeout(slowTimer);
  
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
      } finally {
        setIsPredicting(false);
        setSlowStart(false);
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
        <div className="w-full max-w-md mt-10 animate-fade-in-up">
          <div className="bg-[#131e2e] border border-[#FF6500] rounded-xl p-6 shadow-xl text-center">
            <h2 className="text-2xl font-semibold text-white mb-4 tracking-wide">
              Predictions
            </h2>
            <div className="text-lg text-orange-400 font-bold mb-2">
              CNN: {predictions.cnn.class}
              <div className="mt-2">
                <div className="relative h-4 w-full bg-[#1e2b40] rounded-full overflow-hidden">
                  <div
                      className="absolute top-0 left-0 h-full bg-orange-400 shadow-[0_0_8px_#FF6500] transition-all duration-500"
                      style={{ width: `${(predictions.cnn.confidence * 100).toFixed(0)}%` }}
                  ></div>
                </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {(predictions.cnn.confidence * 100).toFixed(2)}% confidence
                  </p>
              </div>
            </div>
            <div className="text-lg text-orange-400 font-bold">
              ResNet: {predictions.resnet.class}
              <div className="mt-2">
                <div className="relative h-4 w-full bg-[#1e2b40] rounded-full overflow-hidden">
                  <div
                      className="absolute top-0 left-0 h-full bg-orange-400 shadow-[0_0_8px_#FF6500] transition-all duration-500"
                      style={{ width: `${(predictions.resnet.confidence * 100).toFixed(0)}%` }}
                  ></div>
                </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {(predictions.resnet.confidence * 100).toFixed(2)}% confidence
                  </p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>

    {isPredicting && (
      <div className="flex flex-col items-center mt-10">
        {/* Spinner */}
        <div className="w-10 h-10 border-4 border-white/20 border-t-[#FF6500] rounded-full animate-spin mb-4" />
    
        <p className="text-white text-sm animate-pulse">
          {slowStart ? 'Waking up the server, please wait...' : 'Processing prediction...'}
        </p>
      </div>
    )}

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
