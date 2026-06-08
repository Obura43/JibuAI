(function() {
  'use strict';

  var script = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var orgId = script.getAttribute('data-org-id');
  if (!orgId) { console.error('[JibuAI] data-org-id is required'); return; }

  var BASE_URL = script.src.replace('/widget.js', '');
  var config = null;
  var conversationId = null;
  var isOpen = false;

  var styles = `
    #jibuai-widget * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    #jibuai-launcher { position: fixed; z-index: 999999; width: 56px; height: 56px; border-radius: 50%; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.25); transition: transform 0.2s ease, box-shadow 0.2s ease; }
    #jibuai-launcher:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(0,0,0,0.3); }
    #jibuai-launcher.bottom-right { bottom: 24px; right: 24px; }
    #jibuai-launcher.bottom-left { bottom: 24px; left: 24px; }
    #jibuai-panel { position: fixed; z-index: 999998; width: 360px; height: 520px; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.2); display: flex; flex-direction: column; transition: all 0.3s cubic-bezier(0.16,1,0.3,1); transform-origin: bottom right; }
    #jibuai-panel.bottom-right { bottom: 92px; right: 24px; }
    #jibuai-panel.bottom-left { bottom: 92px; left: 24px; transform-origin: bottom left; }
    #jibuai-panel.hidden { opacity: 0; transform: scale(0.85) translateY(16px); pointer-events: none; }
    #jibuai-panel.visible { opacity: 1; transform: scale(1) translateY(0); }
    #jibuai-header { padding: 16px; display: flex; align-items: center; gap: 12px; color: white; flex-shrink: 0; }
    #jibuai-header-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    #jibuai-header-name { font-weight: 600; font-size: 14px; }
    #jibuai-header-status { font-size: 11px; opacity: 0.7; display: flex; align-items: center; gap: 4px; }
    #jibuai-header-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; display: inline-block; }
    #jibuai-messages { flex: 1; overflow-y: auto; padding: 12px; background: #f9fafb; display: flex; flex-direction: column; gap: 8px; }
    #jibuai-messages::-webkit-scrollbar { width: 4px; }
    #jibuai-messages::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 2px; }
    .jibuai-msg { display: flex; gap: 6px; animation: jibuai-fadein 0.3s ease; }
    .jibuai-msg.visitor { flex-direction: row-reverse; }
    .jibuai-msg-bubble { max-width: 80%; padding: 8px 12px; border-radius: 14px; font-size: 13px; line-height: 1.5; }
    .jibuai-msg.agent .jibuai-msg-bubble { background: white; color: #374151; border-radius: 14px 14px 14px 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .jibuai-msg.visitor .jibuai-msg-bubble { color: white; border-radius: 14px 14px 4px 14px; }
    .jibuai-msg-time { font-size: 10px; color: #9ca3af; margin-top: 2px; text-align: right; }
    #jibuai-typing { display: flex; gap: 4px; padding: 10px 12px; background: white; border-radius: 14px; width: fit-content; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    #jibuai-typing span { width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: jibuai-bounce 1.4s ease-in-out infinite; }
    #jibuai-typing span:nth-child(2) { animation-delay: 0.2s; }
    #jibuai-typing span:nth-child(3) { animation-delay: 0.4s; }
    #jibuai-footer { background: white; border-top: 1px solid #f3f4f6; padding: 10px; flex-shrink: 0; }
    #jibuai-form { display: flex; gap: 8px; }
    #jibuai-input { flex: 1; border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px 12px; font-size: 13px; outline: none; color: #374151; }
    #jibuai-input:focus { border-color: #9ca3af; }
    #jibuai-send { width: 36px; height: 36px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: white; transition: opacity 0.2s; }
    #jibuai-send:hover { opacity: 0.85; }
    #jibuai-watermark { text-align: center; font-size: 10px; color: #9ca3af; padding: 4px 0; }
    #jibuai-watermark a { font-weight: 500; text-decoration: none; }
    #jibuai-locked { background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 10px; text-align: center; font-size: 12px; color: #dc2626; margin: 8px; }
    #jibuai-name-form { padding: 16px; background: white; }
    #jibuai-name-form h3 { font-size: 14px; font-weight: 600; color: #1f2937; margin: 0 0 8px; }
    .jibuai-name-input { width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px 12px; font-size: 13px; outline: none; margin-bottom: 8px; }
    .jibuai-name-input:focus { border-color: #9ca3af; }
    .jibuai-name-btn { width: 100%; border: none; border-radius: 8px; padding: 8px; font-size: 13px; font-weight: 600; cursor: pointer; color: white; transition: opacity 0.2s; }
    .jibuai-name-btn:hover { opacity: 0.85; }
    @keyframes jibuai-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes jibuai-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-4px); opacity: 1; } }
    @media (max-width: 420px) {
      #jibuai-panel { width: calc(100vw - 24px); right: 12px !important; left: 12px !important; }
    }
  `;

  var styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  function svgIcon(color) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
  }

  function sendIcon(color) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
  }

  function fetchConfig(cb) {
    fetch(BASE_URL + '/api/widget/config?org_id=' + orgId)
      .then(function(r) { return r.json(); })
      .then(function(data) { config = data; cb(null, data); })
      .catch(function(err) { cb(err); });
  }

  function buildWidget() {
    var pos = (config.widget_position || 'bottom-right');
    var primaryColor = config.primary_color || '#071A2F';
    var accentColor = config.accent_color || '#D4AF37';
    var welcomeMsg = config.welcome_message || 'Hi there! How can we help you?';
    var orgName = config.org_name || 'Support';
    var canReceive = config.can_receive;
    var isTrialing = config.subscription_status === 'trialing';
    var showWatermark = config.show_watermark !== false;

    // Launcher
    var launcher = document.createElement('button');
    launcher.id = 'jibuai-launcher';
    launcher.className = pos;
    launcher.style.backgroundColor = primaryColor;
    launcher.innerHTML = svgIcon(accentColor);
    launcher.setAttribute('aria-label', 'Open chat');
    document.body.appendChild(launcher);

    // Panel
    var panel = document.createElement('div');
    panel.id = 'jibuai-panel';
    panel.className = pos + ' hidden';
    panel.style.background = '#fff';

    // Header
    var header = document.createElement('div');
    header.id = 'jibuai-header';
    header.style.backgroundColor = primaryColor;
    header.innerHTML = [
      '<div id="jibuai-header-avatar" style="background:' + accentColor + '20">' + svgIcon(accentColor) + '</div>',
      '<div>',
      '<div id="jibuai-header-name">' + orgName + '</div>',
      '<div id="jibuai-header-status"><span id="jibuai-header-status-dot"></span>Online &bull; Replies in minutes</div>',
      '</div>',
    ].join('');
    panel.appendChild(header);

    // Messages area
    var messages = document.createElement('div');
    messages.id = 'jibuai-messages';
    panel.appendChild(messages);

    // Footer
    var footer = document.createElement('div');
    footer.id = 'jibuai-footer';

    if (!canReceive) {
      var locked = document.createElement('div');
      locked.id = 'jibuai-locked';
      locked.textContent = 'This workspace is currently unavailable. Please try again later.';
      footer.appendChild(locked);
    } else {
      var form = document.createElement('div');
      form.id = 'jibuai-form';
      var input = document.createElement('input');
      input.id = 'jibuai-input';
      input.placeholder = 'Type a message...';
      input.setAttribute('aria-label', 'Chat message');
      var send = document.createElement('button');
      send.id = 'jibuai-send';
      send.style.backgroundColor = primaryColor;
      send.innerHTML = sendIcon('white');
      send.setAttribute('aria-label', 'Send message');
      form.appendChild(input);
      form.appendChild(send);
      footer.appendChild(form);

      send.addEventListener('click', handleSend);
      input.addEventListener('keydown', function(e) { if (e.key === 'Enter') handleSend(); });
    }

    if (showWatermark) {
      var watermark = document.createElement('div');
      watermark.id = 'jibuai-watermark';
      watermark.innerHTML = 'Powered by <a href="https://jibuai.co.ke" target="_blank" style="color:' + accentColor + '">JibuAI</a>' + (isTrialing ? ' &bull; Trial' : '');
      footer.appendChild(watermark);
    }

    panel.appendChild(footer);
    document.body.appendChild(panel);

    // Show welcome message
    setTimeout(function() {
      addMessage('agent', welcomeMsg);
    }, 400);

    // Toggle
    launcher.addEventListener('click', function() {
      isOpen = !isOpen;
      if (isOpen) {
        panel.classList.remove('hidden');
        panel.classList.add('visible');
        launcher.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + accentColor + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        setTimeout(function() { var inp = document.getElementById('jibuai-input'); if (inp) inp.focus(); }, 300);
      } else {
        panel.classList.remove('visible');
        panel.classList.add('hidden');
        launcher.innerHTML = svgIcon(accentColor);
      }
    });
  }

  var visitorName = '';
  var visitorEmail = '';
  var pendingMessage = '';
  var sendingMessage = false;

  function addMessage(type, text) {
    var messages = document.getElementById('jibuai-messages');
    if (!messages) return;
    var div = document.createElement('div');
    div.className = 'jibuai-msg ' + type;
    var time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    div.innerHTML = '<div class="jibuai-msg-bubble">' + escapeHtml(text) + '<div class="jibuai-msg-time">' + time + '</div></div>';
    if (type === 'visitor' && config && config.primary_color) {
      div.querySelector('.jibuai-msg-bubble').style.backgroundColor = config.primary_color;
    }
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    var messages = document.getElementById('jibuai-messages');
    if (!messages) return;
    var typing = document.createElement('div');
    typing.id = 'jibuai-typing-indicator';
    typing.className = 'jibuai-msg agent';
    typing.innerHTML = '<div id="jibuai-typing"><span></span><span></span><span></span></div>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
    return typing;
  }

  function removeTyping() {
    var t = document.getElementById('jibuai-typing-indicator');
    if (t) t.remove();
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  function sendMessage(msg) {
    if (sendingMessage) return;
    sendingMessage = true;
    var typing = showTyping();

    fetch(BASE_URL + '/api/widget/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_id: orgId,
        visitor_name: visitorName || null,
        visitor_email: visitorEmail || null,
        message: msg,
      }),
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      removeTyping();
      sendingMessage = false;
      if (data.error) {
        addMessage('agent', 'Sorry, we could not receive your message right now. Please try again.');
        return;
      }
      conversationId = data.conversation_id;
      setTimeout(function() {
        addMessage('agent', 'Thank you for your message! A member of our team will respond shortly.');
        if (data.is_trial) {
          var messages = document.getElementById('jibuai-messages');
          if (messages) {
            var trialNote = document.createElement('div');
            trialNote.style.cssText = 'text-align:center;font-size:10px;color:#9ca3af;padding:4px;';
            trialNote.textContent = 'JibuAI Trial Workspace';
            messages.appendChild(trialNote);
          }
        }
      }, 800);
    })
    .catch(function() {
      removeTyping();
      sendingMessage = false;
      addMessage('agent', 'Sorry, something went wrong. Please try again later.');
    });
  }

  function handleSend() {
    var input = document.getElementById('jibuai-input');
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;
    addMessage('visitor', text);
    input.value = '';
    sendMessage(text);
  }

  // Init
  fetchConfig(function(err, data) {
    if (err) { console.error('[JibuAI] Failed to load widget config', err); return; }
    buildWidget();
  });
})();
