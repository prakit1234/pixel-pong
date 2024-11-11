// src/utils/gameLogic.ts

export const updateBotPaddle = (
    ballY: number,
    botPaddleY: number,
    canvasHeight: number,
    paddleHeight: number,
    botSpeed: number
) => {
    // Hard difficulty: very minimal delay for the bot
    if (ballY < botPaddleY + paddleHeight / 2) {
        botPaddleY -= botSpeed;
    } else if (ballY > botPaddleY + paddleHeight / 2) {
        botPaddleY += botSpeed;
    }

    // Ensure the bot paddle stays within canvas bounds
    return Math.min(Math.max(botPaddleY, 0), canvasHeight - paddleHeight);
};
