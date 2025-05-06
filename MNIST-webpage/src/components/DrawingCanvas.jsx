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
    setPrediction(null);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Draw a Digit</h1>
      
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border-2 border-gray-500 rounded-lg shadow-md bg-black touch-none"
        onMouseDown={startDrawing}
        onMouseUp={endDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={endDrawing}
        onTouchMove={draw}
      />
  
      <div className="mt-6 flex space-x-4">
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow"
        >
          Clear
        </button>
        <button
          onClick={preprocessAndSend}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow"
        >
          Predict
        </button>
      </div>
  
      {predictions && (
        <div className="mt-4 text-center space-y-2">
          <p className="text-lg text-gray-700">
            <span className="font-semibold">CNN Prediction:</span> {predictions.cnn.class} <br />
            <span className="text-sm text-gray-600">Confidence: {(predictions.cnn.confidence * 100).toFixed(2)}%</span>
          </p>
          <p className="text-lg text-gray-700">
            <span className="font-semibold">ResNet Prediction:</span> {predictions.resnet.class} <br />
            <span className="text-sm text-gray-600">Confidence: {(predictions.resnet.confidence * 100).toFixed(2)}%</span>
          </p>
        </div>
      )}
    </div>
  );
  
};

export default DrawingCanvas;
