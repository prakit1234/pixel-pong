import { useEffect, useRef, useState } from 'react';

const Pong: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Refs to store mutable variables without causing re-renders
    const animationFrameId = useRef<number | null>(null);
    const leftPaddleY = useRef<number>(200); // Initial Y position for left paddle
    const rightPaddleY = useRef<number>(200); // Initial Y position for right paddle

    // State to track if all assets are loaded
    const [isGameReady, setIsGameReady] = useState(false);

    // State to store loaded assets
    const [paddleImage, setPaddleImage] = useState<HTMLImageElement | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
    const [hitSound, setHitSound] = useState<HTMLAudioElement | null>(null);
    const [scoreSound, setScoreSound] = useState<HTMLAudioElement | null>(null);

    // Load images and sounds on component mount
    useEffect(() => {
        const loadImages = () => {
            const paddleImg = new Image();
            paddleImg.src = '/images/paddle.png';
            paddleImg.onload = () => setPaddleImage(paddleImg);
            paddleImg.onerror = () => {
                console.error('Failed to load paddle image.');
            };

            const bgImg = new Image();
            bgImg.src = '/images/background.jpg';
            bgImg.onload = () => setBackgroundImage(bgImg);
            bgImg.onerror = () => {
                console.error('Failed to load background image.');
            };
        };

        const loadSounds = () => {
            const hitSoundInstance = new Audio('/sounds/hit.mp3');
            hitSoundInstance.onloadeddata = () => setHitSound(hitSoundInstance);
            hitSoundInstance.onerror = () => {
                console.error('Failed to load hit sound.');
            };

            const scoreSoundInstance = new Audio('/sounds/score.mp3');
            scoreSoundInstance.onloadeddata = () => setScoreSound(scoreSoundInstance);
            scoreSoundInstance.onerror = () => {
                console.error('Failed to load score sound.');
            };
        };

        loadImages();
        loadSounds();
    }, []);

    // Once all assets are loaded, set the game as ready
    useEffect(() => {
        if (paddleImage && backgroundImage && hitSound && scoreSound) {
            setIsGameReady(true);
        }
    }, [paddleImage, backgroundImage, hitSound, scoreSound]);

    // Main game loop effect
    useEffect(() => {
        if (!isGameReady) return;

        const canvas = canvasRef.current;
        if (!canvas) {
            console.error('Canvas not found.');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('2D context not available.');
            return;
        }

        // Set canvas dimensions
        const canvasWidth = 800;
        const canvasHeight = 400;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Ball properties
        let ballX = canvasWidth / 2;
        let ballY = canvasHeight / 2;
        const ballSize = 8;
        let ballSpeedX = 3;
        let ballSpeedY = 3;

        // Paddle properties
        const paddleWidth = 10;
        const paddleHeight = 80;

        // Function to draw the net
        const drawNet = () => {
            ctx.fillStyle = 'white';
            for (let i = 0; i < canvasHeight; i += 20) {
                ctx.fillRect(canvasWidth / 2 - 1, i, 2, 10);
            }
        };

        // Function to draw the game elements
        const drawGame = () => {
            if (backgroundImage) {
                ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
            }
            drawNet();

            // Draw the ball
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

            // Draw the paddles
            if (paddleImage) {
                ctx.drawImage(paddleImage, 20, leftPaddleY.current, paddleWidth, paddleHeight);
                ctx.drawImage(
                    paddleImage,
                    canvasWidth - 20 - paddleWidth,
                    rightPaddleY.current,
                    paddleWidth,
                    paddleHeight
                );
            }
        };

        // Function to update the game state
        const updateGame = () => {
            ballX += ballSpeedX;
            ballY += ballSpeedY;

            // Ball collision with top and bottom walls
            if (ballY + ballSize > canvasHeight || ballY - ballSize < 0) {
                ballSpeedY = -ballSpeedY;
            }

            // Ball collision with paddles
            const leftPaddleCollision =
                ballX - ballSize < 20 + paddleWidth &&
                ballY > leftPaddleY.current &&
                ballY < leftPaddleY.current + paddleHeight;

            const rightPaddleCollision =
                ballX + ballSize > canvasWidth - 20 - paddleWidth &&
                ballY > rightPaddleY.current &&
                ballY < rightPaddleY.current + paddleHeight;

            if (leftPaddleCollision || rightPaddleCollision) {
                ballSpeedX = -ballSpeedX;
                if (hitSound) {
                    hitSound.currentTime = 0;
                    hitSound.play();
                }
            }

            // Ball goes out of bounds (score)
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

            // Simple AI for right paddle
            const aiSpeed = 2.5;
            if (rightPaddleY.current + paddleHeight / 2 < ballY) {
                rightPaddleY.current += aiSpeed;
            } else {
                rightPaddleY.current -= aiSpeed;
            }

            // Ensure AI paddle stays within bounds
            rightPaddleY.current = Math.max(0, Math.min(rightPaddleY.current, canvasHeight - paddleHeight));
        };

        // The main game loop
        const gameLoop = () => {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            drawGame();
            updateGame();
            animationFrameId.current = requestAnimationFrame(gameLoop);
        };

        // Event handler for mouse movement to control the left paddle
        const handleMouseMove = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            leftPaddleY.current = event.clientY - rect.top - paddleHeight / 2;
            // Ensure the paddle stays within the canvas
            leftPaddleY.current = Math.max(0, Math.min(leftPaddleY.current, canvasHeight - paddleHeight));
        };

        // Add the mousemove event listener
        canvas.addEventListener('mousemove', handleMouseMove);

        // Start the game loop
        gameLoop();

        // Cleanup function to remove event listeners and cancel animation frame
        return () => {
            if (animationFrameId.current !== null) {
                cancelAnimationFrame(animationFrameId.current);
            }
            canvas.removeEventListener('mousemove', handleMouseMove);
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
