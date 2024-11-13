import { useEffect, useRef, useState } from 'react';

const Pong: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [paddleImage, setPaddleImage] = useState<HTMLImageElement | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
    const [hitSound, setHitSound] = useState<HTMLAudioElement | null>(null);
    const [scoreSound, setScoreSound] = useState<HTMLAudioElement | null>(null);
    const [isGameReady, setIsGameReady] = useState(false);

    useEffect(() => {
        const loadImages = () => {
            const paddleImg = new Image();
            paddleImg.src = '/images/paddle.png';
            paddleImg.onload = () => setPaddleImage(paddleImg);

            const bgImg = new Image();
            bgImg.src = '/images/background.jpg';
            bgImg.onload = () => setBackgroundImage(bgImg);
        };
        loadImages();
    }, []);

    useEffect(() => {
        const hitSoundInstance = new Audio('/sounds/hit.mp3');
        const scoreSoundInstance = new Audio('/sounds/score.mp3');
        setHitSound(hitSoundInstance);
        setScoreSound(scoreSoundInstance);
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
                ctx.drawImage(backgroundImage as CanvasImageSource, 0, 0, canvasWidth, canvasHeight);
            }
            drawNet();

            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

            if (paddleImage) {
                ctx.drawImage(paddleImage as CanvasImageSource, 20, leftPaddleY, paddleWidth, paddleHeight);
                ctx.drawImage(paddleImage as CanvasImageSource, canvasWidth - 20 - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);
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
                if (hitSound) {
                    hitSound.currentTime = 0;
                    hitSound.play();
                }
            }

            if (ballX + ballSize < 0 || ballX - ballSize > canvasWidth) {
                ballX = canvasWidth / 2;
                ballY = canvasHeight / 2;
                ballSpeedX = 3 * (Math.random() > 0.5 ? 1 : -1);
                ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
                if (scoreSound) {
                    scoreSound.currentTime = 0;
                    scoreSound.play();
                }
            }

            const aiSpeed = 2.5;
            if (rightPaddleY + paddleHeight / 2 < ballY) {
                rightPaddleY += aiSpeed;
            } else {
                rightPaddleY -= aiSpeed;
            }
        };

        let animationFrameId: number;
        
        const gameLoop = () => {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            drawGame();
            updateGame();
            animationFrameId = requestAnimationFrame(gameLoop);
        };

        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            leftPaddleY = event.clientY - rect.top - paddleHeight / 2;
            if (leftPaddleY < 0) leftPaddleY = 0;
            if (leftPaddleY + paddleHeight > canvasHeight) leftPaddleY = canvasHeight - paddleHeight;
        });

        gameLoop();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isGameReady, paddleImage, backgroundImage, hitSound, scoreSound]);

    return (
        <canvas
            ref={canvasRef}
            className="border border-white"
            style={{ display: 'block', margin: '0 auto' }}
        />
    );
};

export default Pong;
