import { useEffect, useRef, useState } from 'react';

const Pong: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [paddleImage, setPaddleImage] = useState<HTMLImageElement | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
    const [hitSound, setHitSound] = useState<HTMLAudioElement | null>(null);
    const [scoreSound, setScoreSound] = useState<HTMLAudioElement | null>(null);
    const [isGameReady, setIsGameReady] = useState(false);

    useEffect(() => {
        const loadAssets = () => {
            const paddleImg = new Image();
            paddleImg.src = '/images/paddle.png';
            paddleImg.onload = () => setPaddleImage(paddleImg);

            const bgImg = new Image();
            bgImg.src = '/images/background.jpg';
            bgImg.onload = () => setBackgroundImage(bgImg);
            
            const hitSoundInstance = new Audio('/sounds/hit.mp3');
            const scoreSoundInstance = new Audio('/sounds/score.mp3');
            setHitSound(hitSoundInstance);
            setScoreSound(scoreSoundInstance);
        };

        loadAssets();
    }, []);

    useEffect(() => {
        if (paddleImage && backgroundImage && hitSound && scoreSound) {
            setIsGameReady(true);
        }
    }, [paddleImage, backgroundImage, hitSound, scoreSound]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !isGameReady) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Canvas dimensions
        const canvasWidth = 800;
        const canvasHeight = 400;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Game variables
        const ballSize = 10;
        let ballX = canvasWidth / 2;
        let ballY = canvasHeight / 2;
        let ballSpeedX = 3;
        let ballSpeedY = 3;
        
        const paddleWidth = 10;
        const paddleHeight = 70;
        let playerY = (canvasHeight - paddleHeight) / 2;
        let botY = (canvasHeight - paddleHeight) / 2;

        // Event listener for mouse movement
        const handleMouseMove = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            playerY = event.clientY - rect.top - paddleHeight / 2;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const drawNet = () => {
            ctx.fillStyle = 'white';
            for (let i = 0; i < canvasHeight; i += 20) {
                ctx.fillRect(canvasWidth / 2 - 1, i, 2, 10);
            }
        };

        const drawGame = () => {
            ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
            drawNet();
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
            ctx.fill();

            // Draw paddles
            ctx.drawImage(paddleImage, 20, playerY, paddleWidth, paddleHeight);
            ctx.drawImage(paddleImage, canvasWidth - 30, botY, paddleWidth, paddleHeight);
        };

        const updateGame = () => {
            ballX += ballSpeedX;
            ballY += ballSpeedY;

            // Ball collision with top and bottom walls
            if (ballY - ballSize < 0 || ballY + ballSize > canvasHeight) {
                ballSpeedY = -ballSpeedY;
                hitSound?.play();
            }

            // Ball collision with paddles
            if (
                (ballX - ballSize < 30 && ballY > playerY && ballY < playerY + paddleHeight) ||
                (ballX + ballSize > canvasWidth - 30 && ballY > botY && ballY < botY + paddleHeight)
            ) {
                ballSpeedX = -ballSpeedX;
                hitSound?.play();
            }

            // Bot paddle AI (hard difficulty)
            if (botY + paddleHeight / 2 < ballY) botY += 3;
            else if (botY + paddleHeight / 2 > ballY) botY -= 3;

            // Reset ball if it goes off screen
            if (ballX - ballSize < 0 || ballX + ballSize > canvasWidth) {
                ballX = canvasWidth / 2;
                ballY = canvasHeight / 2;
                scoreSound?.play();
                ballSpeedX = 3 * (Math.random() > 0.5 ? 1 : -1); // Random direction
                ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
            }
        };

        const gameLoop = () => {
            drawGame();
            updateGame();
            requestAnimationFrame(gameLoop);
        };

        gameLoop();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(gameLoop);
        };
    }, [isGameReady, paddleImage, backgroundImage, hitSound, scoreSound]);

    return (
        <canvas ref={canvasRef} className="border border-white mx-auto" />
    );
};

export default Pong;
