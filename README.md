# Aily

Build your intuition for AI.

A learning workspace with a five-minute beginner introduction, 12 ML and GenAI chapters, a Python reference, visual experiments, quizzes, and optional readings.

Serve `dist` with any static HTTP server, or use `npm run dev` for the local Worker adapter. Navigation uses URL fragments. Guest progress is stored locally; configured authentication supports account sync. Python snippets run in the learner’s own environment. The overfitting experiment is a constructed illustration, not a fitted model.

Edit lesson content in `data/course.json`. `npm run build` regenerates `dist/course.json` from this source before bundling the Worker. `dist/release.js` renders the beginner guide, lessons, activities, and resource cards. Run `npm test` to check catalogue links, model calculations, and Worker behaviour.
