import fs from 'node:fs';

const refs = {
  python: ['Python Tutorial', 'https://docs.python.org/3/tutorial/'],
  w3_python: ['W3Schools: Python Tutorial', 'https://www.w3schools.com/python/'],
  w3_numpy: ['W3Schools: NumPy Tutorial', 'https://www.w3schools.com/python/numpy/default.asp'],
  w3_pandas: ['W3Schools: Pandas Tutorial', 'https://www.w3schools.com/python/pandas/default.asp'],
  w3_matplotlib: ['W3Schools: Matplotlib Tutorial', 'https://www.w3schools.com/python/matplotlib_intro.asp'],
  w3_ml: ['W3Schools: Machine Learning', 'https://www.w3schools.com/python/python_ml_getting_started.asp'],
  w3_trees: ['W3Schools: Decision Tree', 'https://www.w3schools.com/python/python_ml_decision_tree.asp'],
  w3_knn: ['W3Schools: KNN Algorithm', 'https://www.w3schools.com/python/python_ml_knn.asp'],
  w3_logistic: ['W3Schools: Logistic Regression', 'https://www.w3schools.com/python/python_ml_logistic_regression.asp'],
  numpy: ['NumPy Basics', 'https://numpy.org/doc/stable/user/absolute_beginners.html'],
  pandas: ['10 Minutes to Pandas', 'https://pandas.pydata.org/docs/user_guide/10min.html'],
  intro: ['scikit-learn: Getting Started', 'https://scikit-learn.org/stable/getting_started.html'],
  eval: ['Model Selection and Evaluation', 'https://scikit-learn.org/stable/model_selection.html'],
  pitfalls: ['Common Pitfalls', 'https://scikit-learn.org/stable/common_pitfalls.html'],
  linear: ['Linear Models', 'https://scikit-learn.org/stable/modules/linear_model.html'],
  tree: ['Decision Trees', 'https://scikit-learn.org/stable/modules/tree.html'],
  ensemble: ['Ensemble Methods', 'https://scikit-learn.org/stable/modules/ensemble.html'],
  cluster: ['Clustering', 'https://scikit-learn.org/stable/modules/clustering.html'],
  metrics: ['Model Evaluation Metrics', 'https://scikit-learn.org/stable/modules/model_evaluation.html'],
  neural: ['Google ML: Neural Networks', 'https://developers.google.com/machine-learning/crash-course/neural-networks'],
  llm: ['Google ML: Language Models', 'https://developers.google.com/machine-learning/crash-course/llm'],
  embedding: ['Google ML: Embeddings', 'https://developers.google.com/machine-learning/crash-course/embeddings'],
  gradient: ['Google ML: Gradient Descent', 'https://developers.google.com/machine-learning/crash-course/linear-regression/gradient-descent'],
  iris: ['UCI Iris Dataset', 'https://archive.ics.uci.edu/dataset/53/iris'],
  course: ['Google ML Crash Course', 'https://developers.google.com/machine-learning/crash-course'],
  prompting: ['Prompt Engineering Guide', 'https://www.promptingguide.ai/'],
  rag: ['Pinecone: RAG Architecture', 'https://www.pinecone.io/learn/retrieval-augmented-generation/'],
  agents: ['Anthropic: Building Effective Agents', 'https://www.anthropic.com/research/building-effective-agents'],
  xgboost: ['XGBoost Documentation', 'https://xgboost.readthedocs.io/']
};

const chapters = [];
function add(id, title, track, summary, sections, example, exercise, answer, checks, game, sources) {
  chapters.push({ id, title, track, summary, sections, example, exercise, answer, checks, game, sources });
}
const q = (question, options, correct, explanation) => ({ question, options, correct, explanation });

// ==========================================
// TRACK 1: ML ALGORITHMS (The Machine Learning Suite)
// ==========================================

add('foundations', 'Meet Machine Learning', 'ML Algorithms', 'From hardcoded if/else rules to learning patterns from data.', [
  ['The Core Shift: Code vs AI', 'In traditional CS, you write the rules: Input + Rules = Output (e.g. an if-else function). In Machine Learning, you provide examples: Input + Output = Rules. The computer calculates the optimal decision function for you.'],
  ['Features (X) and Labels (y)', 'Features (X) are the input parameters available at prediction time (e.g., student study hours, previous GPA). The Label (y) is the return value you want to predict (e.g., Exam Score or Pass/Fail). Never include inputs that would not exist in production.'],
  ['Training vs Inference', 'Training is running an optimization loop that tunes internal weights to minimize error on past data. Inference is deploying that fitted model to production and calling model.predict(new_data). Calling an API is inference, not training.']
],
'# Traditional CS: You code the logic manually\ndef check_spam(msg):\n    return "lottery" in msg.lower()\n\n# Machine Learning: Model learns the coefficients from data\n# y_pred = model.predict(X_new)',
'You want to predict whether a customer will cancel their subscription this month. Name 2 valid features and 1 feature that causes data leakage.',
'Valid: Login frequency in last 30 days, support tickets opened. Leakage: "Cancellation survey comments" (only exists AFTER they cancel).',
[
  q('In traditional programming you write rules. In Machine Learning, what does the computer generate?', ['The input features', 'The rules/parameters', 'The database'], 1, 'ML algorithms learn the optimal rules/parameters by analyzing data examples.'),
  q('What is calling model.predict(data) in a live backend API called?', ['Training', 'Inference', 'Backpropagation'], 1, 'Applying a trained model to make predictions on new data is inference.')
], 'boundary', ['w3_ml', 'intro', 'course']);

add('linear', 'Linear Regression', 'ML Algorithms', 'Predicting numeric values with weights, loss, and gradient descent.', [
  ['The Line Equation: y = mx + b', 'Linear regression models a continuous target as a weighted sum of inputs plus a bias: y = w1*x1 + w2*x2 + ... + b. It is the gold-standard baseline for numeric prediction (e.g., house price, server latency, delivery time).'],
  ['Loss Function: Mean Squared Error (MSE)', 'How do we know if our line is good? We measure the difference between actual (y) and predicted (y_hat), square it to penalize big errors, and average them. The goal of training is finding weights that minimize this MSE.'],
  ['Optimization: Gradient Descent', 'Instead of guessing weights randomly, gradient descent calculates the derivative (slope) of the loss with respect to each weight and takes a small step in the downhill direction: w = w - (learning_rate * gradient).']
],
'from sklearn.linear_model import LinearRegression\n\n# Features: [Hours Studied, Practice Tests]\nX = [[2, 1], [4, 2], [6, 3], [8, 4]]\ny = [52, 68, 81, 95]  # Exam scores\n\nmodel = LinearRegression()\nmodel.fit(X, y)\nprint("Predicted score for 5h study:", model.predict([[5, 2.5]]))',
'If gradient is -3.0 and learning rate is 0.1, what is the weight update?',
'w_new = w - (0.1 * -3.0) = w + 0.3. The weight increases to reduce the loss.',
[
  q('What kind of output does Linear Regression predict?', ['A category (Spam/Not Spam)', 'A continuous number (e.g., Price, Latency)', 'An unlabelled cluster'], 1, 'Linear regression predicts continuous numeric values.'),
  q('What happens if the gradient descent learning rate is set too large?', ['It converges instantly', 'It can overshoot the minimum and diverge', 'It turns into a decision tree'], 1, 'Too large a step can cause the loss to oscillate or explode to infinity.')
], 'gradient', ['linear', 'w3_ml', 'gradient']);

add('problems', 'Logistic Regression & Classification', 'ML Algorithms', 'Predicting yes/no categories with probability curves and thresholds.', [
  ['Why Not Linear for Yes/No?', 'If you fit a straight line to binary labels (0 and 1), the line will predict nonsensical values like -0.4 or 1.6. Logistic regression solves this by wrapping the linear equation in a Sigmoid function, squeezing all outputs strictly between 0% and 100%.'],
  ['The Sigmoid Curve & Probabilities', 'The Sigmoid function S(z) = 1 / (1 + e^-z) converts any real number into a probability. If the model outputs 0.82, it means there is an 82% probability the example belongs to the positive class (e.g. "Will Pass Exam").'],
  ['Decision Thresholds', 'By default, threshold = 0.5: if p >= 0.5, predict 1, else 0. But in high-stakes problems like cancer screening, you might lower the threshold to 0.2 to catch every possible case, accepting more false alarms to avoid missing true positives.']
],
'from sklearn.linear_model import LogisticRegression\n\n# Features: [Hours studied, Attendance %]\nX = [[1, 40], [3, 60], [6, 80], [8, 95]]\ny = [0, 0, 1, 1]  # 0: Fail, 1: Pass\n\nclf = LogisticRegression()\nclf.fit(X, y)\nprob = clf.predict_proba([[5, 75]])[0][1] # Probability of Pass\nprint(f"Pass Probability: {prob:.1%}")',
'A loan fraud detector outputs p = 0.35. If the threshold is 0.30, what is the classification decision?',
'Flagged as fraud! Because 0.35 >= 0.30 threshold. Lower thresholds increase sensitivity.',
[
  q('Despite its name, what task is Logistic Regression used for?', ['Regression', 'Classification', 'Clustering'], 1, 'Logistic Regression is a binary classification algorithm.'),
  q('What does the Sigmoid activation function output?', ['Any positive integer', 'A probability between 0 and 1', 'Either strictly 0 or 1 with no decimals'], 1, 'Sigmoid squeezes outputs into smooth probabilities between 0.0 and 1.0.')
], 'iris', ['w3_logistic', 'intro', 'iris']);

add('trees', 'Decision Trees & Random Forests', 'ML Algorithms', 'Intuitive if/else rule branching and democratic committee ensembles.', [
  ['Decision Trees: Automated If/Else', 'A decision tree looks like a flowchart. At each node, it picks the single feature and threshold that best splits the data into pure groups (e.g. "Is age > 30?"). It is easy to visualize and requires no feature scaling.'],
  ['The Overfitting Trap: Max Depth', 'If you let a tree grow without limits, it will create a leaf node for every single training row—memorizing the noise. Control this by setting max_depth (e.g., max_depth=4) or min_samples_leaf to force generalisation.'],
  ['Random Forests: Wisdom of the Crowd', 'Instead of relying on one brittle tree, train 100 different trees on random subsets of data and features. To make a prediction, let all 100 trees vote. The majority vote wins (Bagging). This dramatically slashes variance and error.']
],
'from sklearn.ensemble import RandomForestClassifier\n\n# 100 decision trees voting together\nmodel = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)\nmodel.fit(X_train, y_train)\nprint("Test accuracy:", model.score(X_test, y_test))\nprint("Top feature importances:", model.feature_importances_)',
'Why is an ensemble of 100 trees better than 1 very deep tree?',
'A single deep tree overfits to training quirks. The forest averages out individual errors, giving stable predictions.',
[
  q('What is the main danger of an unconstrained Decision Tree?', ['It trains too slowly', 'Severe overfitting to training noise', 'It cannot handle numbers'], 1, 'Without max_depth constraints, trees memorize noise and fail on new data.'),
  q('How does a Random Forest make a final classification prediction?', ['Takes the output of only the deepest tree', 'Aggregates majority vote across all trees', 'Runs gradient descent on the leaves'], 1, 'Random Forest averages probabilities or takes the majority vote across all trees.')
], 'overfit', ['w3_trees', 'tree', 'ensemble']);

add('ensembles', 'Gradient Boosting & XGBoost', 'ML Algorithms', 'The tabular competition winner: learning sequentially from mistakes.', [
  ['Random Forest vs Gradient Boosting', 'Random Forest trains trees in parallel and averages them (Bagging). Gradient Boosting trains trees sequentially: each new tree is specifically built to predict and correct the errors (residuals) of the previous trees.'],
  ['Why XGBoost Dominates Industry Tabular Data', 'For tabular spreadsheets, customer tables, and transaction logs, gradient boosted trees (XGBoost, LightGBM, CatBoost) consistently beat deep neural networks with faster training, built-in missing value handling, and superior accuracy.'],
  ['Tuning Boosting Hyperparameters', 'Three critical levers: learning_rate (shrinkage factor per tree, e.g. 0.05), n_estimators (number of sequential trees), and max_depth (usually shallow: 3 to 6). Small learning rates paired with early stopping prevent overfitting.']
],
'import xgboost as xgb\n\n# Sequential error correction\nmodel = xgb.XGBClassifier(n_estimators=150, learning_rate=0.05, max_depth=4)\nmodel.fit(X_train, y_train)\npreds = model.predict(X_test)',
'Tree 1 predicts house price is $300k, but actual is $340k (residual = +$40k). What does Tree 2 try to predict?',
'Tree 2 trains to predict the +$40k residual! Adding Tree 1 + Tree 2 brings prediction closer to actual.',
[
  q('How does Gradient Boosting build new trees?', ['Sequentially to correct residuals of previous trees', 'In parallel with no connection', 'By randomly shuffling labels'], 0, 'Each subsequent tree trains on the errors/residuals left by previous trees.'),
  q('For structured tabular data, what model class often outperforms deep learning?', ['Gradient Boosted Trees (XGBoost/LightGBM)', 'Simple k-Means', 'Unregulated single Decision Tree'], 0, 'XGBoost and LightGBM are the industry standard for tabular data.')
], 'gradient', ['xgboost', 'ensemble', 'intro']);

add('clustering', 'k-NN & K-Means Clustering', 'ML Algorithms', 'Distance-based classification and discovering hidden data clusters.', [
  ['k-Nearest Neighbors (k-NN)', 'To classify a new item, find the k closest examples in the training dataset and let them vote. If k=3 and 2 neighbors are "Spam", predict Spam. k-NN requires no training phase, but feature scaling (StandardScaler) is mandatory.'],
  ['K-Means: Grouping Without Labels', 'When you have raw data without answers (e.g. customer purchase habits), K-Means groups them into k clusters. It randomly places k centroids, assigns points to the nearest centroid, and recalculates the centroid center until stable.'],
  ['Why Feature Scaling Matters', 'If feature 1 is Salary ($20k to $150k) and feature 2 is Age (18 to 70), Euclidean distance will be 99.9% dominated by Salary. Always normalize or standardize features before calculating distances!']
],
'from sklearn.cluster import KMeans\nfrom sklearn.preprocessing import StandardScaler\n\n# Always scale before computing distance!\nX_scaled = StandardScaler().fit_transform(X)\nkmeans = KMeans(n_clusters=3, random_state=42)\nclusters = kmeans.fit_predict(X_scaled)',
'If you double k in k-NN from 1 to 21, does the decision boundary become more jagged or smoother?',
'Smoother! Larger k considers a broader neighborhood, reducing noise sensitivity and smoothing the boundary.',
[
  q('Why must you scale features before running k-NN or K-Means?', ['Otherwise large-magnitude features dominate distance calculations', 'Scaling is required by Python syntax', 'It converts categories to booleans'], 0, 'Distance formulas (like Euclidean) are heavily biased towards features with large numbers.'),
  q('What kind of learning is K-Means clustering?', ['Supervised learning with labels', 'Unsupervised learning without labels', 'Reinforcement learning'], 1, 'K-Means discovers natural clusters without predefined target labels.')
], 'clusters', ['w3_knn', 'cluster', 'intro']);

add('evaluation', 'Evaluation & Overfitting', 'ML Algorithms', 'Train/Val/Test splits, precision, recall, and debugging generalisation.', [
  ['The Golden Rule: Never Test on Training Data', 'A model can easily achieve 100% accuracy on training data by memorizing it. Split your data into Training (fit weights), Validation (tune hyperparameters), and Test (final benchmark, touched only once).'],
  ['Accuracy is Dangerous on Imbalanced Data', 'If 99% of transactions are legitimate and 1% are fraud, a dumb model that predicts "Legitimate" every single time gets 99% accuracy while catching 0 frauds. Always inspect Precision and Recall for imbalanced problems.'],
  ['Precision vs Recall Tradeoff', 'Precision: Out of all positive predictions, how many were right? (Avoid false alarms). Recall: Out of all actual positives, how many did we catch? (Avoid missing real cases). F1-Score is the harmonic mean of both.']
],
'from sklearn.metrics import classification_report, confusion_matrix\n\n# Inspect precision, recall, and f1-score\nprint(confusion_matrix(y_true, y_pred))\nprint(classification_report(y_true, y_pred, target_names=["Legit", "Fraud"]))',
'In an airport security weapon detector, do you prioritize Precision or Recall?',
'Recall! A false alarm (low precision) means an extra bag search; a missed weapon (low recall) is catastrophic.',
[
  q('A fraud detector predicts no fraud ever on a dataset with 1% fraud. What is its Recall for fraud?', ['99%', '0%', '50%'], 1, 'It found 0 out of the actual fraud cases, so recall is 0% despite 99% accuracy.'),
  q('Which dataset split should be held out and evaluated only once at the very end?', ['Training set', 'Validation set', 'Final Test set'], 2, 'The test set gives an unbiased estimate of real-world generalization.')
], 'threshold', ['eval', 'metrics', 'pitfalls']);

// ==========================================
// TRACK 2: GENAI & AGENTS (The Modern AI Suite)
// ==========================================

add('prompting', 'Prompt Engineering & In-Context Reasoning', 'GenAI & Agents', 'Directing foundation models with system instructions, few-shot prompts, and CoT.', [
  ['System Prompts & Role Definition', 'A system prompt establishes the persona, constraints, and boundary rules for an LLM before user input arrives. Setting clear boundaries ("Answer only using provided context; do not guess") prevents hallucinations.'],
  ['Few-Shot Learning: Show, Don’t Just Tell', 'Zero-shot gives instructions only. Few-shot provides 2-3 input/output examples inside the prompt. Showing exact formatting patterns increases consistency and accuracy dramatically compared to wordy instructions.'],
  ['Chain-of-Thought (CoT) & Structured JSON', 'Asking a model to "Think step-by-step before answering" forces it to allocate reasoning tokens to intermediate steps, preventing hasty calculation errors. Enforcing JSON output schemas guarantees API-safe integrations.']
],
'system_prompt = """You are a senior code reviewer.\\nRules:\\n1. Output strictly valid JSON with keys: "approved", "feedback", "severity".\\n2. Think step-by-step before producing JSON."""\n\n# Example of Chain-of-Thought few-shot prompt:\n# Input: 2+3*4 -> Thought: 3*4=12, then 12+2=14 -> Answer: 14',
'Why does adding "Think step-by-step" improve LLM accuracy on math and logic problems?',
'Autoregressive models predict one token at a time. Intermediate reasoning tokens allow the model to build up the computation sequentially.',
[
  q('What is the difference between Zero-Shot and Few-Shot prompting?', ['Zero-shot fine-tunes weights; few-shot does not', 'Few-shot includes examples inside the prompt context', 'Zero-shot uses temperature 0'], 1, 'Few-shot prompting provides demonstrations of desired input/output pairs directly in context.'),
  q('What technique forces an LLM to generate intermediate reasoning before the final answer?', ['Chain-of-Thought (CoT)', 'Max tokens = 1', 'Quantization'], 0, 'Chain-of-Thought prompts the model to break complex problems into sequential reasoning steps.')
], 'threshold', ['prompting', 'llm', 'course']);

add('embeddings', 'Vector Embeddings & Semantic Search', 'GenAI & Agents', 'Turning text into geometric vectors and searching by meaning, not keywords.', [
  ['Text as High-Dimensional Vectors', 'An embedding model transforms words, sentences, or documents into an array of floats (e.g. 1536 dimensions). Words with similar meanings end up close to each other in vector space, regardless of exact phrasing.'],
  ['Cosine Similarity & Semantic Distance', 'Unlike SQL LIKE "%cat%", semantic search measures the cosine of the angle between two embedding vectors. "automobile repair" and "car mechanic" have a cosine similarity near 0.95 despite sharing zero words.'],
  ['Vector Databases (Chroma, Pinecone, FAISS)', 'Standard databases cannot search millions of 1536-dim vectors efficiently. Vector DBs use indexing algorithms like HNSW (Hierarchical Navigable Small World) to find the top-k nearest vectors in milliseconds.']
],
'import numpy as np\n\ndef cosine_similarity(a, b):\n    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))\n\n# "king" - "man" + "woman" ≈ "queen"\n# vector_db.query(query_embeddings=[q_vec], n_results=5)',
'Why does semantic vector search beat traditional keyword search for a customer support bot?',
'Users use different vocabulary (e.g., "my bill is broken" vs "invoice discrepancy"). Vector search matches the underlying intent.',
[
  q('What does an embedding model output for a given sentence?', ['A single summary word', 'A fixed-length vector of floating-point numbers', 'A decision tree'], 1, 'Embeddings represent text as continuous vectors in a semantic geometric space.'),
  q('Which metric is standard for measuring similarity between two normalized text embeddings?', ['Mean Squared Error', 'Cosine Similarity', 'Accuracy score'], 1, 'Cosine similarity measures the angle between vectors, capturing semantic closeness.')
], 'clusters', ['embedding', 'w3_ml', 'rag']);

add('generative', 'RAG: Retrieval-Augmented Generation', 'GenAI & Agents', 'Grounding LLMs in company documents to eliminate hallucinations.', [
  ['Why Foundation Models Hallucinate', 'LLMs are trained to generate fluent, statistically probable text, not to access real-time or proprietary facts. Asking a base LLM about your internal company wiki guarantees confident-sounding hallucinations.'],
  ['The 3-Step RAG Pipeline', '1. Chunk & Index: Split private PDFs/docs into 500-token chunks and store embeddings in a vector DB. 2. Retrieve: When user asks a question, embed it and fetch the top-3 matching chunks. 3. Generate: Inject retrieved chunks into prompt: "Answer using ONLY this context: {chunks}".'],
  ['Evaluating RAG Quality', 'Separate retrieval quality from generation quality: Did the vector DB find the right source chunk? (Context Recall). Did the LLM stick strictly to the retrieved source without making things up? (Faithfulness/Grounding).']
],
'def rag_answer(user_query):\n    # 1. Retrieve top matching chunks\n    context_chunks = vector_db.search(user_query, top_k=3)\n    \n    # 2. Augment prompt with retrieved ground truth\n    prompt = f"Answer using ONLY this context:\\n{context_chunks}\\n\\nQuestion: {user_query}"\n    \n    # 3. Generate grounded response\n    return llm.generate(prompt)',
'A company policy manual updates every week. Why is RAG superior to fine-tuning the model every week?',
'Fine-tuning is expensive, slow, prone to forgetting past data, and does not provide citations. With RAG, you just update the document in the vector DB.',
[
  q('What is the primary role of Retrieval in a RAG pipeline?', ['To rewrite model weights permanently', 'To fetch relevant external facts to include in the context window', 'To speed up network bandwidth'], 1, 'Retrieval supplies relevant, up-to-date document chunks into the prompt context.'),
  q('If an LLM gives an answer unsupported by retrieved context, what is this called?', ['Overfitting', 'Hallucination', 'Regularization'], 1, 'Hallucination is when a model generates claims unsupported by factual evidence.')
], 'threshold', ['rag', 'llm', 'embedding']);

add('finetuning', 'Fine-Tuning vs RAG vs In-Context', 'GenAI & Agents', 'The corporate decision matrix: when to prompt, when to retrieve, and when to train.', [
  ['Level 1: In-Context Prompting (Fastest & Cheapest)', 'Start here. Put instructions and examples directly in the prompt. Zero setup, instant iteration. If prompt context is sufficient to solve the problem, stop here.'],
  ['Level 2: RAG (Dynamic & Factual Knowledge)', 'Use when you have a large or frequently changing knowledge base (wikis, PDFs, customer tickets) that exceeds the context window or updates frequently. Provides verifiable citations.'],
  ['Level 3: Fine-Tuning & LoRA (Style, Format & Tone)', 'Fine-tuning (adjusting weights using LoRA/QLoRA) does NOT reliably teach new factual knowledge. Use fine-tuning to teach a model a specific behavior, tone, shorthand, or complex output syntax that prompting struggles with.']
],
'# DECISION MATRIX:\n# Need new facts / changing docs? -> Use RAG\n# Need specific tone / complex formatting / lower latency? -> Fine-Tune (LoRA)\n# Need quick prototype / few examples? -> In-Context Prompting',
'A hospital wants an AI to format doctor notes into a proprietary medical EHR shorthand. RAG or Fine-Tuning?',
'Fine-tuning! The model needs to adopt a specialized syntax and formatting behavior across thousands of examples.',
[
  q('What is fine-tuning an LLM best suited for?', ['Injecting weekly updated news articles', 'Teaching a specialized tone, style, or output structure', 'Replacing vector databases'], 1, 'Fine-tuning adapts model behavior, style, and syntax, while retrieval provides dynamic facts.'),
  q('Which technique requires zero GPU retraining and gives immediate verifiable citations?', ['Pre-training from scratch', 'RAG (Retrieval-Augmented Generation)', 'Full-parameter fine-tuning'], 1, 'RAG retrieves source documents directly without model retraining.')
], 'overfit', ['llm', 'eval', 'pitfalls']);

add('agents', 'Agentic AI & Tool Use (ReAct & MCP)', 'GenAI & Agents', 'The frontier: autonomous multi-step reasoning, tool APIs, and workflows.', [
  ['The ReAct Loop: Thought, Action, Observation', 'Standard LLMs generate text and stop. An AI Agent loops autonomously: 1. Thought (Plan next move), 2. Action (Call a calculator, SQL database, or web search tool), 3. Observation (Inspect tool output), 4. Repeat until goal is met.'],
  ['Function Calling & Tool Execution', 'You define tools as JSON schemas (e.g. `get_weather(city: str)`). The model outputs structured JSON declaring which tool to call with what arguments. Your backend runs the code and feeds the return value back to the model.'],
  ['Model Context Protocol (MCP) & Multi-Agent Systems', 'MCP is an open standard allowing AI models to securely connect to external development tools, filesystems, and databases. In multi-agent systems, specialized agents (Researcher, Coder, Critic) collaborate to solve complex projects.']
],
'# The ReAct Agent Loop\nwhile not task_completed:\n    thought = agent.plan(history)\n    action = agent.decide_tool(thought)\n    if action.is_final_answer:\n        break\n    observation = execute_tool(action.tool_name, action.args)\n    history.append({"action": action, "observation": observation})',
'Why can an AI agent solve tasks that a raw LLM cannot?',
'Because agents can interact with the external world: running code, checking live databases, browsing web pages, and self-correcting mistakes.',
[
  q('What are the core steps of the ReAct agent framework?', ['Train, Test, Split', 'Thought, Action, Observation', 'Embed, Cluster, Reduce'], 1, 'ReAct interleaves reasoning (Thought) with executing tools (Action) and checking results (Observation).'),
  q('How does an LLM interact with external databases or APIs?', ['It directly modifies hardware memory', 'It emits structured function call requests that the host application executes', 'It retrains its neural weights'], 1, 'The model outputs structured tool call JSON, and the host environment runs the function and returns results.')
], 'boundary', ['agents', 'llm', 'course']);

// ==========================================
// GAMES & CHALLENGES
// ==========================================

const games = [
  { id: 'boundary', title: 'Draw the Boundary', concept: 'Classification', description: 'Adjust a separating line and inspect its mistakes.', chapter: 'foundations', kind: 'Synthetic points', goal: 'Find a boundary that separates the two classes with high accuracy.', sources: ['linear'] },
  { id: 'overfit', title: 'Overfitting Playground', concept: 'Generalisation', description: 'Compare a flexible fit with the signal beneath the noise.', chapter: 'evaluation', kind: 'Constructed illustration', goal: 'Compare low, medium, and high flexibility. Explain why zero training error can mislead.', sources: ['eval'] },
  { id: 'threshold', title: 'Threshold Tuner', concept: 'Precision & recall', description: 'Make a decision threshold visible through a confusion matrix.', chapter: 'evaluation', kind: 'Synthetic scores', goal: 'Reach at least 80% recall. Observe what happens to precision.', sources: ['metrics'] },
  { id: 'gradient', title: 'Gradient Descent', concept: 'Optimisation', description: 'Take real gradient steps and see convergence or divergence.', chapter: 'linear', kind: 'Exact quadratic objective', goal: 'Reach a loss below 0.01 without diverging.', sources: ['gradient'] },
  { id: 'clusters', title: 'Cluster Detective', concept: 'K-means', description: 'Step through assignment and centroid updates.', chapter: 'clustering', kind: 'Synthetic points', goal: 'Run iterations to convergence, then compare k = 2 and k = 3.', sources: ['cluster'] },
  { id: 'iris', title: 'Iris Model Lab', concept: 'Nearest neighbours', description: 'Train and evaluate a classifier on published flower measurements.', chapter: 'problems', kind: 'Real UCI dataset', goal: 'Compare k = 1, 5, and 15 on the fixed holdout. Inspect the confusion matrix.', sources: ['iris', 'intro'] }
];

const challenges = [
  ['sales', 'A shop wants to predict next month’s sales.', 'Use a seasonal or recent-sales baseline and evaluate on later months.', 'Shuffle all months and evaluate training accuracy.', 'Choose the biggest network first.', 'Time order matters. Future prediction needs a split that reflects the future.', 'linear'],
  ['rare', 'Only 1% of messages are urgent. A model predicts “not urgent” every time.', 'Inspect urgent-case recall and precision, not just overall accuracy.', 'Launch because accuracy is 99%.', 'Report accuracy with more decimals.', 'The system misses every urgent message. High accuracy hides that failure.', 'evaluation'],
  ['groups', 'You have purchase histories but no segment labels.', 'Explore clustering after deciding how to represent similarity.', 'Regress against customer ID.', 'Claim discovered clusters are objectively true customer types.', 'Clustering explores structure; the representation and interpretation matter.', 'clustering'],
  ['leakage', 'A default model uses collections status recorded after default.', 'Remove this future-derived feature and re-evaluate.', 'Keep it because it improves accuracy.', 'Add more layers.', 'The information is unavailable at the intended prediction time.', 'foundations'],
  ['memorise', 'A model memorises every training example.', 'Compare with a baseline on representative unseen data.', 'Trust its perfect training score.', 'Assume more memory means better reasoning.', 'Generalisation, not memorisation, is the goal.', 'evaluation'],
  ['handbook', 'A handbook changes every week. Employees need supported answers.', 'Try permission-aware retrieval with answer-support evaluation.', 'Fine-tune once and assume the facts stay current.', 'Disable citations to reduce clutter.', 'Retrieval can supply changing documents; it still needs quality checks.', 'generative'],
  ['scale', 'A distance model uses annual income and a 0–1 satisfaction score.', 'Investigate scaling within each training fold.', 'Assume units never matter.', 'Scale using the whole dataset before splitting.', 'Magnitude can dominate distance. Learn transformations only on training data.', 'clustering'],
  ['tabular', 'You have 3,000 labelled rows and limited compute.', 'Start with simple baselines and compare suitable tabular models.', 'Assume deep learning must win.', 'Choose by training score only.', 'The dataset, evaluation, and constraints should drive the choice.', 'trees'],
  ['prompt', 'An LLM returns unpredictable conversational responses when you need strict database JSON.', 'Enforce a structured JSON output schema and provide few-shot examples.', 'Increase temperature to 1.5.', 'Add more exclamation points to the prompt.', 'Structured schema enforcement and few-shot formatting reliably constrain LLM output.', 'prompting'],
  ['agent', 'An autonomous AI agent gets stuck calling the same failing tool repeatedly.', 'Implement a maximum retry step limit and reflection/fallback loop.', 'Run the agent in an infinite loop.', 'Disable logging to reduce token count.', 'Production agents require loop breakers, max iteration limits, and reflection fallbacks.', 'agents']
].map((x, i) => ({ id: x[0], question: x[1], options: i % 2 ? [x[3], x[2], x[4]] : [x[2], x[3], x[4]], correct: i % 2 ? 1 : 0, explanation: x[5], chapter: x[6] }));

fs.writeFileSync('dist/course.json', JSON.stringify({ reviewed: '2026-09-21', refs, chapters, games, challenges }, null, 2));
console.log(`Generated dist/course.json with ${chapters.length} chapters across 2 tracks, ${games.length} games, and ${challenges.length} challenges.`);
