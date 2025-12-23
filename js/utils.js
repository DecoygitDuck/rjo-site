/* Shared utility functions */

export function spark(el){
  if(!el?.animate) return;
  el.animate(
    [
      { background:'rgba(37,99,235,.10)', borderColor:'rgba(37,99,235,.35)' },
      { background:'rgba(255,255,255,.80)', borderColor:'rgba(15,23,42,.10)' }
    ],
    { duration: 360, easing:'cubic-bezier(.2,.85,.2,1)' }
  );
}

export function toast(msg){
  const t = document.getElementById('bToast') || document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>t.classList.remove('show'), 2400);
}

export function escapeHtml(s){
  return (s+"").replace(/[&<>"']/g, (c)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}
