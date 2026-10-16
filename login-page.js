// Sign-in screen served by middleware.js. Self-contained (inline styles, no site
// assets) because nothing else on the site loads before sign-in. Colors, type and
// the header mirror docs-site/assets/docs.css.

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function loginPage({ next = '/', error = false } = {}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Sign in · Design documentation</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{
  color-scheme:light;
  --canvas:#ffffff; --mat:#f7f8f8; --edge:#dee0e3; --border:#c2c5cb; --focus:#4a89dc; --focus-ring:#e6f1ff;
  --ink:#2f2f33; --ink-body:#3d464d; --ink-2:#525b63; --ink-muted:#677079;
  --primary:#296cc3; --primary-hover:#1450a0; --dont-fill:#ffe6e8; --dont-ink:#9f111f;
  --sans:"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:var(--mat)}
body{font-family:var(--sans);color:var(--ink-body);font-size:16px;line-height:24px;-webkit-font-smoothing:antialiased;padding-top:56px}
header{position:fixed;top:0;left:0;right:0;height:56px;display:flex;align-items:center;gap:10px;padding:0 24px;background:var(--canvas);border-bottom:1px solid var(--edge)}
.name{font-size:16px;line-height:24px;font-weight:600;color:var(--ink)}
.sub{font-size:14px;line-height:20px;color:var(--ink-muted);padding-left:10px;border-left:1px solid var(--edge)}
main{display:flex;justify-content:center;padding:96px 20px}
.card{width:100%;max-width:400px;background:var(--canvas);border:1px solid var(--edge);border-radius:12px;padding:32px}
.eyebrow{font-size:12px;line-height:14px;font-weight:500;color:var(--ink-muted);margin:0 0 8px}
h1{margin:0 0 8px;font-size:24px;line-height:32px;font-weight:600;color:var(--ink)}
.lead{margin:0 0 24px;color:var(--ink-2)}
label{display:block;font-size:14px;line-height:20px;font-weight:500;color:var(--ink);margin-bottom:6px}
input{width:100%;height:40px;padding:0 12px;font:inherit;font-size:14px;color:var(--ink);background:var(--canvas);border:1px solid var(--border);border-radius:8px;transition:border-color .12s ease,box-shadow .12s ease}
input:hover{border-color:var(--ink-muted)}
input:focus{outline:none;border-color:var(--focus);box-shadow:0 0 0 3px var(--focus-ring)}
input[aria-invalid="true"]{border-color:var(--dont-ink)}
.error{display:flex;gap:8px;align-items:flex-start;margin:0 0 16px;padding:10px 12px;border-radius:8px;background:var(--dont-fill);color:var(--dont-ink);font-size:14px;line-height:20px}
.error svg{flex:none;margin-top:2px}
button{margin-top:20px;width:100%;height:40px;border:0;border-radius:8px;background:var(--primary);color:#fff;font:inherit;font-size:14px;font-weight:500;cursor:pointer;transition:background-color .12s ease}
button:hover{background:var(--primary-hover)}
button:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.help{margin:20px 0 0;font-size:12px;line-height:16px;color:var(--ink-muted)}
@media(max-width:700px){ .sub{display:none} main{padding:48px 16px} .card{padding:24px} }
</style>
</head>
<body>
<header>
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><rect x="2" y="2" width="9" height="9" rx="2.5" fill="#296cc3"/><rect x="13" y="2" width="9" height="9" rx="2.5" fill="#76a9ed"/><rect x="2" y="13" width="9" height="9" rx="2.5" fill="#76a9ed"/><rect x="13" y="13" width="9" height="9" rx="4.5" fill="#1450a0"/></svg>
  <span class="name">Modern UI</span><span class="sub">Design documentation</span>
</header>
<main>
  <form class="card" method="post" action="/__login">
    <p class="eyebrow">Modern UI</p>
    <h1>Sign in</h1>
    <p class="lead">This website contains design documentation, prototype components, and Figma links for Modern UI and Amplify. A password has been added for security. Please send Madeleine a Slack message to get the password.</p>
    ${error ? `<p class="error" id="pw-error" role="alert"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 4.75v3.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="11" r="0.9" fill="currentColor"/></svg>That password isn’t right. Try again.</p>` : ''}
    <label for="pw">Password</label>
    <input id="pw" name="password" type="password" autocomplete="current-password" required autofocus${error ? ' aria-invalid="true" aria-describedby="pw-error"' : ''}>
    <input type="hidden" name="next" value="${esc(next)}">
    <button type="submit">Sign in</button>
    <p class="help">You’ll stay signed in on this browser for 30 days.</p>
  </form>
</main>
</body>
</html>`;
}
