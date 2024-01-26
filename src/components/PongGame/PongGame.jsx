import React, { useRef, useEffect, useCallback, useState } from "react";
import styles from "./PongGame.module.css";

const COMPUTER_PADDLE_SPEED = 3;
const COMPUTER_PADDLE_SPEED_STEP = 0.2;
const BORDER_WIDTH = 5;
const LATERAL_WALL_COLOR = "red";
const TOP_BOTTOM_WALL_COLOR = "blue";
const BALL_SPEED = 5;
const BALL_SPEED_STEP = 0.1;

const PongGame = () => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [computerPaddleSpeed, setComputerPaddleSpeed] = useState(
    COMPUTER_PADDLE_SPEED
  );
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const ballRef = useRef({
    x: 400,
    y: 300,
    dx: BALL_SPEED,
    dy: BALL_SPEED,
    radius: 10,
  });
  const playerPaddleRef = useRef({ x: 10, y: 250, width: 10, height: 100 });
  const computerPaddleRef = useRef({ x: 780, y: 250, width: 10, height: 100 });
  // Asumiendo que tienes estados similares para playerPaddleRef y computerPaddleRef

  const handlePlayerMovement = (direction) => {
    const moveAmount = 20; // Cuánto quieres que se mueva la paleta por cada evento

    // Actualizar la posición de la paleta del jugador basada en la dirección
    const playerPaddle = playerPaddleRef.current;
    if (direction === -1) {
      // Mover hacia arriba
      playerPaddle.y = Math.max(playerPaddle.y - moveAmount, BORDER_WIDTH);
    } else if (direction === 1) {
      // Mover hacia abajo
      playerPaddle.y = Math.min(
        playerPaddle.y + moveAmount,
        canvasRef.current.height - playerPaddle.height - BORDER_WIDTH
      );
    } // direction 0 podría detener el movimiento si implementas una lógica de movimiento continuo
  };

  const handleTouchStart = (direction, event) => {
    event.preventDefault(); // Evita acciones por defecto como el zoom
    handlePlayerMovement(direction);
  };

  const draw = useCallback(
    (ctx) => {
      // Limpia el canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.fillStyle = LATERAL_WALL_COLOR;
      ctx.fillRect(0, 0, BORDER_WIDTH, ctx.canvas.height);
      ctx.fillRect(
        ctx.canvas.width - BORDER_WIDTH,
        0,
        BORDER_WIDTH,
        ctx.canvas.height
      );

      ctx.fillStyle = TOP_BOTTOM_WALL_COLOR;
      ctx.fillRect(0, 0, ctx.canvas.width, BORDER_WIDTH);
      ctx.fillRect(
        0,
        ctx.canvas.height - BORDER_WIDTH,
        ctx.canvas.width,
        BORDER_WIDTH
      );

      // Dibuja la pelota
      ctx.fillStyle = "black";
      const ball = ballRef.current;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, true);
      ctx.fill();

      // Dibuja la paleta del jugador
      const playerPaddle = playerPaddleRef.current;
      ctx.fillRect(
        playerPaddle.x,
        playerPaddle.y,
        playerPaddle.width,
        playerPaddle.height
      );

      // Dibuja la paleta de la computadora
      const computerPaddle = computerPaddleRef.current;
      ctx.fillRect(
        computerPaddle.x,
        computerPaddle.y,
        computerPaddle.width,
        computerPaddle.height
      );

      // Dibuja el puntaje
      ctx.font = "30px Arial";
      ctx.fillText(`Jugador: ${playerScore}`, 50, 50);
      ctx.fillText(
        `Computadora: ${computerScore}`,
        canvasRef.current.width - 250,
        50
      );
    },
    [playerScore, computerScore]
  );

  const updatePositions = useCallback(() => {
    // Lógica para actualizar posiciones y manejar colisiones
    const ball = ballRef.current;
    const playerPaddle = playerPaddleRef.current;
    const computerPaddle = computerPaddleRef.current;
    // Ejemplo: Actualizar posición de la pelota
    ball.x += ball.dx;
    ball.y += ball.dy;
    // Añade aquí la lógica de colisión

    // Lógica de movimiento de la paleta de la computadora
    const paddleMidpoint = computerPaddle.y + computerPaddle.height / 2;
    if (paddleMidpoint < ball.y) {
      // Mueve la paleta hacia abajo si la pelota está por debajo del punto medio de la paleta
      computerPaddle.y = Math.min(
        computerPaddle.y + computerPaddleSpeed,
        canvasRef.current.height - computerPaddle.height - BORDER_WIDTH
      );
    } else if (paddleMidpoint > ball.y) {
      // Mueve la paleta hacia arriba si la pelota está por encima del punto medio de la paleta
      computerPaddle.y = Math.max(
        computerPaddle.y - computerPaddleSpeed,
        BORDER_WIDTH
      );
    }

    if (ball.x - ball.radius <= BORDER_WIDTH) {
      setComputerScore((prevScore) => prevScore + 1);
      console.log("Computer scored!", computerScore);
      ball.x = canvasRef.current.width / 2;
      ball.y = canvasRef.current.height / 2;
      ball.dx = BALL_SPEED;
      ball.dy = BALL_SPEED;
    } else if (ball.x + ball.radius >= canvasRef.current.width - BORDER_WIDTH) {
      setPlayerScore((prevScore) => prevScore + 1);
      console.log("Player scored!", playerScore);
      ball.dx = BALL_SPEED;
      ball.dy = BALL_SPEED;
      setComputerPaddleSpeed(
        (prevSpeed) => prevSpeed + COMPUTER_PADDLE_SPEED_STEP
      );
      console.log(computerPaddleSpeed);
      ball.x = canvasRef.current.width / 2;
      ball.y = canvasRef.current.height / 2;
    }

    if (
      ball.y + ball.radius >= canvasRef.current.height - BORDER_WIDTH ||
      ball.y - ball.radius <= BORDER_WIDTH
    ) {
      ball.dy *= -1; // Invierte la dirección en Y
    }

    // Colisión con la paleta del jugador
    if (
      ball.x - ball.radius <= playerPaddle.x + playerPaddle.width &&
      ball.y >= playerPaddle.y &&
      ball.y <= playerPaddle.y + playerPaddle.height
    ) {
      ball.dx = -ball.dx; // Invierte la dirección en X
      ball.dx *= 1 + BALL_SPEED_STEP; // Aumenta la velocidad de la pelota
      ball.dy *= 1 + BALL_SPEED_STEP; // Aumenta la velocidad de la pelota
    }

    // Colisión con la paleta de la computadora
    if (
      ball.x + ball.radius >= computerPaddle.x &&
      ball.y >= computerPaddle.y &&
      ball.y <= computerPaddle.y + computerPaddle.height
    ) {
      ball.dx = -ball.dx; // Invierte la dirección en X
    }

    // Asegúrate de incluir la lógica para limitar las posiciones dentro del canvas,
    // y para hacer que la pelota rebote en las paletas y bordes.
  }, [playerScore, computerScore, computerPaddleSpeed]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updatePositions(); // Asegúrate de que `updatePositions` esté envuelto en useCallback si depende de props o state
        draw(ctx); // Asegúrate de que `draw` también esté envuelto en useCallback si depende de props o state
        requestRef.current = requestAnimationFrame(animate);
      }
    }
  }, [draw, updatePositions]);

  useEffect(() => {
    if (isGameStarted) {
      requestRef.current = requestAnimationFrame(animate);
      // Función de limpieza para cancelar la animación si el componente se desmonta
      return () => cancelAnimationFrame(requestRef.current);
    }
  }, [animate, isGameStarted]); // Dependencias vacías aseguran que esto solo se ejecute al montar y desmontar

  useEffect(() => {
    const handleKeyDown = (event) => {
      const playerPaddle = playerPaddleRef.current;
      switch (event.key) {
        case "ArrowUp":
          playerPaddle.y = Math.max(playerPaddle.y - 30, BORDER_WIDTH);
          break;
        case "ArrowDown":
          playerPaddle.y = Math.min(
            playerPaddle.y + 30,
            canvasRef.current.height - playerPaddle.height - BORDER_WIDTH
          );
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Limpiar el eventListener al desmontar el componente
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Nota: no hay dependencias ya que la referencia no cambia.

  return (
    <div className={styles.gameContainer}>
      {" "}
      {/* Usa flexbox para centrar el botón */}
      {!isGameStarted && (
        <button
          onClick={() => setIsGameStarted(true)}
          className={styles.startButton}
        >
          Iniciar Juego
        </button>
      )}
      {isGameStarted && <canvas ref={canvasRef} width="800" height="600" />}
      {isGameStarted && (
        <div className={styles.controlButtons}>
          <button
            onTouchStart={(e) => handleTouchStart(-1, e)}
            onTouchEnd={(e) => handleTouchStart(0, e)}
            onMouseDown={() => handlePlayerMovement(-1)}
            onMouseUp={() => handlePlayerMovement(0)}
            className={styles.controlButton}
          >
            ↑
          </button>
          <button
            onTouchStart={(e) => handleTouchStart(1, e)}
            onTouchEnd={(e) => handleTouchStart(0, e)}
            onMouseDown={() => handlePlayerMovement(1)}
            onMouseUp={() => handlePlayerMovement(0)}
            className={styles.controlButton}
          >
            ↓
          </button>
        </div>
      )}
    </div>
  );
};

export default PongGame;
