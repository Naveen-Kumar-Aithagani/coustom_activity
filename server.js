const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(bodyParser.json());

// Add CORS headers for Salesforce Journey Builder
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (must be before static middleware)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    endpoints: {
      validate: '/validate',
      save: '/save',
      execute: '/execute',
      manifest: '/manifest.json',
      icon: '/icon.png'
    }
  });
});

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Explicit routes for critical static files (for Vercel compatibility)
app.get('/icon.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'icon.png'));
});

app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/customActivity.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'customActivity.js'));
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
  console.log('🔍 Validate called with body:', JSON.stringify(req.body, null, 2));
  try {
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Validate error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save endpoint (called when user configures and saves activity)
app.post('/save', (req, res) => {
  console.log('💾 Save called with body:', JSON.stringify(req.body, null, 2));
  try {
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Save error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fallback for all other routes (optional) - must be last
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});