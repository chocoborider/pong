import React, { useRef, useEffect, useCallback } from "react";

const COMPUTER_PADDLE_SPEED = 5;
const BORDER_WIDTH = 5;
const LATERAL_WALL_COLOR = "red";
const TOP_BOTTOM_WALL_COLOR = "blue";

const PongGame = () => {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const ballRef = useRef({
    x: 400,
    y: 300,
    dx: 5,
    dy: 5,
    radius: 10,
  });
  const playerPaddleRef = useRef({ x: 10, y: 250, width: 10, height: 100 });
  const computerPaddleRef = useRef({ x: 780, y: 250, width: 10, height: 100 });
  // Asumiendo que tienes estados similares para playerPaddleRef y computerPaddleRef

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
    },
    [
      /* aquí van las dependencias de draw, por ejemplo, si usas estado/props para determinar cómo dibujar algo */
    ]
  );

  const updatePositions = useCallback(
    () => {
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
          computerPaddle.y + COMPUTER_PADDLE_SPEED,
          canvasRef.current.height - computerPaddle.height
        );
      } else if (paddleMidpoint > ball.y) {
        // Mueve la paleta hacia arriba si la pelota está por encima del punto medio de la paleta
        computerPaddle.y = Math.max(
          computerPaddle.y - COMPUTER_PADDLE_SPEED,
          0
        );
      }

      if (
        ball.y + ball.radius >= canvasRef.current.height ||
        ball.y - ball.radius <= 0
      ) {
        ball.dy *= -1; // Invierte la dirección en Y
      }
      if (
        ball.x + ball.radius >= canvasRef.current.width ||
        ball.x - ball.radius <= 0
      ) {
        ball.dx *= -1; // Invierte la dirección en X
      }

      if (
        ball.x - ball.radius <= playerPaddle.x + playerPaddle.width &&
        ball.y >= playerPaddle.y &&
        ball.y <= playerPaddle.y + playerPaddle.height
      ) {
        ball.dx = -ball.dx; // Invierte la dirección en X
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
    },
    [
      /* dependencias: incluye cualquier estado o prop que afecte cómo se actualizan las posiciones */
    ]
  );

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
    // Inicia la animación cuando el componente se monta
    requestRef.current = requestAnimationFrame(animate);

    // Función de limpieza para cancelar la animación si el componente se desmonta
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]); // Dependencias vacías aseguran que esto solo se ejecute al montar y desmontar

  useEffect(() => {
    const handleKeyDown = (event) => {
      const playerPaddle = playerPaddleRef.current;
      switch (event.key) {
        case "ArrowUp":
          playerPaddle.y = Math.max(playerPaddle.y - 30, 0);
          break;
        case "ArrowDown":
          playerPaddle.y = Math.min(
            playerPaddle.y + 30,
            canvasRef.current.height - playerPaddle.height
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

  return <canvas ref={canvasRef} width="800" height="600" />;
};

export default PongGame;
