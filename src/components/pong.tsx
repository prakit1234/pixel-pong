import { useEffect, useRef, useState } from 'react';

const Pong: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [paddleImage, setPaddleImage] = useState<HTMLImageElement | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
    const [hitSound, setHitSound] = useState<HTMLAudioElement | null>(null);
    const [scoreSound, setScoreSound] = useState<HTMLAudioElement | null>(null);
    const [isGameReady, setIsGameReady] = useState(false); // Track if game is ready

    useEffect(() => {
        const loadImages = () => {
            const paddleImg = new Image();
            paddleImg.src = '/images/paddle.png';
            paddleImg.onload = () => setPaddleImage(paddleImg); // Set image after loading

            const bgImg = new Image();
            bgImg.src = '/images/background.png';
            bgImg.onload = () => setBackgroundImage(bgImg); // Set image after loading
        };

        loadImages();
    }, []);

    useEffect(() => {
        // Initialize sounds only on the client side
        const hitSoundInstance = new Audio('/sounds/hit.mp3');
        const scoreSoundInstance = new Audio('/sounds/score.mp3');
        setHitSound(hitSoundInstance);
        setScoreSound(scoreSoundInstance);
    }, []);

    useEffect(() => {
        // Check if all images and sounds are loaded
        if (paddleImage && backgroundImage && hitSound && scoreSound) {
            setIsGameReady(true);
        }
    }, [paddleImage, backgroundImage, hitSound, scoreSound]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !isGameReady) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas dimensions
        canvas.width = 800;
        canvas.height = 400;

        // Game variables
        let ballX = canvas.width / 2;
        let ballY = canvas.height / 2;
        const ballSize = 10;
        let ballSpeed = { x: 2, y: 2 };
        const paddleWidth = paddleImage.width;
        const paddleHeight = paddleImage.height;
        let leftPaddleY = canvas.height / 2 - paddleHeight / 2;
        let rightPaddleY = canvas.height / 2 - paddleHeight / 2;

        const draw = () => {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.closePath();
            ctx.drawImage(paddleImage, 0, leftPaddleY, paddleWidth, paddleHeight);
            ctx.drawImage(paddleImage, canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight);
        };

        const update = () => {
            ballX += ballSpeed.x;
            ballY += ballSpeed.y;

            // Ball collision with top and bottom
            if (ballY + ballSize > canvas.height || ballY - ballSize < 0) {
                ballSpeed.y = -ballSpeed.y;
            }

            // Ball collision with paddles
            if (
                (ballX - ballSize < paddleWidth && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) ||
                (ballX + ballSize > canvas.width - paddleWidth && ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight)
            ) {
                ballSpeed.x = -ballSpeed.x;
                hitSound.currentTime = 0; // Reset sound to start
                hitSound.play(); // Play hit sound
            }

            // Reset ball if it goes out of bounds
            if (ballX + ballSize < 0 || ballX - ballSize > canvas.width) {
                ballX = canvas.width / 2;
                ballY = canvas.height / 2;
                ballSpeed = { x: 2, y: 2 };
                scoreSound.currentTime = 0; // Reset sound to start
                scoreSound.play(); // Play score sound
            }
        };

        const gameLoop = () => {
            draw();
            update();
            requestAnimationFrame(gameLoop);
        };

        gameLoop();

        // Cleanup function to stop the animation when the component unmounts
        return () => {
            cancelAnimationFrame(gameLoop);
        };
    }, [isGameReady, paddleImage, backgroundImage, hitSound, scoreSound]);

    return (
        <canvas
            ref={canvasRef}
            className="border border-white"
            style={{ display: 'block', margin: '0 auto' }} // Center the canvas
        />
    );
};

export default Pong;