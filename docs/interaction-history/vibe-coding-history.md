# VibeBuilder SELISE Blocks Project - Vibe Coding Interaction History

## Project Name
VibeBuilder / Universal Profile Engine

## Main AI / Vibe-Coding Tool Used
ChatGPT

## Purpose of the AI Interaction
The AI assistant was used to guide the setup, configuration, debugging, and frontend customization of a SELISE Blocks Construct React application.

## Major Work Completed Through the AI Interaction

1. Created and configured a SELISE Blocks Cloud project.
2. Connected the GitHub repository.
3. Created and pushed the `dev` branch.
4. Generated the Blocks Construct React Vite project using SELISE Blocks CLI.
5. Configured SELISE IAM login.
6. Configured SELISE Data Gateway using Blocks database.
7. Created Data Gateway schemas:
   - WebsiteProject
   - WebsitePage
8. Tested GraphQL queries and mutations through Data Gateway Playground.
9. Created one WebsiteProject record.
10. Created multiple WebsitePage records:
    - Home
    - About
    - Services
    - Contact
11. Stored serialized page layout JSON inside `WebsitePage.layoutJson`.
12. Added a VibeBuilder module inside the Blocks Construct React app.
13. Added VibeBuilder to the sidebar menu.
14. Added VibeBuilder route:
    - `/vibebuilder`
15. Loaded real WebsiteProject and WebsitePage data from SELISE Data Gateway.
16. Added VibeBuilder editor route:
    - `/vibebuilder/builder/:projectId/:pageId`
17. Rendered saved `layoutJson` as a live page preview.

## Important Architecture Decision
No custom backend was created. The project uses SELISE Blocks services:
- SELISE IAM for authentication
- SELISE Data Gateway for application data
- Blocks database through Data Gateway
- Blocks Construct React as the frontend foundation

## Current Status
The app can load website projects and pages from SELISE Data Gateway and render saved page layout JSON in a live preview.

## Next Planned Features
1. Drag-and-drop or click-to-add block builder.
2. Edit component properties.
3. Save updated layout JSON back to SELISE Data Gateway.
4. Public live site renderer.
5. Lovable-style prompt builder that generates page layout JSON from user prompts.

## Chat History Link
Paste the shared ChatGPT conversation link here before final submission:

[PASTE CHATGPT SHARE LINK HERE]

## GitHub Repository
https://github.com/saifhossain900/vibebuilder-selise-blocks