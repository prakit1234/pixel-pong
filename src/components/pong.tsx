import { useEffect, useRef, useState } from 'react';
import { initializeBall, updateBallPosition, updateBotPaddle } from '../utils/gameLogic';

const Pong: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [ball, setBall] = useState(initializeBall());
    const [playerPaddleY, setPlayerPaddleY] = useState(150);
    const [botPaddleY, setBotPaddleY] = useState(150);
    const [isGameReady, setIsGameReady] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas dimensions
        const canvasWidth = 800;
        const canvasHeight = 400;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Paddle dimensions
        const paddleWidth = 20;
        const paddleHeight = 100;
        const botSpeed = 4;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';

            // Draw ball
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

            // Draw paddles
            ctx.fillRect(0, playerPaddleY, paddleWidth, paddleHeight); // Player paddle
            ctx.fillRect(canvasWidth - paddleWidth, botPaddleY, paddleWidth, paddleHeight); // Bot paddle
        };

        const update = () => {
            // Update bot paddle position
            const newBotPaddleY = updateBotPaddle(
                ball.y,
                botPaddleY,
                canvasHeight,
                paddleHeight,
                botSpeed
            );
            setBotPaddleY(newBotPaddleY);

            // Update ball position
            const updatedBall = updateBallPosition(
                ball,
                canvasWidth,
                canvasHeight,
                paddleWidth,
                paddleHeight,
                playerPaddleY,
                botPaddleY,
                () => console.log('Hit!'), // Replace with actual sound effect
                () => console.log('Score!') // Replace with actual sound effect
            );
            setBall(updatedBall);
        };

        const gameLoop = () => {
            draw();
            update();
            requestAnimationFrame(gameLoop);
        };

        gameLoop();
    }, [ball, playerPaddleY, botPaddleY]);

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const mouseY = event.clientY - rect.top;
            setPlayerPaddleY(Math.min(Math.max(mouseY - 50, 0), canvas.height - 100)); // Limit paddle to canvas
        }
    };

    return (
        <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            className="border border-white"
            style={{ display: 'block', margin: '0 auto' }}
        />
    );
};

export default Pong;
