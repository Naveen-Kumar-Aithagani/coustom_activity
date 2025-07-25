const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve the icon file specifically
app.get('/icon.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'icon.png'));
});

// Endpoint for Journey Builder to load the configuration UI
app.get('/public/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Required endpoints for Custom Activity
app.post('/execute', async (req, res) => {
  const inArgs = req.body.inArguments?.[0];
  const fetch = (await import('node-fetch')).default;

  const { url, method, headers, body } = inArgs;

  try {
    const response = await fetch(url, {
      method: method || 'POST',
      headers: headers || {},
      body: JSON.stringify(body || {})
    });

    const data = await response.json();
    console.log('✅ API Success:', data);
    res.status(200).json({ branchResult: 'success', data });
  } catch (error) {
    console.error('❌ API Error:', error.message);
    res.status(500).json({ branchResult: 'failure', error: error.message });
  }
});

// Validate endpoint (Salesforce hits this before saving)
app.post('/validate', (req, res) => {
  console.log('🔍 Validate called');
  res.status(200).json({ success: true });
});

// Save endpoint (called when user configures and saves activity)
app.post('/save', (req, res) => {
  console.log('💾 Save called with:', req.body);
  res.status(200).json({ success: true });
});

// Fallback for all other routes (optional)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});