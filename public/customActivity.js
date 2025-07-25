// === public/customActivity.js ===
define(["postmonger"], function (Postmonger) {
    var connection = new Postmonger.Session();
    var payload = {};

    connection.on("initActivity", function (data) {
      if (data) payload = data;
      // Populate fields if editing
      var args = payload.arguments?.execute?.inArguments?.[0] || {};
      document.getElementById("url").value = args.url || "";
      document.getElementById("method").value = args.method || "POST";
      // Headers
      if (args.headers) {
        const headersList = document.getElementById('headers-list');
        headersList.innerHTML = '';
        Object.entries(args.headers).forEach(([k, v]) => {
          addHeaderRow(k, v);
        });
      }
      // Body
      document.getElementById("body").value = args.body ? JSON.stringify(args.body, null, 2) : "";
      // Auth
      if (args.auth) {
        document.getElementById('auth-type').value = args.auth.type || 'none';
        renderAuthFields(args.auth.type);
        setTimeout(() => {
          if (args.auth.type === 'bearer') {
            document.getElementById('auth-url').value = args.auth.url || '';
            document.getElementById('auth-method').value = args.auth.method || 'POST';
            document.getElementById('auth-headers').value = args.auth.headers ? JSON.stringify(args.auth.headers, null, 2) : '';
            document.getElementById('auth-body').value = args.auth.body ? JSON.stringify(args.auth.body, null, 2) : '';
            document.getElementById('auth-token-path').value = args.auth.tokenPath || '';
          } else if (args.auth.type === 'basic') {
            document.getElementById('auth-username').value = args.auth.username || '';
            document.getElementById('auth-password').value = args.auth.password || '';
          } else if (args.auth.type === 'oauth2') {
            document.getElementById('oauth-token-url').value = args.auth.token_url || '';
            document.getElementById('oauth-client-id').value = args.auth.client_id || '';
            document.getElementById('oauth-client-secret').value = args.auth.client_secret || '';
            document.getElementById('oauth-scope').value = args.auth.scope || '';
            document.getElementById('oauth-headers').value = args.auth.headers ? JSON.stringify(args.auth.headers, null, 2) : '';
          }
        }, 100);
      }
    });

    document.getElementById("saveBtn").addEventListener("click", function () {
      var url = document.getElementById("url").value;
      var method = document.getElementById("method").value;
      // Headers
      var headers = {};
      document.querySelectorAll('#headers-list .header-row').forEach(row => {
        const [keyInput, valueInput] = row.querySelectorAll('input');
        if (keyInput.value) headers[keyInput.value] = valueInput.value;
      });
      // Body
      var body = document.getElementById("body").value;
      try { body = JSON.parse(body); } catch { body = {}; }
      // Auth
      var authType = document.getElementById('auth-type').value;
      var auth;
      if (authType === 'bearer') {
        auth = {
          type: 'bearer',
          url: document.getElementById('auth-url').value,
          method: document.getElementById('auth-method').value,
          headers: parseJsonField('auth-headers'),
          body: parseJsonField('auth-body'),
          tokenPath: document.getElementById('auth-token-path').value
        };
      } else if (authType === 'basic') {
        auth = {
          type: 'basic',
          username: document.getElementById('auth-username').value,
          password: document.getElementById('auth-password').value
        };
      } else if (authType === 'oauth2') {
        auth = {
          type: 'oauth2',
          token_url: document.getElementById('oauth-token-url').value,
          client_id: document.getElementById('oauth-client-id').value,
          client_secret: document.getElementById('oauth-client-secret').value,
          scope: document.getElementById('oauth-scope').value,
          headers: parseJsonField('oauth-headers')
        };
      }
      payload.arguments.execute.inArguments = [{ url, method, headers, body, auth }];
      connection.trigger("updateActivity", payload);
    });

    connection.trigger("ready");

    // Helper functions (must be global for HTML to use)
    window.addHeaderRow = function(key, value) {
      const headersList = document.getElementById('headers-list');
      const row = document.createElement('div');
      row.className = 'header-row';
      const keyInput = document.createElement('input');
      keyInput.placeholder = 'Header Name';
      keyInput.value = key;
      const valueInput = document.createElement('input');
      valueInput.placeholder = 'Header Value';
      valueInput.value = value;
      const varPicker = createVarPicker('header', valueInput);
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = 'Remove';
      removeBtn.onclick = () => row.remove();
      row.append(keyInput, valueInput, varPicker, removeBtn);
      headersList.appendChild(row);
    };
    window.renderAuthFields = function(type) {
      const authFields = document.getElementById('auth-fields');
      authFields.innerHTML = '';
      if (type === 'bearer') {
        authFields.innerHTML = `
          <div class='form-row'><label>Auth URL: <input type='text' id='auth-url'></label></div>
          <div class='form-row'><label>Method: <select id='auth-method'><option>POST</option><option>GET</option></select></label></div>
          <div class='form-row'><label>Headers (JSON): <textarea id='auth-headers'></textarea></label></div>
          <div class='form-row'><label>Body (JSON): <textarea id='auth-body'></textarea></label></div>
          <div class='form-row'><label>Token Path (e.g., access_token): <input type='text' id='auth-token-path'></label></div>
        `;
      } else if (type === 'basic') {
        authFields.innerHTML = `
          <div class='form-row'><label>Username: <input type='text' id='auth-username'></label></div>
          <div class='form-row'><label>Password: <input type='password' id='auth-password'></label></div>
        `;
      } else if (type === 'oauth2') {
        authFields.innerHTML = `
          <div class='form-row'><label>Token URL: <input type='text' id='oauth-token-url'></label></div>
          <div class='form-row'><label>Client ID: <input type='text' id='oauth-client-id'></label></div>
          <div class='form-row'><label>Client Secret: <input type='password' id='oauth-client-secret'></label></div>
          <div class='form-row'><label>Scope: <input type='text' id='oauth-scope'></label></div>
          <div class='form-row'><label>Headers (JSON): <textarea id='oauth-headers'></textarea></label></div>
        `;
      }
    };
    function createVarPicker(type, targetInput) {
      const journeyVars = [
        '{{Contact.Email}}',
        '{{Contact.Key}}',
        '{{Event.Data.FirstName}}',
        '{{Event.Data.LastName}}'
      ];
      const picker = document.createElement('select');
      picker.className = 'var-picker';
      picker.innerHTML = '<option value="">Insert Variable</option>' + journeyVars.map(v => `<option value="${v}">${v}</option>`).join('');
      picker.onchange = function() {
        if (this.value) {
          if (type === 'header') {
            targetInput.value += this.value;
          }
        }
      };
      return picker;
    }
    function parseJsonField(id) {
      try { return JSON.parse(document.getElementById(id).value); } catch { return {}; }
    }
});
  