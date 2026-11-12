import confetti from 'canvas-confetti';

export function fireCelebration() {
  const duration = 2500;
  const end = Date.now() + duration;

  // Burst 1: Kiri
  confetti({
    particleCount: 70,
    angle: 60,
    spread: 65,
    origin: { x: 0.1, y: 0.65 },
    colors: ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B'],
  });

  // Burst 2: Kanan
  setTimeout(() => {
    confetti({
      particleCount: 70,
      angle: 120,
      spread: 65,
      origin: { x: 0.9, y: 0.65 },
      colors: ['#4F46E5', '#7C3AED', '#10B981', '#F43F5E'],
    });
  }, 350);

  // Burst 3: Tengah atas
  setTimeout(() => {
    confetti({
      particleCount: 110,
      spread: 100,
      origin: { x: 0.5, y: 0.45 },
      colors: ['#10B981', '#4F46E5', '#06B6D4', '#F59E0B', '#EC4899'],
    });
  }, 750);

  const frame = () => {
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}

export function fireMiniConfetti() {
  confetti({
    particleCount: 55,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B'],
  });
}
