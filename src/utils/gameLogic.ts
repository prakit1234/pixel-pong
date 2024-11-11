// src/utils/gameLogic.ts

export const initializeBall = () => ({
    x: 400, // Starting at the center of the canvas
    y: 200,
    speedX: 3 * (Math.random() > 0.5 ? 1 : -1), // Random initial direction
    speedY: 3 * (Math.random() > 0.5 ? 1 : -1)
});

export const updateBotPaddle = (
    ballY: number,
    botPaddleY: number,
    canvasHeight: number,
    paddleHeight: number,
    botSpeed: number
) => {
    if (ballY < botPaddleY + paddleHeight / 2) {
        botPaddleY -= botSpeed;
    } else if (ballY > botPaddleY + paddleHeight / 2) {
        botPaddleY += botSpeed;
    }
    return Math.min(Math.max(botPaddleY, 0), canvasHeight - paddleHeight);
};

export const updateBallPosition = (
    ball: { x: number; y: number; speedX: number; speedY: number },
    canvasWidth: number,
    canvasHeight: number,
    paddleWidth: number,
    paddleHeight: number,
    playerPaddleY: number,
    botPaddleY: number,
    onHit: () => void,
    onScore: () => void
) => {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    if (ball.y <= 0 || ball.y >= canvasHeight) ball.speedY = -ball.speedY;

    // Check collision with player paddle
    if (
        ball.x - 10 < paddleWidth &&
        ball.y > playerPaddleY &&
        ball.y < playerPaddleY + paddleHeight
    ) {
        ball.speedX = -ball.speedX;
        onHit();
    }

    // Check collision with bot paddle
    if (
        ball.x + 10 > canvasWidth - paddleWidth &&
        ball.y > botPaddleY &&
        ball.y < botPaddleY + paddleHeight
    ) {
        ball.speedX = -ball.speedX;
        onHit();
    }

    // Check scoring
    if (ball.x < 0 || ball.x > canvasWidth) {
        const newBall = initializeBall();
        onScore();
        return newBall; // Reset ball to center after scoring
    }

    return ball;
};
