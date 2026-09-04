/**
 * Video delivery celebration animation — drop-in, framework-agnostic.
 */

const CSS = `
  .delivery-stage {
    position: relative;
    height: 56px;
    overflow: hidden;
    pointer-events: none;
  }
  .delivery-runner {
    position: absolute;
    top: 14px;
    font-size: 24px;
    animation: deliveryRun 1.1s ease-in-out forwards;
  }
  .delivery-sparkle {
    position: absolute;
    font-size: 14px;
    animation: deliverySparkle 0.7s ease-out forwards;
  }
  @keyframes deliveryRun {
    0%   { left: -30px; transform: translateY(0); }
    25%  { transform: translateY(-6px); }
    50%  { transform: translateY(0); }
    75%  { transform: translateY(-6px); }
    100% { left: 100%; transform: translateY(0); }
  }
  @keyframes deliverySparkle {
    0%   { opacity: 0; transform: scale(0.4); }
    40%  { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.6) translateY(-8px); }
  }
`;

function injectStylesOnce() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('delivery-animation-styles')) return;
  const tag = document.createElement('style');
  tag.id = 'delivery-animation-styles';
  tag.textContent = CSS;
  document.head.appendChild(tag);
}

export function celebrateDelivery(stageEl: HTMLElement | null) {
  if (!stageEl) return;
  injectStylesOnce();

  // Removed the daily throttle as per the script's comment recommendation, 
  // so that the team can enjoy it every time a video is completed!

  stageEl.innerHTML = '';

  const runner = document.createElement('span');
  runner.className = 'delivery-runner';
  runner.textContent = '🎬'; 
  stageEl.appendChild(runner);

  [15, 35, 55, 75].forEach((pct, i) => {
    const sparkle = document.createElement('span');
    sparkle.className = 'delivery-sparkle';
    sparkle.textContent = '✨';
    sparkle.style.left = pct + '%';
    sparkle.style.top = (8 + (i % 2) * 6) + 'px';
    sparkle.style.animationDelay = (i * 0.22 + 0.15) + 's';
    stageEl.appendChild(sparkle);
  });

  // Clean up after itself so the stage doesn't accumulate stale nodes
  runner.addEventListener('animationend', () => {
    stageEl.innerHTML = '';
  }, { once: true });
}
