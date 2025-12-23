/* Loading state utilities */

let spinner = null;

export function showLoading(message = "Loading..."){
  hideLoading(); // Clear any existing

  spinner = document.createElement('div');
  spinner.className = 'appLoading';
  spinner.setAttribute('role', 'status');
  spinner.setAttribute('aria-live', 'polite');
  spinner.innerHTML = `
    <div class="loadingBackdrop"></div>
    <div class="loadingCard">
      <div class="loadingSpinner">
        <div class="spinnerRing"></div>
        <div class="spinnerRing"></div>
        <div class="spinnerRing"></div>
      </div>
      <div class="loadingText">${escapeHtml(message)}</div>
    </div>
  `;

  document.body.appendChild(spinner);
  ensureLoadingStyles();

  // Fade in
  requestAnimationFrame(() => {
    spinner.classList.add('show');
  });
}

export function hideLoading(){
  if(!spinner) return;

  spinner.classList.remove('show');
  setTimeout(() => {
    if(spinner?.parentNode) spinner.parentNode.removeChild(spinner);
    spinner = null;
  }, 200);
}

function escapeHtml(s){
  return (s+"").replace(/[&<>"']/g, (c)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}

function ensureLoadingStyles(){
  if(document.getElementById('loadingStyles')) return;

  const css = `
  .appLoading{
    position:fixed;
    inset:0;
    z-index:10000;
    display:flex;
    align-items:center;
    justify-content:center;
    opacity:0;
    pointer-events:none;
    transition: opacity 180ms ease;
  }
  .appLoading.show{
    opacity:1;
    pointer-events:auto;
  }
  .loadingBackdrop{
    position:absolute;
    inset:0;
    background: rgba(2,6,23,.75);
    backdrop-filter: blur(4px);
  }
  .loadingCard{
    position:relative;
    z-index:1;
    padding: 24px 28px;
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(15,23,42,1), rgba(10,15,30,1));
    border: 1px solid rgba(255,255,255,.10);
    box-shadow: 0 20px 60px rgba(0,0,0,.5);
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:14px;
  }
  .loadingSpinner{
    position:relative;
    width:50px;
    height:50px;
  }
  .spinnerRing{
    position:absolute;
    inset:0;
    border: 3px solid transparent;
    border-top-color: var(--accent, #5cffc6);
    border-radius:50%;
    animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  }
  .spinnerRing:nth-child(1){ animation-delay: -0.45s; }
  .spinnerRing:nth-child(2){ animation-delay: -0.3s; opacity:.7; }
  .spinnerRing:nth-child(3){ animation-delay: -0.15s; opacity:.4; }
  @keyframes spin{
    0%{ transform: rotate(0deg); }
    100%{ transform: rotate(360deg); }
  }
  .loadingText{
    font: 700 13px/1.2 var(--font-main, ui-monospace, monospace);
    color: rgba(255,255,255,.85);
    letter-spacing:.02em;
  }
  @media (prefers-reduced-motion: reduce){
    .spinnerRing{ animation: none !important; }
    .loadingText::after{
      content: '...';
      animation: dots 1.5s steps(3, end) infinite;
    }
    @keyframes dots{
      0%, 25%{ content: ''; }
      26%, 50%{ content: '.'; }
      51%, 75%{ content: '..'; }
      76%, 100%{ content: '...'; }
    }
  }
  `;

  const style = document.createElement('style');
  style.id = 'loadingStyles';
  style.textContent = css;
  document.head.appendChild(style);
}
