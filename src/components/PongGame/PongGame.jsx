import React, { useRef, useEffect } from "react";

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

  const draw = (ctx) => {
    // Limpia el canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

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

    // Actualiza las posiciones para la próxima frame
    updatePositions();
  };

  const updatePositions = () => {
    const ball = ballRef.current;
    const playerPaddle = playerPaddleRef.current;
    const computerPaddle = computerPaddleRef.current;
    // Actualiza la posición de la pelota basándote en la velocidad actual
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Agrega aquí la lógica de colisión y rebote

    // Ejemplo de rebote en los bordes del canvas
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
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Limpia el canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibuja los elementos del juego
        draw(ctx);

        // Continúa el loop de animación
        requestRef.current = requestAnimationFrame(animate);
      }
    }
  };

  useEffect(() => {
    // Inicia la animación cuando el componente se monta
    requestRef.current = requestAnimationFrame(animate);

    // Función de limpieza para cancelar la animación si el componente se desmonta
    return () => cancelAnimationFrame(requestRef.current);
  }, []); // Dependencias vacías aseguran que esto solo se ejecute al montar y desmontar

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
