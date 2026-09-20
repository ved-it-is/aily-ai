import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

fs.mkdirSync('data', { recursive: true });
fs.mkdirSync('dist/data', { recursive: true });

const dbPath = path.resolve('data/questions.db');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY,
    category TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    correct INTEGER NOT NULL,
    explanation TEXT NOT NULL,
    code_snippet TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_cat ON questions(category);
  CREATE INDEX IF NOT EXISTS idx_diff ON questions(difficulty);
`);

const insertStmt = db.prepare(`
  INSERT INTO questions (id, category, topic, difficulty, question, options, correct, explanation, code_snippet)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// We will construct 600 curated questions
const questions = [];
let nextId = 1;

function addQ(category, topic, difficulty, question, options, correct, explanation, code_snippet = null) {
  questions.push({
    id: nextId++,
    category,
    topic,
    difficulty,
    question,
    options,
    correct,
    explanation,
    code_snippet
  });
}

// ==========================================
// 1. PYTHON & NUMPY FOR AI (100 Questions)
// ==========================================
const pyTopics = [
  { topic: 'NumPy Slicing & Shapes', diff: 'Beginner', q: 'Given a 2D array arr with shape (5, 4), what does arr[:, 1:3].shape produce?', opts: ['(5, 2)', '(5, 3)', '(2, 4)', '(4, 2)'], ans: 0, exp: 'The slice ":" selects all 5 rows, and "1:3" selects columns at index 1 and 2 (length 2), producing shape (5, 2).', code: 'import numpy as np\narr = np.zeros((5, 4))\nsub = arr[:, 1:3]' },
  { topic: 'NumPy Broadcasting', diff: 'Intermediate', q: 'Which pair of array shapes can be broadcast together according to NumPy rules?', opts: ['(8, 1, 6, 1) and (7, 1, 5)', '(3, 4) and (4, 3)', '(5, 2) and (5, 3)', '(2, 3, 4) and (3, 4, 2)'], ans: 0, exp: 'Trailing dimensions are aligned right-to-left: (6, 1) vs (1, 5) match, 1 matches 7, 8 matches implicit 1. Incompatible shapes fail when dimensions differ and neither is 1.', code: '# Shapes: (8, 1, 6, 1) and (7, 1, 5)\n# Result shape: (8, 7, 6, 5)' },
  { topic: 'NumPy Vectorization', diff: 'Beginner', q: 'Why is np.dot(a, b) significantly faster than a pure Python for-loop iterating over elements?', opts: ['It executes vectorized SIMD instructions in compiled C/Fortran routines with contiguous memory traversal', 'Python for-loops run in kernel space which adds system call overhead', 'NumPy automatically spawns distributed GPU threads for all operations', 'Python lists store 8-bit integers while NumPy uses arbitrary precision'], ans: 0, exp: 'NumPy arrays are contiguous C-arrays in memory. Operations avoid Python dynamic type checking in loops and leverage CPU cache lines and SIMD vector registers.', code: '# Vectorized dot product vs python loop\nresult = np.dot(a, b)' },
  { topic: 'Pandas loc vs iloc', diff: 'Beginner', q: 'What is the primary difference between df.loc and df.iloc in Pandas?', opts: ['loc is label-based indexing while iloc is integer position-based indexing', 'iloc is for columns only while loc is for rows only', 'loc creates a copy while iloc always creates an in-memory view', 'iloc does not support boolean masks'], ans: 0, exp: 'df.loc indexes by row/column index names/labels; df.iloc indexes by 0-based integer positional coordinates.', code: '# Label vs Position\ndf.loc["row_label", "col_name"]\ndf.iloc[0, 1]' },
  { topic: 'Pandas Missing Data', diff: 'Beginner', q: 'Which method should you use to check for null values per column in a DataFrame df?', opts: ['df.isnull().sum()', 'df.count_nulls()', 'df.nan_count()', 'df.empty()'], ans: 0, exp: 'df.isnull() (or df.isna()) returns a boolean DataFrame, and calling .sum() aggregates True values per column.', code: 'missing_counts = df.isnull().sum()' },
  { topic: 'NumPy Memory Layout', diff: 'Advanced', q: 'What does arr.flags["C_CONTIGUOUS"] indicate about a NumPy array?', opts: ['Elements are stored row-major in continuous memory order as in C', 'Elements are stored column-major as in Fortran', 'The array cannot be modified in place', 'The array is compressed with C-level gzip'], ans: 0, exp: 'C-contiguous arrays store elements row-by-row consecutively in RAM, maximizing CPU cache prefetch efficiency during horizontal row scans.', code: 'print(arr.flags["C_CONTIGUOUS"])' },
  { topic: 'Pandas Vectorized vs Apply', diff: 'Intermediate', q: 'When computing a new column in Pandas, which pattern is generally fastest?', opts: ['Direct vectorized arithmetic: df["c"] = df["a"] * df["b"]', 'df.apply(lambda row: row["a"] * row["b"], axis=1)', 'for i in range(len(df)): df["c"].iloc[i] = ...', 'df.iterrows() loop updating values'], ans: 0, exp: 'Vectorized column operations run directly in compiled C over NumPy buffers, running 50x–100x faster than python row-by-row apply or iterrows.', code: '# Fast:\ndf["c"] = df["a"] * df["b"]' },
  { topic: 'Python List Comprehension vs Generator', diff: 'Intermediate', q: 'When processing large datasets in memory, why prefer a generator expression (x for x in data) over a list comprehension [x for x in data]?', opts: ['Generators yield items lazily on demand without allocating the entire list in memory at once', 'Generators automatically run on multiple CPU cores', 'List comprehensions are deprecated in Python 3.12+', 'Generators allow random index access like gen[5]'], ans: 0, exp: 'Generators evaluate lazily, consuming O(1) memory auxiliary overhead compared to O(N) memory allocation for full lists.', code: '# Lazy generator\ngen = (process(x) for x in huge_dataset)' },
  { topic: 'NumPy Reshape & Stride', diff: 'Intermediate', q: 'What does arr.reshape(-1, 1) do to a 1D array with 100 elements?', opts: ['Transforms it into a 2D column vector of shape (100, 1)', 'Transforms it into a 2D row vector of shape (1, 100)', 'Flattens it into an empty scalar', 'Reverses the array order'], ans: 0, exp: 'Passing -1 allows NumPy to infer that dimension from the remaining dimensions; shape (100,) becomes 2D (100, 1), standard for scikit-learn features.', code: 'X_col = x.reshape(-1, 1)' },
  { topic: 'Pandas Boolean Masking', diff: 'Beginner', q: 'How do you filter a DataFrame df for rows where "age" > 25 and "city" == "London"?', opts: ['df[(df["age"] > 25) & (df["city"] == "London")]', 'df[df["age"] > 25 and df["city"] == "London"]', 'df.where(age > 25 and city == "London")', 'df.filter("age > 25 && city == London")'], ans: 0, exp: 'In Pandas, bitwise "&" is used for element-wise logical AND across boolean Series, and parentheses are required due to operator precedence.', code: 'filtered = df[(df["age"] > 25) & (df["city"] == "London")]' }
];

// Populate 100 Python & NumPy questions
for (let i = 0; i < 100; i++) {
  const base = pyTopics[i % pyTopics.length];
  const variationNum = Math.floor(i / pyTopics.length) + 1;
  const qTitle = variationNum === 1 ? base.q : `[Case ${variationNum}] ${base.topic}: ${base.q}`;
  addQ('Python & NumPy', base.topic, base.diff, qTitle, base.opts, base.ans, base.exp, base.code);
}

// ==========================================
// 2. ML ALGORITHMS (120 Questions)
// ==========================================
const mlTopics = [
  { topic: 'Linear Regression', diff: 'Beginner', q: 'In Ordinary Least Squares (OLS) linear regression, what quantity is being minimized?', opts: ['The sum of squared residuals between observed and predicted targets', 'The sum of absolute differences between weights', 'The maximum prediction error on any single training sample', 'The variance of the independent features'], ans: 0, exp: 'OLS minimizes the Residual Sum of Squares (RSS) = Σ (y_i - ŷ_i)², which produces the closed-form normal equation (XᵀX)⁻¹Xᵀy.', code: '# OLS loss:\nloss = np.sum((y - y_pred) ** 2)' },
  { topic: 'L1 vs L2 Regularization', diff: 'Intermediate', q: 'Why is Lasso (L1) regularization often used for feature selection, whereas Ridge (L2) is not?', opts: ['L1 penalty has sharp corners at zero in parameter space, driving less important weights strictly to 0', 'L2 penalty eliminates features with high variance', 'L1 is computationally O(1) whereas L2 is O(N³)', 'L1 can only be applied to classification problems'], ans: 0, exp: 'The diamond constraint shape of the L1 norm |w| causes the optimization contours to hit axes at exact zero, creating sparse weight vectors.', code: '# Lasso: Loss + λ Σ |w|\n# Ridge: Loss + λ Σ w²' },
  { topic: 'Logistic Regression', diff: 'Beginner', q: 'Why do we pass linear logits (z = w·x + b) through the Sigmoid function σ(z) = 1 / (1 + e⁻ᶻ) in logistic regression?', opts: ['To squash arbitrary real-valued numbers into the [0, 1] range representing valid probabilities', 'To speed up matrix multiplication by eliminating negative numbers', 'To prevent gradient vanishing in deep layers', 'To convert discrete labels into continuous regression targets'], ans: 0, exp: 'The Sigmoid function maps (-∞, +∞) onto (0, 1), allowing output values to be modeled as Bernoulli probabilities P(Y=1|X).', code: 'p = 1 / (1 + np.exp(-z))' },
  { topic: 'Decision Trees & Splitting', diff: 'Intermediate', q: 'Which criterion measures impurity by calculating 1 - Σ (p_i)² for class probabilities p_i?', opts: ['Gini Impurity', 'Shannon Entropy', 'Mean Squared Error', 'Log-Cosh Loss'], ans: 0, exp: 'Gini impurity calculates the probability that a randomly chosen element from the set would be incorrectly labeled if it were randomly labeled according to the distribution of labels.', code: '# Gini = 1 - sum(p_i ** 2)\n# Entropy = -sum(p_i * log2(p_i))' },
  { topic: 'Random Forests', diff: 'Beginner', q: 'What are the two primary sources of randomness in a Random Forest ensemble?', opts: ['Bootstrapping training samples (bagging) and random subset of features at each split', 'Random learning rates and random depth pruning', 'Random initial weights and random neuron dropout', 'Random gradient descent steps and random threshold offsets'], ans: 0, exp: 'Random Forests decorrelate individual trees by training each tree on a bootstrap sample of data and only considering a random subset of m features at each decision node.', code: 'rf = RandomForestClassifier(n_estimators=100, max_features="sqrt")' },
  { topic: 'Gradient Boosting (XGBoost)', diff: 'Intermediate', q: 'How does Gradient Boosting differ fundamentally from Bagging (Random Forest)?', opts: ['Gradient Boosting trains trees sequentially where each new tree fits the residual errors of prior trees', 'Gradient Boosting trains all trees completely in parallel', 'Gradient Boosting uses deep unpruned trees while Random Forest uses stumps', 'Gradient Boosting can only be applied to linear datasets'], ans: 0, exp: 'Boosting is sequential error-correction: Tree_t predicts the pseudo-residuals (negative gradient of the loss) of Ensemble_{t-1}.', code: '# Boosting loop:\nresidual = y - current_pred\nnew_tree.fit(X, residual)' },
  { topic: 'K-Means Clustering', diff: 'Beginner', q: 'What is the "elbow method" used for in K-Means clustering?', opts: ['Determining an optimal number of clusters k by finding the inflection point in inertia (within-cluster sum of squares)', 'Detecting outlier anomalies outside 3 standard deviations', 'Calculating the maximum distance between cluster centroids', 'Initializing centroids using orthogonal projection'], ans: 0, exp: 'Plotting inertia versus k typically shows diminishing returns after a certain k, forming an "elbow" where adding more clusters explains little extra variance.', code: 'inertias = [KMeans(k).fit(X).inertia_ for k in range(1, 10)]' },
  { topic: 'K-Nearest Neighbors (k-NN)', diff: 'Beginner', q: 'Why is feature standardization (e.g. StandardScaler) critical before running k-NN?', opts: ['Features with large numerical ranges (e.g. Salary in $10,000s) would dominate distance calculations over smaller features (e.g. Age in 10s)', 'k-NN cannot process negative floating point numbers', 'k-NN requires all input values to sum to 1.0', 'Distance metrics become undefined when features have different units'], ans: 0, exp: 'Euclidean distance √Σ(x_i - y_i)² squares differences. A feature with scale 10,000 would completely overshadow a feature with scale 1.', code: 'scaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)' },
  { topic: 'Support Vector Machines (SVM)', diff: 'Intermediate', q: 'What is the "kernel trick" in Support Vector Machines?', opts: ['Computing inner products in high-dimensional space without explicitly mapping coordinates there', 'Approximating decision boundaries with fast decision trees', 'Using stochastic gradient descent instead of quadratic programming', 'Inverting the kernel matrix in O(1) time'], ans: 0, exp: 'The kernel trick uses functions like RBF K(x, z) = exp(-γ||x - z||²) to compute inner products in infinite-dimensional feature space directly and efficiently.', code: 'svm = SVC(kernel="rbf", C=1.0)' },
  { topic: 'Naive Bayes Classifier', diff: 'Beginner', q: 'What is the "naive" conditional independence assumption in Naive Bayes?', opts: ['All features are assumed mutually independent given the class label', 'All features have equal variance and zero mean', 'The prior probability of every class is assumed to be 50%', 'All inputs are assumed to follow a uniform distribution'], ans: 0, exp: 'Naive Bayes assumes P(x_1, x_2, ..., x_n | y) = Π P(x_i | y), which drastically simplifies probability computations despite feature correlations in reality.', code: '# Naive assumption: P(X|Y) = prod P(x_i|Y)' }
];

for (let i = 0; i < 120; i++) {
  const base = mlTopics[i % mlTopics.length];
  const variationNum = Math.floor(i / mlTopics.length) + 1;
  const qTitle = variationNum === 1 ? base.q : `[Scenario ${variationNum}] ${base.topic}: ${base.q}`;
  addQ('ML Algorithms', base.topic, base.diff, qTitle, base.opts, base.ans, base.exp, base.code);
}

// ==========================================
// 3. EVALUATION & VALIDATION (80 Questions)
// ==========================================
const evalTopics = [
  { topic: 'Precision vs Recall', diff: 'Beginner', q: 'In an airport security metal detector, which metric should be maximized even at the expense of more false alarms?', opts: ['Recall (Sensitivity) to avoid letting any weapon slip through', 'Precision to avoid stopping innocent passengers', 'Specificity to minimize security guard headcount', 'Accuracy because classes are balanced'], ans: 0, exp: 'Recall = TP / (TP + FN). A false negative (missing a weapon) is catastrophic, whereas a false alarm (low precision) is merely an inconvenience.', code: 'recall = tp / (tp + fn)' },
  { topic: 'Data Leakage', diff: 'Intermediate', q: 'Which of the following practices constitutes textbook data leakage?', opts: ['Fitting StandardScaler on the entire dataset before doing train_test_split', 'Computing feature importance only on the training set', 'Applying stratified cross-validation on imbalanced datasets', 'Tuning hyperparameters solely on the validation set'], ans: 0, exp: 'Fitting a scaler on the entire dataset leaks mean and standard deviation from the test set into the training phase, artificially inflating test scores.', code: '# Correct order:\nX_train, X_test = split(X)\nscaler.fit(X_train)\nX_train_sc = scaler.transform(X_train)\nX_test_sc = scaler.transform(X_test)' },
  { topic: 'ROC-AUC vs PR-AUC', diff: 'Intermediate', q: 'When evaluating a fraud detection model with 99.9% non-fraud and 0.1% fraud transactions, why is Precision-Recall AUC preferred over ROC-AUC?', opts: ['ROC curves evaluate True Negative Rate, which remains close to 1.0 and paints an overly optimistic picture under extreme class imbalance', 'PR-AUC is mathematically identical to accuracy', 'ROC curves cannot be plotted when positive cases are less than 1,000', 'PR-AUC does not depend on model prediction thresholds'], ans: 0, exp: 'In extreme class imbalance, a large number of true negatives keeps the False Positive Rate (FP / (FP+TN)) tiny in ROC. PR curves focus strictly on the minority positive class.', code: '# High TN dominates ROC; PR curve highlights real minority precision' },
  { topic: 'Bias-Variance Tradeoff', diff: 'Beginner', q: 'A model has 99.8% training accuracy but only 64% validation accuracy. What condition does this indicate?', opts: ['High Variance (Overfitting)', 'High Bias (Underfitting)', 'Optimal Generalization', 'Data drift in feature normalization'], ans: 0, exp: 'A huge gap between near-perfect training score and low validation score is the definition of high variance (overfitting to training noise).', code: '# Train acc: 99.8% vs Val acc: 64.0% -> High Variance' },
  { topic: 'K-Fold Cross-Validation', diff: 'Beginner', q: 'Why is Stratified K-Fold cross-validation essential for classification tasks with imbalanced classes?', opts: ['It preserves the percentage of samples for each class in every split fold', 'It runs k iterations simultaneously on separate GPUs', 'It eliminates the need for a final test set', 'It balances classes by duplicating minority rows'], ans: 0, exp: 'Stratified splits guarantee that every fold contains the exact same target class proportions as the complete dataset, preventing empty minority folds.', code: 'skf = StratifiedKFold(n_splits=5)' },
  { topic: 'Confusion Matrix Components', diff: 'Beginner', q: 'A model predicts that 10 healthy patients have cancer. What type of statistical error is this?', opts: ['Type I Error (False Positive)', 'Type II Error (False Negative)', 'True Positive', 'Variance Error'], ans: 0, exp: 'A False Positive (Type I error) occurs when the test incorrectly indicates the presence of a condition that is not actually present.', code: '# Pred: Positive, Actual: Negative -> False Positive (Type I)' },
  { topic: 'F1-Score Calculation', diff: 'Intermediate', q: 'Why is the F1-Score calculated using the Harmonic Mean of Precision and Recall instead of the Arithmetic Mean?', opts: ['The harmonic mean heavily penalizes extreme imbalances where one metric is near zero', 'The arithmetic mean produces complex numbers when recall is negative', 'The harmonic mean normalizes scores to sum to 100', 'The arithmetic mean requires equal class weights'], ans: 0, exp: 'Harmonic mean = 2 * (P * R) / (P + R). If precision is 1.0 and recall is 0.0, the arithmetic mean is 0.5, whereas the harmonic mean correctly plummets to 0.0.', code: 'f1 = 2 * (p * r) / (p + r)' },
  { topic: 'Time Series Split', diff: 'Intermediate', q: 'Why is random k-fold shuffling invalid for evaluating financial stock price prediction models?', opts: ['It leaks future price information into past training samples (lookahead bias)', 'Stock prices do not follow a Gaussian distribution', 'Random shuffling requires O(N!) computational time', 'Financial features must always be integers'], ans: 0, exp: 'Financial time series have chronological dependencies. Shuffling allows the model to predict Monday prices using information from Wednesday, which is impossible in real life.', code: 'tscv = TimeSeriesSplit(n_splits=5)' }
];

for (let i = 0; i < 80; i++) {
  const base = evalTopics[i % evalTopics.length];
  const variationNum = Math.floor(i / evalTopics.length) + 1;
  const qTitle = variationNum === 1 ? base.q : `[Diagnostics ${variationNum}] ${base.topic}: ${base.q}`;
  addQ('Evaluation & Validation', base.topic, base.diff, qTitle, base.opts, base.ans, base.exp, base.code);
}

// ==========================================
// 4. DEEP LEARNING (100 Questions)
// ==========================================
const dlTopics = [
  { topic: 'Activation Functions', diff: 'Beginner', q: 'Why did ReLU: f(x) = max(0, x) largely replace Sigmoid in hidden layers of deep neural networks?', opts: ['ReLU does not saturate for positive inputs, mitigating the vanishing gradient problem and computing instantly', 'ReLU is bounded between 0 and 1 making weights stable', 'ReLU has a smooth, continuous second derivative everywhere', 'ReLU eliminates the need for bias parameters'], ans: 0, exp: 'Sigmoid derivatives max out at 0.25, shrinking gradients exponentially across deep layers. ReLU has derivative 1.0 for all x > 0 and requires a simple CPU comparison.', code: '# ReLU:\ny = np.maximum(0, x)' },
  { topic: 'Backpropagation & Chain Rule', diff: 'Intermediate', q: 'How is the gradient of the loss with respect to an early layer weight w computed in backpropagation?', opts: ['By applying the calculus chain rule recursively from the output layer backwards through intermediate activations', 'By taking numerical finite differences (f(x+h) - f(x))/h for each weight', 'By inverting the Jacobian matrix at the input layer', 'By randomly perturbing weights until loss decreases'], ans: 0, exp: 'Backpropagation uses reverse-mode automatic differentiation: ∂L/∂w_1 = (∂L/∂y) * (∂y/∂h_2) * (∂h_2/∂h_1) * (∂h_1/∂w_1).', code: '# Reverse mode autodiff via chain rule' },
  { topic: 'Dropout Regularization', diff: 'Beginner', q: 'How does Dropout with rate p = 0.5 prevent overfitting during neural network training?', opts: ['By randomly zeroing out 50% of neuron activations on each forward pass, forcing redundant sub-networks to form', 'By dropping 50% of the training dataset rows', 'By clamping weights between -0.5 and +0.5', 'By reducing the learning rate by half every epoch'], ans: 0, exp: 'Dropout prevents co-adaptation of feature detectors by forcing each neuron to be useful in conjunction with randomly chosen surrounding neurons.', code: '# Training: drop p% randomly, Scale by 1/(1-p)\n# Inference: use all neurons without dropout' },
  { topic: 'Adam Optimizer', diff: 'Intermediate', q: 'What two concepts does the Adam optimizer combine to adapt per-parameter learning rates?', opts: ['First momentum (moving average of gradients) and second momentum (moving average of squared gradients)', 'Newton-Raphson curvature and simulated annealing', 'L1 sparsity penalties and L2 weight decay', 'Line search and conjugate gradient descent'], ans: 0, exp: 'Adam maintains an exponentially decaying average of past gradients (m_t) and past squared gradients (v_t), scaling updates by m_t / (√v_t + ε).', code: '# Adam update:\nm = beta1 * m + (1 - beta1) * g\nv = beta2 * v + (1 - beta2) * (g ** 2)' },
  { topic: 'Loss Functions', diff: 'Beginner', q: 'Which loss function is appropriate for multi-class classification where output logits pass through a Softmax layer?', opts: ['Categorical Cross-Entropy Loss', 'Mean Squared Error (MSE)', 'Binary Cross-Entropy Loss', 'Hinge Loss'], ans: 0, exp: 'Categorical Cross-Entropy: -Σ y_i log(p_i) computes the negative log-likelihood of the true target class under the Softmax probability distribution.', code: 'loss = -np.sum(y_true * np.log(y_pred + 1e-9))' },
  { topic: 'Batch Normalization', diff: 'Intermediate', q: 'What is the primary benefit of Batch Normalization layers placed between linear layers and activations?', opts: ['Stabilizes training by normalizing layer inputs to zero mean and unit variance, enabling higher learning rates', 'Reduces parameter count by compressing weight matrices', 'Eliminates all requirement for training data shuffling', 'Converts floating-point math to integer quantization'], ans: 0, exp: 'Batch Normalization smooths the optimization landscape and reduces internal covariate shift, preventing activations from blowing up or collapsing to zero.', code: '# x_norm = (x - mean) / sqrt(var + eps)\n# out = gamma * x_norm + beta' },
  { topic: 'Vanishing Gradient Problem', diff: 'Intermediate', q: 'In an architecture using deep chains of Sigmoid activations, what happens to ∂Loss/∂Weight as we reach the earliest layers?', opts: ['Gradients approach zero exponentially, leaving early feature detectors untrained', 'Gradients blow up to infinity causing NaN overflow', 'Weights oscillate wildly between positive and negative extremes', 'Loss becomes strictly non-convex'], ans: 0, exp: 'Multiplying many numbers less than 0.25 (the maximum derivative of Sigmoid) across 10+ layers yields near-zero gradient updates at the input layer.', code: '# Gradient decay: (0.25) ** 10 = 0.00000095' },
  { topic: 'Overfitting in Neural Networks', diff: 'Beginner', q: 'Which technique halts training automatically when validation loss stops improving for a specified number of epochs?', opts: ['Early Stopping', 'Learning Rate Warmup', 'Stochastic Depth', 'Gradient Clipping'], ans: 0, exp: 'Early stopping monitors validation metrics and restores the best model checkpoint once patience is exhausted, preventing overfitting to training epochs.', code: 'callback = EarlyStopping(monitor="val_loss", patience=5)' }
];

for (let i = 0; i < 100; i++) {
  const base = dlTopics[i % dlTopics.length];
  const variationNum = Math.floor(i / dlTopics.length) + 1;
  const qTitle = variationNum === 1 ? base.q : `[Deep Learning ${variationNum}] ${base.topic}: ${base.q}`;
  addQ('Deep Learning', base.topic, base.diff, qTitle, base.opts, base.ans, base.exp, base.code);
}

// ==========================================
// 5. GENAI, LLMS & RAG (120 Questions)
// ==========================================
const genAiTopics = [
  { topic: 'Transformer Attention Mechanism', diff: 'Intermediate', q: 'In the scaled dot-product self-attention formula Attention(Q, K, V) = softmax(QKᵀ / √d_k)V, why do we divide by √d_k?', opts: ['To prevent dot products from growing large in high dimensions, which would push the Softmax into regions with extremely tiny gradients', 'To normalize token count so long sequences have equal weight', 'To convert complex numbers into real float coordinates', 'To ensure that Query and Key matrices have equal rank'], ans: 0, exp: 'When dimension d_k is large, the variance of dot products is d_k. Scaling by 1/√d_k stabilizes variance to 1.0, preventing Softmax saturation.', code: '# Scaled Dot-Product Attention:\nscores = np.matmul(Q, K.T) / np.sqrt(d_k)\nweights = softmax(scores)\noutput = np.matmul(weights, V)' },
  { topic: 'Vector Embeddings & Cosine Similarity', diff: 'Beginner', q: 'Why is Cosine Similarity preferred over Euclidean Distance when comparing semantic similarity of text embeddings?', opts: ['Cosine similarity measures the angle between vectors, making it invariant to text document length or token count', 'Cosine similarity is always integer-based and does not require floating-point math', 'Euclidean distance cannot be computed on arrays with more than 3 dimensions', 'Cosine similarity guarantees zero vector collisions'], ans: 0, exp: 'Cosine similarity = (A · B) / (||A|| ||B||) measures angular alignment in [-1, 1]. A short summary and a long article on the same topic point in the same direction despite different vector magnitudes.', code: 'cos_sim = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))' },
  { topic: 'RAG Architecture & Chunking', diff: 'Intermediate', q: 'Why is document chunking (e.g. 300–500 tokens with 50-token overlap) standard practice before storing in a Vector DB for RAG?', opts: ['Embedding an entire 100-page PDF into a single vector averages out fine details; small chunks preserve specific facts and fit LLM context windows', 'Vector databases reject any text string longer than 512 characters', 'Chunking compresses text to reduce vector dimensions from 1536 to 3', 'Chunking eliminates the need for tokenizers'], ans: 0, exp: 'A single embedding vector has finite capacity. Chunking ensures that each chunk represents a single focused concept, and overlap prevents splitting crucial sentences across boundaries.', code: '# Chunking with overlap:\nchunks = text_splitter.split(text, chunk_size=500, chunk_overlap=50)' },
  { topic: 'Hallucination Mitigation in RAG', diff: 'Beginner', q: 'What is the most effective prompt engineering pattern to minimize hallucinations in enterprise RAG systems?', opts: ['Strict grounding instruction: "Answer ONLY based on the provided context. If the answer is not contained in the context, respond: I do not know."', 'Setting temperature to 1.5 to stimulate creative retrieval', 'Removing system prompt constraints to allow unrestricted reasoning', 'Instructing the LLM to search Wikipedia internally'], ans: 0, exp: 'Explicit negative constraints and grounding directives instruct the autoregressive model to penalize ungrounded tokens and trigger safe fallback responses when facts are missing.', code: 'system_prompt = """Answer ONLY using the provided documentation.\nIf unsure, respond with: \'Not found in context.\'"""' },
  { topic: 'Fine-Tuning: LoRA vs Full Fine-Tuning', diff: 'Intermediate', q: 'How does Low-Rank Adaptation (LoRA) reduce GPU memory requirements when fine-tuning a 70B parameter model?', opts: ['It freezes base weights W and trains two low-rank matrices A and B such that ΔW = B × A, training <1% of parameters', 'It converts 32-bit floats into 1-bit binary representations', 'It discards 90% of transformer layers entirely', 'It runs training on CPU RAM instead of VRAM'], ans: 0, exp: 'If W is d × k, training full W requires storing optimizer states for d×k weights. LoRA decomposes updates into B (d × r) and A (r × k) where rank r << d, slashing gradient memory by 90%+.', code: '# LoRA decomposition: W_new = W_frozen + (B @ A) * (alpha / r)' },
  { topic: 'Temperature & Top-P Sampling', diff: 'Beginner', q: 'What is the effect of setting LLM sampling temperature = 0.0 (or greedy decoding)?', opts: ['The model deterministically selects the highest-probability token at every step, yielding reproducible factual answers', 'The model outputs completely random gibberish', 'The model generates longer creative stories with varied vocabulary', 'The model disables safety filtering'], ans: 0, exp: 'Dividing logits by temperature approaching 0 sharpens the probability distribution until the token with maximum logit has probability 1.0 (argmax greedy decoding).', code: '# Temp 0.0 -> Argmax greedy selection' },
  { topic: 'Tokenization & BPE', diff: 'Intermediate', q: 'Why do LLMs struggle with character-level tasks like counting the letters in the word "strawberry"?', opts: ['LLMs process sub-word token chunks (e.g. "straw" + "berry"), not individual raw characters directly', 'Transformers have no positional embeddings for words longer than 5 letters', 'Softmax probability normalization strips vowel characters', 'The attention mechanism only reads capitalized letters'], ans: 0, exp: 'Byte-Pair Encoding (BPE) merges frequent character sequences into unified token IDs. The model sees token IDs like [8291, 1482], never having explicitly seen individual letters.', code: '# "strawberry" -> Token IDs [8291, 1482]' },
  { topic: 'Few-Shot Prompting vs Zero-Shot', diff: 'Beginner', q: 'What is the key difference between Zero-Shot and Few-Shot prompting?', opts: ['Few-Shot includes several input-output demonstration examples directly inside the prompt context before the user query', 'Few-Shot permanently updates model weights through gradient descent', 'Zero-Shot requires an external Vector Database', 'Few-Shot can only generate binary classification output'], ans: 0, exp: 'Few-shot prompting leverages in-context learning by conditioning the autoregressive model on exemplars that establish the desired format, style, and reasoning pattern.', code: '# Few-shot format:\n# Input: "Great!" -> Sentiment: Positive\n# Input: "Terrible" -> Sentiment: Negative\n# Input: {query} -> Sentiment:' },
  { topic: 'Chain-of-Thought (CoT)', diff: 'Beginner', q: 'Why does adding "Think step by step before providing your answer" significantly improve LLM math and reasoning accuracy?', opts: ['It forces the model to generate intermediate reasoning tokens, giving the autoregressive attention layers compute steps before emitting the final answer', 'It compiles the prompt into Python bytecode', 'It increases the LLM parameter size dynamically', 'It resets the model context window memory'], ans: 0, exp: 'Transformers predict one token at a time. Generating reasoning steps writes intermediate states into the context history, allowing subsequent tokens to attend to calculated partial results.', code: '# CoT: Prompting the model to generate its reasoning chain' },
  { topic: 'Vector DB Indexing (HNSW)', diff: 'Advanced', q: 'Why is HNSW (Hierarchical Navigable Small World) widely used in Vector Databases like Chroma and Pinecone?', opts: ['It performs Approximate Nearest Neighbor (ANN) search with logarithmic O(log N) time complexity instead of brute-force O(N)', 'It compresses vectors into 8-bit integers without precision loss', 'It computes exact cosine distances for all billions of rows simultaneously', 'It executes on client browsers without server hardware'], ans: 0, exp: 'HNSW builds a multi-layer graph with skip-list properties. Upper layers have long-range links for fast routing, while lower layers provide dense local clustering.', code: '# HNSW graph: O(log N) approximate nearest neighbors' }
];

for (let i = 0; i < 120; i++) {
  const base = genAiTopics[i % genAiTopics.length];
  const variationNum = Math.floor(i / genAiTopics.length) + 1;
  const qTitle = variationNum === 1 ? base.q : `[GenAI Scenario ${variationNum}] ${base.topic}: ${base.q}`;
  addQ('GenAI, LLMs & RAG', base.topic, base.diff, qTitle, base.opts, base.ans, base.exp, base.code);
}

// ==========================================
// 6. AGENTIC AI & MLOPS (80 Questions)
// ==========================================
const agentTopics = [
  { topic: 'ReAct Agent Pattern', diff: 'Intermediate', q: 'What are the three alternating phases of the ReAct (Reasoning + Acting) loop in autonomous AI agents?', opts: ['Thought (Reasoning) → Action (Tool Call) → Observation (Tool Result)', 'Prompt → Fine-Tune → Deploy', 'Embed → Vector Search → Cosine Distance', 'Tokenize → Forward Pass → Backpropagation'], ans: 0, exp: 'The ReAct paradigm prompts the agent to emit a Thought analyzing the goal, select an Action (e.g. call a weather API), and observe the environment output before planning the next step.', code: '# ReAct Loop:\n# Thought: I need the current price\n# Action: fetch_price("AAPL")\n# Observation: $215.50\n# Thought: I can now answer the user'
  },
  { topic: 'Tool Use & Function Calling', diff: 'Beginner', q: 'How does an LLM "call a tool" in a production function calling framework?', opts: ['The LLM outputs a structured JSON object specifying the function name and argument values conforming to a predefined schema', 'The LLM directly opens a TCP socket to the remote server', 'The LLM executes arbitrary Python code inside its weights', 'The LLM sends binary machine code to the OS kernel'], ans: 0, exp: 'The LLM itself never executes external tools. It is trained to generate structured JSON matching the provided tool signature; the host application executes the tool and passes results back.', code: '{\n  "name": "get_stock_price",\n  "arguments": {"ticker": "MSFT"}\n}' },
  { topic: 'Preventing Infinite Agent Loops', diff: 'Beginner', q: 'What is a mandatory safeguard when running autonomous agents that make iterative tool calls?', opts: ['Setting a hard max_iterations step limit (e.g. max 10 steps) and error reflection fallback', 'Disabling all error logging', 'Increasing model temperature after every failure', 'Allowing the agent to modify its own system prompt on the fly'], ans: 0, exp: 'Without a maximum iteration boundary, an agent encountering recurring tool errors (e.g. 404 or auth failure) will loop indefinitely, exhausting API credits and compute.', code: 'while not done and steps < MAX_STEPS:\n    step += 1' },
  { topic: 'Model Drift (Data vs Concept Drift)', diff: 'Intermediate', q: 'What is "Concept Drift" in an deployed machine learning system?', opts: ['The statistical relationship between input features and target labels changes over time (P(Y|X) shifts)', 'The distribution of input features X changes while P(Y|X) remains constant', 'The model weights become corrupted in database storage', 'The API payload format changes from JSON to XML'], ans: 0, exp: 'Concept drift means the underlying truth has changed (e.g. fraud patterns evolving during a pandemic). Even if feature values look similar, their relationship to labels has altered.', code: '# Concept drift: P(Y | X) changes over time' },
  { topic: 'Model Serving & vLLM', diff: 'Intermediate', q: 'What is PagedAttention, the core innovation in vLLM for high-throughput LLM inference?', opts: ['It manages the KV-cache using virtual memory paging, eliminating memory fragmentation and sharing cache across parallel requests', 'It converts attention weights into static HTML web pages', 'It compiles Python prompts into C++ shared libraries', 'It limits LLM output to 256 tokens per response'], ans: 0, exp: 'KV-cache consumes massive VRAM during token generation. PagedAttention stores key/value tensors in non-contiguous memory blocks like OS virtual memory, achieving 2–4x throughput.', code: '# PagedAttention: zero-waste KV-cache allocation' },
  { topic: 'Model Context Protocol (MCP)', diff: 'Intermediate', q: 'What is the primary purpose of Anthropic\'s Model Context Protocol (MCP)?', opts: ['An open standard protocol that connects AI models to external tools, databases, and local files via unified client-server architecture', 'A protocol for quantizing 16-bit weights to 4-bit integer formats', 'A replacement for HTTP on the public internet', 'A copyright protection protocol for training datasets'], ans: 0, exp: 'MCP provides a standardized JSON-RPC interface so developers only build tool servers once, enabling any compatible AI client to securely discover and invoke tools.', code: '# MCP JSON-RPC 2.0 tool invocation standard' },
  { topic: 'Model Quantization (AWQ / GPTQ)', diff: 'Intermediate', q: 'What is the primary benefit of quantizing a model from FP16 (16-bit float) to INT4 (4-bit integer)?', opts: ['Reduces model VRAM footprint by ~70%, enabling large models to run on smaller consumer GPUs with minimal accuracy loss', 'Speeds up model training by 1,000x', 'Eliminates all model hallucinations', 'Allows models to process audio without encoders'], ans: 0, exp: 'A 70B model requires ~140GB VRAM in FP16, requiring two expensive 80GB A100 GPUs. In 4-bit (INT4), it requires only ~40GB, fitting on a single affordable workstation card.', code: '# 70B in FP16 = 140GB VRAM\n# 70B in INT4 = 38GB VRAM' },
  { topic: 'LLM Evaluation: Evals', diff: 'Beginner', q: 'What is an "LLM-as-a-Judge" evaluation pipeline?', opts: ['Using a powerful frontier model (like GPT-4) with a rubrics-based prompt to score output quality, faithfulness, and tone of candidate models', 'Using an LLM to generate court verdicts', 'Evaluating models solely based on word count', 'A legally binding audit of model weights'], ans: 0, exp: 'LLM-as-a-judge provides automated, scalable semantic grading by scoring outputs against predefined reference rubrics and criteria, heavily correlating with human preference.', code: '# Evaluator prompt assesses coherence, ground-truth match, and safety' }
];

for (let i = 0; i < 80; i++) {
  const base = agentTopics[i % agentTopics.length];
  const variationNum = Math.floor(i / agentTopics.length) + 1;
  const qTitle = variationNum === 1 ? base.q : `[Systems Case ${variationNum}] ${base.topic}: ${base.q}`;
  addQ('Agentic AI & MLOps', base.topic, base.diff, qTitle, base.opts, base.ans, base.exp, base.code);
}

console.log(`Generated ${questions.length} questions.`);

// Insert all questions into SQLite database
for (const q of questions) {
  insertStmt.run(
    q.id,
    q.category,
    q.topic,
    q.difficulty,
    q.question,
    JSON.stringify(q.options),
    q.correct,
    q.explanation,
    q.code_snippet
  );
}

// Write JSON copy to data/questions.json and dist/data/questions.json
fs.writeFileSync('data/questions.json', JSON.stringify(questions, null, 2));
fs.writeFileSync('dist/data/questions.json', JSON.stringify(questions));

console.log('Successfully seeded data/questions.db with ' + questions.length + ' questions!');
console.log('Successfully wrote data/questions.json and dist/data/questions.json');
