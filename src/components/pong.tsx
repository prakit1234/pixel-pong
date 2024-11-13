import { useEffect, useRef, useState } from 'react';

const Pong: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isGameReady, setIsGameReady] = useState(false);

    const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
        });
    };

    const loadSound = (src: string): HTMLAudioElement => {
        const sound = new Audio(src);
        return sound;
    };

    useEffect(() => {
        let animationFrameId: number;

        const setupGame = async () => {
            const paddleImage = await loadImage('/images/paddle.png');
            const backgroundImage = await loadImage('/images/background.jpg');
            const hitSound = loadSound('/sounds/hit.mp3');
            const scoreSound = loadSound('/sounds/score.mp3');

            setIsGameReady(true);

            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const canvasWidth = 800;
            const canvasHeight = 400;
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            let ballX = canvasWidth / 2;
            let ballY = canvasHeight / 2;
            const ballSize = 8;
            let ballSpeedX = 3;
            let ballSpeedY = 3;
            const paddleWidth = 10;
            const paddleHeight = 80;
            let leftPaddleY = canvasHeight / 2 - paddleHeight / 2;
            let rightPaddleY = canvasHeight / 2 - paddleHeight / 2;

            const drawNet = () => {
                ctx.fillStyle = 'white';
                for (let i = 0; i < canvasHeight; i += 20) {
                    ctx.fillRect(canvasWidth / 2 - 1, i, 2, 10);
                }
            };

            const drawGame = () => {
                if (backgroundImage) {
                    ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
                }
                drawNet();

                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();

                if (paddleImage) {
                    ctx.drawImage(paddleImage, 20, leftPaddleY, paddleWidth, paddleHeight);
                    ctx.drawImage(paddleImage, canvasWidth - 20 - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);
                }
            };

            const updateGame = () => {
                ballX += ballSpeedX;
                ballY += ballSpeedY;

                if (ballY + ballSize > canvasHeight || ballY - ballSize < 0) {
                    ballSpeedY = -ballSpeedY;
                }

                if (
                    (ballX - ballSize < 20 + paddleWidth &&
                        ballY > leftPaddleY &&
                        ballY < leftPaddleY + paddleHeight) ||
                    (ballX + ballSize > canvasWidth - 20 - paddleWidth &&
                        ballY > rightPaddleY &&
                        ballY < rightPaddleY + paddleHeight)
                ) {
                    ballSpeedX = -ballSpeedX;
                    hitSound.currentTime = 0;
                    hitSound.play();
                }

                if (ballX + ballSize < 0 || ballX - ballSize > canvasWidth) {
                    ballX = canvasWidth / 2;
                    ballY = canvasHeight / 2;
                    ballSpeedX = 3 * (Math.random() > 0.5 ? 1 : -1);
                    ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
                    scoreSound.currentTime = 0;
                    scoreSound.play();
                }

                const aiSpeed = 2.5;
                rightPaddleY += rightPaddleY + paddleHeight / 2 < ballY ? aiSpeed : -aiSpeed;
            };

            const gameLoop = () => {
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                drawGame();
                updateGame();
                animationFrameId = requestAnimationFrame(gameLoop);
            };

            canvas.addEventListener('mousemove', (event) => {
                const rect = canvas.getBoundingClientRect();
                leftPaddleY = event.clientY - rect.top - paddleHeight / 2;
                leftPaddleY = Math.max(0, Math.min(leftPaddleY, canvasHeight - paddleHeight));
            });

            gameLoop();

            return () => {
                cancelAnimationFrame(animationFrameId);
            };
        };

        setupGame();

        return () => cancelAnimationFrame(animationFrameId);
    }, [isGameReady]);

    return (
        <canvas
            ref={canvasRef}
            className="border border-white"
            style={{ display: 'block', margin: '0 auto' }}
        />
    );
};

export default Pong;
