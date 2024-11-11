import { useEffect, useRef, useState } from 'react';

const Pong: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [paddleImage, setPaddleImage] = useState<HTMLImageElement | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
    const [hitSound, setHitSound] = useState<HTMLAudioElement | null>(null);
    const [scoreSound, setScoreSound] = useState<HTMLAudioElement | null>(null);
    const [isGameReady, setIsGameReady] = useState(false);

    useEffect(() => {
        // Load images
        const paddleImg = new Image();
        paddleImg.src = '/images/paddle.png';
        paddleImg.onload = () => setPaddleImage(paddleImg);

        const bgImg = new Image();
        bgImg.src = '/images/background.jpg';
        bgImg.onload = () => setBackgroundImage(bgImg);

        // Load sounds
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
        if (!canvasRef.current || !isGameReady) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 800;
        canvas.height = 400;

        // Game variables
        let ballX = canvas.width / 2;
        let ballY = canvas.height / 2;
        const ballSize = 10;
        let ballSpeedX = 3;
        let ballSpeedY = 3;
        const paddleWidth = 10;
        const paddleHeight = 100;
        let leftPaddleY = canvas.height / 2 - paddleHeight / 2;
        let rightPaddleY = canvas.height / 2 - paddleHeight / 2;

        // Draw net in the middle
        const drawNet = () => {
            ctx.fillStyle = 'white';
            const netWidth = 4;
            const netHeight = 20;
            for (let i = 0; i < canvas.height; i += 30) {
                ctx.fillRect(canvas.width / 2 - netWidth / 2, i, netWidth, netHeight);
            }
        };

        const draw = () => {
            if (!ctx) return;

            // Draw background
            if (backgroundImage) {
                ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
            }

            // Draw net
            drawNet();

            // Draw ball
            ctx.beginPath();
            ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.closePath();

            // Draw paddles
            if (paddleImage) {
                ctx.drawImage(paddleImage, 20, leftPaddleY, paddleWidth, paddleHeight);
                ctx.drawImage(paddleImage, canvas.width - 20 - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);
            }
        };

        const update = () => {
            ballX += ballSpeedX;
            ballY += ballSpeedY;

            // Ball collision with top and bottom walls
            if (ballY + ballSize > canvas.height || ballY - ballSize < 0) {
                ballSpeedY = -ballSpeedY;
            }

            // Ball collision with left paddle
            if (ballX - ballSize < 30 && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) {
                ballSpeedX = -ballSpeedX;
                if (hitSound) hitSound.play();
            }

            // Ball collision with right paddle (AI)
            if (ballX + ballSize > canvas.width - 30 - paddleWidth && ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight) {
                ballSpeedX = -ballSpeedX;
                if (hitSound) hitSound.play();
            }

            // Ball out of bounds
            if (ballX - ballSize < 0 || ballX + ballSize > canvas.width) {
                if (scoreSound) scoreSound.play();
                ballX = canvas.width / 2;
                ballY = canvas.height / 2;
                ballSpeedX = -ballSpeedX;
            }

            // AI paddle movement (hard difficulty)
            if (rightPaddleY + paddleHeight / 2 < ballY) {
                rightPaddleY += 3;
            } else {
                rightPaddleY -= 3;
            }
        };

        const gameLoop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            draw();
            update();
            requestAnimationFrame(gameLoop);
        };

        gameLoop();
    }, [isGameReady, paddleImage, backgroundImage, hitSound, scoreSound]);

    // Player paddle movement with mouse
    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseY = event.clientY - rect.top;
        leftPaddleY = mouseY - paddleHeight / 2;
    };

    return (
        <canvas
            ref={canvasRef}
            className="border border-white"
            style={{ display: 'block', margin: '0 auto' }}
            onMouseMove={handleMouseMove}
        />
    );
};

export default Pong;
