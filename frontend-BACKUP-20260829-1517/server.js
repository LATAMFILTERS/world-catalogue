const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the out directory
app.use(express.static(path.join(__dirname, 'out')));

// Handle all routes - if HTML exists for the route, serve it
app.get('*', (req, res) => {
  const filePath = path.join(__dirname, 'out', req.path);

  // Try to serve HTML file if it exists
  if (fs.existsSync(`${filePath}.html`)) {
    res.sendFile(`${filePath}.html`);
  } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
    res.sendFile(path.join(filePath, 'index.html'));
  } else if (fs.existsSync(path.join(__dirname, 'out', 'index.html'))) {
    // Serve index.html for SPA routes
    res.sendFile(path.join(__dirname, 'out', 'index.html'));
  } else {
    res.status(404).send('Not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
