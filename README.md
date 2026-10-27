# WAISI RealWear Studio V16

AI Design Lab: text-to-image and optional image reference via OpenAI Images API. Configure `OPENAI_API_KEY` in Render environment. Never commit the key.

Structure: public/index.html, public/cad.js, server.js, package.json, render.yaml.

New: color x size quantity matrix; structured print-to-PDF Tech Pack; AI generation and applying generated image as 3D artwork.

Limitations: AI result is a 2D image, not editable 3D mesh or production pattern. Current 3D geometry is still a simplified prototype. Tech Pack and DXF require factory validation. AI incurs API usage costs. The AI endpoint has only basic throttling and no authentication: add authentication and per-user quotas before exposing publicly.
