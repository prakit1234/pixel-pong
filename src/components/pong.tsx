import React, { useEffect, useRef, useState } from 'react';

const PongGame = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
    const canvasWidth = 800; // Set your canvas width
    const canvasHeight = 600; // Set your canvas height

    // Load background image
    useEffect(() => {
        const img = new Image();
        img.src = '/path/to/your/background.png'; // Specify your image path
        img.onload = () => setBackgroundImage(img);
        img.onerror = () => console.error('Failed to load background image');
    }, []);

    // Draw the game
    const drawGame = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx || !backgroundImage) return; // Ensure context is available and image is loaded

        ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear previous frame

        // Draw the background image if it's loaded
        ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);

        drawNet(ctx);
        ctx.fillStyle = 'white';
        ctx.beginPath();
        // Draw more game elements (player, ball, etc.)
        ctx.fill();
    };

    const drawNet = (ctx: CanvasRenderingContext2D) => {
        const netHeight = 10;
        const netWidth = 5;
        const netSpacing = 20;
        const netLength = canvasHeight;
        const numSections = Math.floor(canvasHeight / (netHeight + netSpacing));

        ctx.fillStyle = 'white';
        for (let i = 0; i < numSections; i++) {
            const yPos = i * (netHeight + netSpacing);
            ctx.fillRect(canvasWidth / 2 - netWidth / 2, yPos, netWidth, netHeight);
        }
    };

    // Trigger the game drawing on each animation frame
    useEffect(() => {
        const interval = setInterval(drawGame, 1000 / 60); // 60 FPS
        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [backgroundImage]); // Redraw when the image has been loaded

    return (
        <div>
            <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />
        </div>
    );
};

export default PongGame;
