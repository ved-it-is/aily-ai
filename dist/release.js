let catalog,irisRows=[],account=null,syncState='loading',syncError='',progressRows=[],pending=new Set();
const legacyPython=python,legacyExperiment=experiment,legacyAtlas=atlas;

const corporateRoles = [
  {
    id: 'genai',
    title: 'GenAI & LLM Application Engineer',
    icon: '🚀',
    demand: 'High Demand in 2026',
    salary: 'Primary industry expansion area',
    description: 'Builds enterprise AI applications powered by Foundation Models. Connects LLMs to private corporate documents via RAG, crafts few-shot prompt chains, and builds autonomous agents with tool use.',
    tech: ['Python', 'OpenAI/Anthropic APIs', 'LangChain / LlamaIndex', 'Vector DBs (Chroma/Pinecone)', 'RAG Architecture', 'ReAct Loops', 'Model Context Protocol (MCP)'],
    track: 'GenAI & Agents',
    chapters: ['prompting', 'embeddings', 'generative', 'finetuning', 'agents']
  },
  {
    id: 'ml_eng',
    title: 'Machine Learning Engineer',
    icon: '⚙️',
    demand: 'Core Corporate Pillar',
    salary: 'Foundational engineering role',
    description: 'Designs, trains, evaluates, and operationalizes predictive models. Specializes in tabular data, regression, classification, feature engineering pipelines, and high-throughput model serving.',
    tech: ['Python', 'NumPy & Pandas', 'Scikit-Learn', 'XGBoost / LightGBM', 'FastAPI', 'Docker', 'Triton / ONNX Serving'],
    track: 'ML Algorithms',
    chapters: ['foundations', 'linear', 'problems', 'trees', 'ensembles', 'clustering', 'evaluation']
  },
  {
    id: 'data_sci',
    title: 'Data Scientist & Applied ML',
    icon: '📊',
    demand: 'High Strategic Value',
    salary: 'Business & analytics driver',
    description: 'Extracts signals from raw corporate databases to drive product decisions. Builds statistical models, customer segmentations (clustering), predictive baselines, and A/B test evaluations.',
    tech: ['Python / SQL', 'Pandas & NumPy', 'Matplotlib & Seaborn', 'Linear & Logistic Regression', 'K-Means Clustering', 'A/B Testing', 'Evaluation Metrics'],
    track: 'ML Algorithms',
    chapters: ['foundations', 'linear', 'problems', 'trees', 'clustering', 'evaluation']
  },
  {
    id: 'mlops',
    title: 'AI Platform & MLOps Engineer',
    icon: '🛠️',
    demand: 'Rapidly Growing',
    salary: 'Critical infrastructure tier',
    description: 'Manages deployment infrastructure, CI/CD pipelines, and monitoring for AI systems. Guards against data drift, optimizes inference latency on GPUs, and ensures zero-downtime rollouts.',
    tech: ['Linux & Bash', 'Docker & Kubernetes', 'vLLM / Triton Server', 'Prometheus & Grafana', 'Evidently AI (Drift)', 'CI/CD Pipelines'],
    track: 'ML Algorithms',
    chapters: ['foundations', 'evaluation', 'generative', 'finetuning', 'agents']
  },
  {
    id: 'ai_research',
    title: 'AI Research & Foundation Engineer',
    icon: '🔬',
    demand: 'Specialized Frontier',
    salary: 'Deep technical specialization',
    description: 'Researches and benchmarks foundational neural architectures, pre-training dynamics, parameter-efficient fine-tuning (PEFT/LoRA), and model alignment techniques (RLHF/DPO).',
    tech: ['PyTorch', 'HuggingFace Transformers', 'PEFT / LoRA', 'CUDA / GPU Kernels', 'Attention Mechanisms', 'Loss Optimization'],
    track: 'GenAI & Agents',
    chapters: ['linear', 'ensembles', 'evaluation', 'prompting', 'embeddings', 'finetuning']
  }
];

let selectedRole = corporateRoles[0];

const sourceLinks=keys=>`<div class="source-links"><span>Primary references</span>${[...new Set(keys)].map(k=>catalog.refs[k]?`<a href="${catalog.refs[k][1]}" target="_blank" rel="noopener noreferrer">${esc(catalog.refs[k][0])} ↗</a>`:'').join('')}</div>`;
const gameLink=id=>catalog.games.find(g=>g.id===id);
const done=id=>completed.includes(id);

function headerAccount(){
  const p=document.querySelector('.profile');
  if(p) p.innerHTML=`<a href="#account">${syncState==='loading'?'Connecting…':syncState==='error'?'Sync unavailable':account?'My progress · synced':'Sign in to sync'} <b>◎</b></a>`;
}

async function loadAccount(){
  try{
    if(!window.AilyAuth?.isConfigured()){
      account=null;
      syncState='guest';
      return;
    }
    const user=await window.AilyAuth.getUser();
    if(!user){
      account=null;
      syncState='guest';
      return;
    }
    account={email:user.email,id:user.id};
    progressRows=await window.AilyAuth.loadProgress();
    completed=[...new Set([...completed,...progressRows.map(r=>r.activity_id)])];
    syncState='ready';syncError='';
  }catch(e){
    account=null;syncState='error';syncError=e.message;
  }finally{
    headerAccount();
  }
}

async function completeActivity(id,target){
  if(done(id)){if(target)target.textContent='✓ Saved to your account.';return}
  if(!account){
    if(!completed.includes(id)) completed.push(id);
    if(target) target.innerHTML='✓ Saved locally. <a href="#account" style="color:var(--purple);font-weight:600;margin-left:6px">Sign in to sync ↗</a>';
    return;
  }
  pending.add(id);if(target)target.textContent='Saving progress…';
  try{
    if(!window.AilyAuth?.isConfigured()) throw Error('Supabase is not configured.');
    const saved=await window.AilyAuth.saveProgress(id);
    if(!saved) throw Error('Could not save your progress to Supabase.');
    if(!completed.includes(id)) completed.push(id);
    progressRows.push({activity_id:id,completed_at:new Date().toISOString()});
    pending.delete(id);if(target)target.textContent='✓ Saved to your account.';
  }catch(e){
    pending.delete(id);
    if(!completed.includes(id)) completed.push(id);
    if(target){target.innerHTML=`✓ Saved in browser. <button class="button secondary retry" style="margin-left:6px;padding:3px 8px;font-size:11px">Retry Supabase sync</button>`;target.querySelector('button').onclick=()=>completeActivity(id,target)}
  }
}

function completionControl(id,label='Mark explored'){
  return `<div class="completion-row"><button class="button secondary" data-complete="${id}">${done(id)?'✓ Saved':label}</button><div class="save-status" aria-live="polite"></div></div>`;
}

function bindCompletions(){
  document.querySelectorAll('[data-complete]').forEach(b=>b.onclick=()=>completeActivity(b.dataset.complete,b.nextElementSibling));
}

chapterCards=function(list=catalog.chapters){
  return list.map(c=>`<a class="card" href="#chapter/${c.id}">
    <div class="card-top">
      <span class="icon ${c.track==='GenAI & Agents'?'green':''}">${String(catalog.chapters.indexOf(c)+1).padStart(2,'0')}</span>
      <span class="pill ${c.track==='GenAI & Agents'?'green':''}">${done(c.id)?'COMPLETED':c.track.toUpperCase()}</span>
    </div>
    <h3>${esc(c.title)}</h3>
    <p>${esc(c.summary)}</p>
    <div class="card-bottom">
      <span>${c.sections.length} CONCEPTS · ${c.checks.length} CHECKS</span>
      <span>Learn ↗</span>
    </div>
  </a>`).join('');
};

const galaxyNodes = [
  { id: 'python', name: 'Python & NumPy', icon: '🐍', x: 340, y: 35, cat: 'Foundations', link: '#python',
    desc: 'The lingua franca of AI. Vectorized arrays eliminate slow for-loops by running matrix math directly in optimized C binaries.',
    analogy: 'Contiguous C-arrays in memory. Instead of looping in Python, matrix multiplication is handled as a single SIMD vector instruction.'
  },
  { id: 'data', name: 'Training Data & Features', icon: '📊', x: 480, y: 55, cat: 'Foundations', link: '#chapter/foundations',
    desc: 'Garbage in, garbage out. Features are input columns (pixels, words, metrics); labels are the ground-truth outputs to predict.',
    analogy: 'Features are function parameters (args), and the label is the expected unit test return value.'
  },
  { id: 'linear', name: 'Linear & Logistic Models', icon: '📈', x: 580, y: 115, cat: 'Classic ML', link: '#chapter/linear',
    desc: 'Fitting lines (y = wx + b) to continuous targets or S-curves (Sigmoid) to probabilities. The cornerstone of predictive scoring.',
    analogy: 'An interpolation function that automatically learns the slope (w) and intercept (b) directly from historical test samples.'
  },
  { id: 'loss', name: 'Loss & Cost Functions', icon: '🎯', x: 585, y: 195, cat: 'Learning Loop', link: '#chapter/linear',
    desc: 'Measures how wrong the model is compared to reality (e.g. Mean Squared Error or Cross-Entropy). Lower is better.',
    analogy: 'An automated test runner that counts how many assertions failed and how severe each mismatch was.'
  },
  { id: 'gradient', name: 'Gradient Descent & Opt', icon: '⚡', x: 490, y: 265, cat: 'Learning Loop', link: '#arcade',
    desc: 'Calculates the slope (derivative) of the loss curve and nudges model weights downhill toward minimal error.',
    analogy: 'A binary search or profiler in N-dimensional space to find the exact parameter settings that minimize runtime errors.'
  },
  { id: 'trees', name: 'Decision Trees & XGBoost', icon: '🌲', x: 360, y: 275, cat: 'Classic ML', link: '#chapter/trees',
    desc: 'Hierarchical if/else splits grouped into ensembles (Random Forests, Gradient Boosting). The gold standard for business tabular data.',
    analogy: 'An automatically synthesized nested switch/if-else tree where every branch split minimizes entropy.'
  },
  { id: 'clustering', name: 'K-Means Clustering', icon: '🧩', x: 230, y: 270, cat: 'Classic ML', link: '#chapter/clustering',
    desc: 'Unsupervised grouping of unlabeled data points into clusters based on geometric distance metrics.',
    analogy: 'A spatial partitioning algorithm that groups items into buckets by distance without pre-defined category labels.'
  },
  { id: 'neural', name: 'Neural Networks (DL)', icon: '🧠', x: 120, y: 215, cat: 'Deep Learning', link: '#chapter/foundations',
    desc: 'Stacked layers of artificial neurons with non-linear activations (ReLU, Sigmoid) capable of learning any mathematical function.',
    analogy: 'Chained higher-order functions: f(g(h(x))), where hidden intermediate layers discover abstract features.'
  },
  { id: 'embeddings', name: 'Embeddings & Vectors', icon: '🌐', x: 95, y: 145, cat: 'GenAI & Agents', link: '#chapter/embeddings',
    desc: 'Converting text, audio, or code into 1536-dimensional float arrays where semantic meaning translates directly into geometric distance.',
    analogy: 'A smart hash table where inputs with similar semantic meanings hash into nearby coordinate buckets.'
  },
  { id: 'prompting', name: 'Prompt Eng & LLMs', icon: '💬', x: 125, y: 80, cat: 'GenAI & Agents', link: '#chapter/prompting',
    desc: 'Directing billion-parameter autoregressive models using few-shot exemplars, structured JSON schemas, and system contracts.',
    analogy: 'Designing a strict CLI interface or robust API contract for a probabilistic supercomputer.'
  },
  { id: 'finetuning', name: 'Fine-Tuning & LoRA', icon: '🔧', x: 220, y: 45, cat: 'GenAI & Agents', link: '#chapter/finetuning',
    desc: 'Adapting base LLMs to specific domains with Low-Rank Adaptation (LoRA) by freezing 99% of weights and training small adapter matrices.',
    analogy: 'Applying a lightweight plugin or subclass override at runtime without recompiling the entire engine.'
  },
  { id: 'agents', name: 'Agentic AI & Tool Use', icon: '🤖', x: 440, y: 150, cat: 'GenAI & Agents', link: '#chapter/agents',
    desc: 'Autonomous LLM execution loops (ReAct pattern) that reason, call external APIs, query databases, and self-correct on failure.',
    analogy: 'A while-loop event loop: while (!goalMet) { plan = llm(); action = execute(plan.tool); state = parse(action); }'
  }
];

const canonicalSynapses = [
  ['python', 'data'],
  ['data', 'linear'],
  ['linear', 'loss'],
  ['loss', 'gradient'],
  ['gradient', 'linear'],
  ['linear', 'trees'],
  ['trees', 'clustering'],
  ['data', 'neural'],
  ['neural', 'loss'],
  ['neural', 'embeddings'],
  ['embeddings', 'prompting'],
  ['prompting', 'finetuning'],
  ['prompting', 'agents'],
  ['embeddings', 'agents']
];

const synapseInsightsMap = {
  'python-data': 'NumPy vectorized arrays load raw inputs into high-speed contiguous memory buffers without Python for-loop overhead.',
  'data-linear': 'Data features (X) serve as the input arguments that the linear hypothesis (w · X + b) multiplies against.',
  'linear-loss': 'The model predicts outcomes; the loss function measures the discrepancy against ground-truth labels.',
  'loss-gradient': 'Calculus calculates partial derivatives (dLoss / dWeight) to point the exact direction downhill.',
  'gradient-linear': 'Gradient descent steps downhill, directly nudging model coefficients to minimize future prediction errors.',
  'linear-trees': 'While linear models fit flat hyperplanes, decision trees split feature dimensions orthogonally via if/else nodes.',
  'trees-clustering': 'Trees partition labeled target spaces, while clustering partitions unlabeled spatial coordinates.',
  'data-neural': 'Raw features stream directly into input neurons to begin multi-layer hierarchical feature synthesis.',
  'neural-loss': 'Forward pass activations compute the final prediction, triggering backpropagation through the chain rule.',
  'neural-embeddings': 'The pen-ultimate layer of a deep neural network emits dense semantic embedding vectors.',
  'embeddings-prompting': 'Vector embeddings retrieve relevant context chunks to enrich the dynamic prompt window of the LLM.',
  'prompting-finetuning': 'When in-context prompting reaches token or nuance limits, LoRA fine-tuning bakes patterns directly into model weights.',
  'prompting-agents': 'Structured system prompts define the persona, tool signatures, and reasoning loops of autonomous agents.',
  'embeddings-agents': 'Vector databases act as the persistent long-term associative memory for autonomous AI agents.'
};

let userSynapses = [...canonicalSynapses];
let connectSourceNode = null;
let activeAiView = 'galaxy';
let selectedGalaxyNode = galaxyNodes[1]; // Training Data
let activePortalTrack = 'ML Algorithms';
let recentSynapseMessage = null;

const flowStages = [
  {
    num: '01',
    title: 'Raw Data & Features',
    icon: '📊',
    short: 'Matrices of Floats',
    desc: 'Computers cannot understand "concepts" or raw text—they only calculate on matrices of numbers. We extract numerical features (X) and true answers (y).',
    analogy: 'Converting an unstructured JSON payload or database table into a contiguous NumPy 2D array of 64-bit floats.',
    code: '# 1. Represent features as a 2D NumPy array\nimport numpy as np\n\nX = np.array([\n    [6.0, 80],  # Student 1: 6h study, 80% attendance\n    [2.0, 45],  # Student 2: 2h study, 45% attendance\n    [8.5, 95],  # Student 3: 8.5h study, 95% attendance\n])\ny = np.array([1, 0, 1])  # Labels: 1 = Pass, 0 = Fail'
  },
  {
    num: '02',
    title: 'Model & Weights',
    icon: '⚙️',
    short: 'Parameterized Function',
    desc: 'An untrained model starts with completely random weights (W) and biases (b). It has no intelligence yet—its initial guesses are basically random coin flips.',
    analogy: 'A function `predict(x)` initialized with random coefficients `W = rand()` and `b = 0`.',
    code: '# 2. Model begins with random parameters\nweights = np.random.randn(2) * 0.01  # e.g. [0.003, -0.007]\nbias = 0.0\n\n# Forward pass (predict probability):\ndef predict(X):\n    z = np.dot(X, weights) + bias\n    return 1 / (1 + np.exp(-z))  # Sigmoid [0, 1]'
  },
  {
    num: '03',
    title: 'The Loss Function',
    icon: '🎯',
    short: 'Measuring Error',
    desc: 'The model makes a prediction, compares it against the ground truth (y), and calculates an error penalty called Loss. The worse the guess, the higher the loss.',
    analogy: 'An automated test runner that measures how far off the actual return value was from the expected assertion.',
    code: '# 3. Calculate how wrong the model is\npredictions = predict(X)\n\n# Binary Cross-Entropy Loss\nloss = -np.mean(y * np.log(predictions + 1e-9) + \\\n                (1 - y) * np.log(1 - predictions + 1e-9))\nprint(f"Current Loss: {loss:.4f}")'
  },
  {
    num: '04',
    title: 'Gradient Descent',
    icon: '⚡',
    short: 'Nudging the Weights',
    desc: 'Using calculus (derivatives), the algorithm calculates whether increasing or decreasing each weight will reduce error. It nudges every weight in the winning direction.',
    analogy: 'A binary search or profiler tuning configuration knobs until error rates drop to zero.',
    code: '# 4. Calculate gradient and step downhill\nerror = predictions - y\ngradient_w = np.dot(X.T, error) / len(X)\ngradient_b = np.mean(error)\n\nlearning_rate = 0.05\nweights -= learning_rate * gradient_w\nbias -= learning_rate * gradient_b\nprint("Updated weights:", weights)'
  },
  {
    num: '05',
    title: 'Production Inference',
    icon: '🚀',
    short: 'O(1) Matrix Serving',
    desc: 'Once the loss is minimal, we freeze the weights! In production, no training occurs—the model runs as a single lightning-fast dot product (O(1) inference).',
    analogy: 'A compiled binary function call. Fast, predictable, zero-overhead matrix multiplication in a microservice.',
    code: '# 5. Production API: Instant O(1) inference\nnew_student = np.array([7.0, 85])\npass_prob = predict(new_student)\n\nstatus = "PASS" if pass_prob >= 0.5 else "FAIL"\nprint(f"Outcome: {status} ({pass_prob * 100:.1f}% confidence)")'
  }
];

let selectedFlowStage = flowStages[0];

function renderLegacyFramedAiPainting(){
  return `
    <div class="gallery-hero-grid">
      <!-- Left: Framed Painting -->
      <div class="art-frame-container">
        <div class="art-frame">
          <div class="art-mat">
            <svg class="art-canvas-svg" viewBox="0 0 380 240" aria-label="The Emergence of Intuition — AI painting" role="img">
              <defs>
                <radialGradient id="paint-bg" cx="50%" cy="50%" r="70%">
                  <stop offset="0%" stop-color="#1a1035"/>
                  <stop offset="55%" stop-color="#0d1b3e"/>
                  <stop offset="100%" stop-color="#0a0e1a"/>
                </radialGradient>
                <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#d97706" stop-opacity="0.55"/>
                  <stop offset="100%" stop-color="#d97706" stop-opacity="0"/>
                </radialGradient>
                <filter id="soft-blur">
                  <feGaussianBlur stdDeviation="2.2"/>
                </filter>
              </defs>

              <!-- Dark canvas background -->
              <rect width="380" height="240" fill="url(#paint-bg)" rx="3"/>

              <!-- Nebula dust clouds -->
              <ellipse cx="190" cy="120" rx="140" ry="80" fill="#4f46e5" opacity="0.07" filter="url(#soft-blur)"/>
              <ellipse cx="100" cy="80" rx="80" ry="50" fill="#0099ff" opacity="0.06" filter="url(#soft-blur)"/>
              <ellipse cx="280" cy="160" rx="70" ry="45" fill="#d97706" opacity="0.07" filter="url(#soft-blur)"/>

              <!-- Golden spiral (Fibonacci / attention) -->
              <path d="M 190 120 Q 220 90 230 60 Q 240 30 210 18 Q 170 8 150 35 Q 125 65 140 100 Q 160 140 200 150 Q 250 160 270 130 Q 295 95 280 60" fill="none" stroke="#d97706" stroke-width="1.2" stroke-dasharray="3 4" opacity="0.55"/>
              <path d="M 190 120 Q 158 95 148 70 Q 138 44 162 32 Q 190 20 205 48 Q 218 78 200 100" fill="none" stroke="#d97706" stroke-width="0.8" stroke-dasharray="2 5" opacity="0.38"/>

              <!-- Neural network lines (backprop paths) -->
              <g stroke="#4f46e5" stroke-width="0.9" opacity="0.45">
                <line x1="55" y1="60" x2="130" y2="90"/>
                <line x1="55" y1="120" x2="130" y2="90"/>
                <line x1="55" y1="180" x2="130" y2="150"/>
                <line x1="130" y1="90" x2="190" y2="120"/>
                <line x1="130" y1="150" x2="190" y2="120"/>
                <line x1="190" y1="120" x2="250" y2="90"/>
                <line x1="190" y1="120" x2="250" y2="150"/>
                <line x1="250" y1="90" x2="325" y2="120"/>
                <line x1="250" y1="150" x2="325" y2="120"/>
              </g>

              <!-- Gradient nerve pulses -->
              <g stroke="#0099ff" stroke-width="1.4" opacity="0.30">
                <line x1="55" y1="60" x2="130" y2="90"/>
                <line x1="190" y1="120" x2="250" y2="90"/>
              </g>

              <!-- Input neurons -->
              <circle cx="55" cy="60" r="9" fill="#0d1b3e" stroke="#0099ff" stroke-width="1.8" opacity="0.85"/>
              <circle cx="55" cy="120" r="9" fill="#0d1b3e" stroke="#0099ff" stroke-width="1.8" opacity="0.85"/>
              <circle cx="55" cy="180" r="9" fill="#0d1b3e" stroke="#0099ff" stroke-width="1.8" opacity="0.85"/>

              <!-- Hidden neurons -->
              <circle cx="130" cy="90" r="11" fill="#1a1035" stroke="#4f46e5" stroke-width="2" opacity="0.9"/>
              <circle cx="130" cy="150" r="11" fill="#1a1035" stroke="#4f46e5" stroke-width="2" opacity="0.9"/>

              <!-- Central AI CORE — glowing gold -->
              <circle cx="190" cy="120" r="28" fill="url(#core-glow)" opacity="0.9"/>
              <circle cx="190" cy="120" r="18" fill="#1a1035" stroke="#d97706" stroke-width="2.2"/>
              <text x="190" y="116" font-size="8" fill="#d97706" font-weight="700" text-anchor="middle" font-family="'IBM Plex Mono',monospace">∇L</text>
              <text x="190" y="127" font-size="7" fill="#d97706" opacity="0.8" text-anchor="middle" font-family="'IBM Plex Mono',monospace">σ(W·X)</text>

              <!-- Output neurons -->
              <circle cx="250" cy="90" r="11" fill="#1a1035" stroke="#ea580c" stroke-width="2" opacity="0.9"/>
              <circle cx="250" cy="150" r="11" fill="#1a1035" stroke="#10b981" stroke-width="2" opacity="0.9"/>
              <circle cx="325" cy="120" r="14" fill="#1a1035" stroke="#d97706" stroke-width="2.5" opacity="0.95"/>
              <text x="325" y="124" font-size="9" fill="#d97706" font-weight="700" text-anchor="middle" font-family="'IBM Plex Mono',monospace">ŷ</text>

              <!-- Stars / floating glyphs -->
              <text x="75" y="35" font-size="8" fill="#d97706" opacity="0.4" font-family="'IBM Plex Mono',monospace">∂</text>
              <text x="300" y="55" font-size="8" fill="#4f46e5" opacity="0.45" font-family="'IBM Plex Mono',monospace">∑</text>
              <text x="310" y="190" font-size="8" fill="#0099ff" opacity="0.4" font-family="'IBM Plex Mono',monospace">⊕</text>
              <text x="30" y="210" font-size="8" fill="#ea580c" opacity="0.4" font-family="'IBM Plex Mono',monospace">λ</text>
              <text x="155" y="22" font-size="9" fill="#d97706" opacity="0.35" font-family="'IBM Plex Mono',monospace">ε→0</text>
              <circle cx="95" cy="200" r="1.2" fill="#d97706" opacity="0.5"/>
              <circle cx="345" cy="75" r="1.5" fill="#4f46e5" opacity="0.4"/>
              <circle cx="20" cy="145" r="1" fill="#0099ff" opacity="0.45"/>
              <circle cx="360" cy="200" r="1.2" fill="#ea580c" opacity="0.4"/>
            </svg>
          </div>
          <div class="frame-plaque">THE EMERGENCE OF INTUITION · 2026</div>
        </div>
      </div>

      <!-- Right: Museum Placard & Quote -->
      <div class="museum-placard">
        <span class="museum-tag">AILY · GALLERY NO. 1 · PERMANENT COLLECTION</span>
        <blockquote class="museum-quote">
          "The machine does not merely calculate numbers — it paints mathematical landscapes. Where deterministic code ends, creative intuition begins."
        </blockquote>
        <div class="museum-byline">
          <strong>On the Nature of Artificial Intelligence</strong>
          <span>A meditation on learned intuition, gradient art, and the beauty of the loss surface.</span>
        </div>
        <div class="museum-actions">
          <a class="button" href="#chapter/foundations">Begin Your Journey ➔</a>
          <a class="edition" href="#python">Python Primer ↗</a>
        </div>
      </div>
    </div>
  `;
}

function renderGalaxySvg() {
  const nodeMap = new Map(galaxyNodes.map(n => [n.id, n]));
  const core = { id: 'core', x: 340, y: 155, name: 'AI CORE' };

  let linesHtml = '';
  userSynapses.forEach(([fromId, toId]) => {
    const from = fromId === 'core' ? core : nodeMap.get(fromId);
    const to = toId === 'core' ? core : nodeMap.get(toId);
    if (!from || !to) return;
    const isConnected = selectedGalaxyNode && (selectedGalaxyNode.id === fromId || selectedGalaxyNode.id === toId);
    const stroke = isConnected ? '#6342ff' : '#cbd5e1';
    const strokeWidth = isConnected ? 2.5 : 1.5;
    const opacity = isConnected ? '0.95' : '0.55';

    linesHtml += `
      <g class="synapse-line-group">
        <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-opacity="${opacity}" stroke-linecap="round"/>
        ${isConnected ? `<circle r="3.5" fill="#6342ff" opacity="0.85"><animateMotion path="M ${from.x} ${from.y} L ${to.x} ${to.y}" dur="2.5s" repeatCount="indefinite"/></circle>` : ''}
      </g>
    `;
  });

  if (connectSourceNode) {
    linesHtml += `<circle cx="${connectSourceNode.x}" cy="${connectSourceNode.y}" r="32" fill="none" stroke="#ff5277" stroke-width="2" stroke-dasharray="4 4" opacity="0.8"><animateTransform attributeName="transform" type="rotate" from="0 ${connectSourceNode.x} ${connectSourceNode.y}" to="360 ${connectSourceNode.x} ${connectSourceNode.y}" dur="8s" repeatCount="indefinite"/></circle>`;
  }

  let nodesHtml = '';
  nodesHtml += `
    <g class="galaxy-core" style="cursor:default">
      <circle cx="${core.x}" cy="${core.y}" r="46" fill="url(#core-aura)" opacity="0.8"/>
      <circle cx="${core.x}" cy="${core.y}" r="30" fill="#ffffff" stroke="#6342ff" stroke-width="2.5" filter="drop-shadow(0 4px 12px rgba(99,66,255,0.18))"/>
      <text x="${core.x}" y="${core.y - 3}" fill="#6342ff" font-weight="800" font-size="11" text-anchor="middle" font-family="'Space Grotesk', sans-serif">AI LAB</text>
      <text x="${core.x}" y="${core.y + 11}" fill="#8b95a5" font-size="9" font-weight="600" text-anchor="middle" font-family="'IBM Plex Mono', monospace">CORE</text>
    </g>
  `;

  galaxyNodes.forEach(n => {
    const isSel = selectedGalaxyNode && selectedGalaxyNode.id === n.id;
    const isSource = connectSourceNode && connectSourceNode.id === n.id;
    const strokeColor = isSource ? '#ff5277' : isSel ? '#6342ff' : n.cat === 'GenAI & Agents' ? '#0099ff' : n.cat === 'Learning Loop' ? '#ff5277' : '#94a3b8';
    const strokeWidth = isSource ? 3 : isSel ? 3 : 1.8;
    const textColor = isSel || isSource ? '#141726' : '#475569';

    nodesHtml += `
      <g class="galaxy-node" data-id="${n.id}" style="cursor:pointer">
        ${isSel ? `<circle cx="${n.x}" cy="${n.y}" r="28" fill="rgba(99, 66, 255, 0.08)" stroke="#6342ff" stroke-width="1.5" stroke-dasharray="3 3"/>` : ''}
        <circle cx="${n.x}" cy="${n.y}" r="21" fill="#ffffff" stroke="${strokeColor}" stroke-width="${strokeWidth}" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.06))"/>
        <text x="${n.x}" y="${n.y + 6}" font-size="15" text-anchor="middle">${n.icon}</text>
        <text x="${n.x}" y="${n.y + 34}" fill="${textColor}" font-size="11" font-weight="${isSel ? '700' : '600'}" text-anchor="middle" font-family="'Space Grotesk', sans-serif">${esc(n.name.split(' ')[0])}</text>
        <circle cx="${n.x}" cy="${n.y}" r="28" fill="transparent" style="cursor:pointer"/>
      </g>
    `;
  });

  return `
    <svg id="galaxy-svg-elem" viewBox="0 0 680 310" class="galaxy-svg" role="img" aria-label="Interactive Living Synapse Canvas">
      <defs>
        <radialGradient id="core-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#6342ff" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="680" height="310" fill="transparent"/>
      <g fill="#cbd5e1" opacity="0.45">
        <circle cx="50" cy="50" r="1.5"/><circle cx="180" cy="25" r="1"/><circle cx="280" cy="65" r="1.2"/>
        <circle cx="620" cy="60" r="1"/><circle cx="580" cy="275" r="1.5"/><circle cx="140" cy="285" r="1"/>
        <circle cx="480" cy="295" r="1.2"/><circle cx="40" cy="180" r="1"/><circle cx="650" cy="170" r="1.5"/>
      </g>
      <g id="galaxy-edges-group">${linesHtml}</g>
      <g id="galaxy-nodes-group">${nodesHtml}</g>
    </svg>
  `;
}

function getSynapseKey(idA, idB) {
  return `${idA}-${idB}`;
}

function renderGalaxyInspector(node) {
  return `
    <div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        <span class="icon" style="font-size:22px;display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px">${node.icon}</span>
        <div>
          <span class="section-kicker">${node.cat.toUpperCase()}</span>
          <h3 style="margin:2px 0 0;font-size:21px;color:var(--text-main)">${esc(node.name)}</h3>
        </div>
      </div>
      <p style="color:var(--text-muted);font-size:14px;line-height:1.6;margin:8px 0 12px">${esc(node.desc)}</p>
      
      ${recentSynapseMessage ? `
        <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:10px 14px;margin-bottom:12px;display:flex;align-items:center;gap:10px">
          <span style="font-size:16px">✨</span>
          <span style="font-size:13px;color:#5b21b6;font-weight:500">${esc(recentSynapseMessage)}</span>
        </div>
      ` : ''}

      <div class="cs-analogy">
        <strong>💡 CS MENTAL MODEL:</strong>
        ${esc(node.analogy)}
      </div>
    </div>
    <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:10px">
      <a href="${node.link}" class="button" style="font-size:13px;padding:11px 20px">Study Concept ➔</a>
      <div style="font-size:11px;color:var(--text-sub);font-family:'IBM Plex Mono',monospace">
        ${connectSourceNode ? `Click another node to connect with <strong>${connectSourceNode.name.split(' ')[0]}</strong>` : `Click a point to start drawing a synapse`}
      </div>
    </div>
  `;
}

function renderFlowSteps(activeStep) {
  return flowStages.map((s, idx) => `
    <div class="flow-step-card ${s.num === activeStep.num ? 'active' : ''}" data-step="${s.num}">
      <span class="flow-num">STAGE ${s.num}</span>
      <span class="flow-title">${s.icon} ${esc(s.title)}</span>
      <span style="font-size:11px;color:var(--text-sub);margin-top:4px;display:block">${esc(s.short)}</span>
      ${idx < flowStages.length - 1 ? '<span class="flow-arrow">➔</span>' : ''}
    </div>
  `).join('');
}

function renderFlowDetail(step) {
  const curIdx = flowStages.indexOf(step);
  const nextStep = curIdx < flowStages.length - 1 ? flowStages[curIdx + 1] : null;
  return `
    <div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span class="pill" style="color:var(--purple);border-color:#ddd6fe;background:#f5f3ff;font-weight:700">STAGE ${step.num} OF 05</span>
        <span style="color:var(--cyan);font-size:13px;font-family:'IBM Plex Mono',monospace;font-weight:600">${step.short}</span>
      </div>
      <h3 style="font-size:22px;margin:4px 0 10px;color:var(--text-main)">${step.icon} ${esc(step.title)}</h3>
      <p style="color:var(--text-muted);font-size:14px;line-height:1.6;margin:0 0 16px">${esc(step.desc)}</p>
      <div class="cs-analogy" style="margin-bottom:16px">
        <strong>💡 CS MENTAL MODEL:</strong>
        ${esc(step.analogy)}
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        ${nextStep ? 
          `<button id="flow-next-btn" class="button" style="font-size:13px;padding:9px 18px">Next: Step ${nextStep.num} (${nextStep.title}) ➔</button>` : 
          `<a href="#learn" class="button" style="font-size:13px;padding:9px 18px">Start ML Algorithms Track ➔</a>`
        }
      </div>
    </div>
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-size:11px;font-family:'IBM Plex Mono',monospace;color:var(--purple);font-weight:600">PYTHON / NUMPY IMPLEMENTATION</span>
        <span style="font-size:11px;color:var(--text-sub);font-family:'IBM Plex Mono',monospace">STAGE ${step.num}</span>
      </div>
      <pre style="margin:0;padding:16px;font-size:12px;line-height:1.55;overflow-x:auto;max-height:240px"><code>${esc(step.code)}</code></pre>
    </div>
  `;
}

function renderBrainSimHtml(){
  return `<div class="brain-box" style="margin-top:0">
    <p style="margin-top:0;font-size:15px">In traditional CS, you write an <code>if (hours &gt; 5)</code> rule. In a neural network, inputs pulse through weighted connections into hidden neurons that compute an activation score.</p>
    <div class="brain-grid">
      <div class="network-wrap" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;">
        <svg id="brain-svg" viewBox="0 0 460 250" class="network" role="img" aria-label="Interactive neural network pulse">
          <g id="brain-connections"></g>
          <g id="brain-nodes"></g>
        </svg>
        <div class="signal-caption">INPUTS → HIDDEN WEIGHTED NEURONS → PREDICTION OUTPUT</div>
      </div>
      <div class="brain-controls">
        <div class="brain-slider-group">
          <label for="brain-hours">Study Hours: <span id="val-hours">6h</span></label>
          <input type="range" id="brain-hours" min="1" max="10" step="0.5" value="6">
        </div>
        <div class="brain-slider-group">
          <label for="brain-attend">Attendance: <span id="val-attend">75%</span></label>
          <input type="range" id="brain-attend" min="30" max="100" step="5" value="75">
        </div>
        <div class="brain-slider-group">
          <label for="brain-sleep">Sleep &amp; Focus: <span id="val-sleep">Optimal</span></label>
          <input type="range" id="brain-sleep" min="1" max="3" step="1" value="2">
        </div>
        <div class="brain-readout">
          <div class="brain-status">PREDICTED EXAM OUTCOME</div>
          <div class="brain-score" id="brain-score-display">84%</div>
          <div id="brain-badge" class="pill" style="display:inline-block;padding:4px 10px;font-size:11px;color:#15803d;border-color:#bbf7d0;background:#f0fdf4;font-weight:700">PASS (DISTINCTION)</div>
          <p class="brain-explanation" id="brain-explanation-text">With 6h study and 75% attendance, the problem-solving and retention neurons fire at 82% activation.</p>
        </div>
      </div>
    </div>
  </div>`;
}

function wireBrainSim(){
  const hoursInput = document.getElementById('brain-hours');
  const attendInput = document.getElementById('brain-attend');
  const sleepInput = document.getElementById('brain-sleep');
  if(!hoursInput) return;

  const update = () => {
    const hours = +hoursInput.value;
    const attend = +attendInput.value;
    const sleep = +sleepInput.value;

    const valH = document.getElementById('val-hours');
    const valA = document.getElementById('val-attend');
    const valS = document.getElementById('val-sleep');
    if(valH) valH.textContent = `${hours}h`;
    if(valA) valA.textContent = `${attend}%`;
    if(valS) valS.textContent = sleep === 1 ? 'Low' : sleep === 2 ? 'Optimal' : 'Deep';

    const x1 = hours / 10;
    const x2 = attend / 100;
    const x3 = sleep / 3;

    const sigmoid = z => 1 / (1 + Math.exp(-z));
    const h1 = sigmoid(x1 * 2.5 + x2 * 1.2 - 1.5);
    const h2 = sigmoid(x1 * 1.0 + x2 * 2.8 - 1.8);
    const h3 = sigmoid(x1 * 3.2 + x3 * 1.5 - 2.0);
    const h4 = sigmoid(x2 * 1.5 + x3 * 2.2 - 1.4);

    const outRaw = sigmoid(h1 * 1.8 + h2 * 1.5 + h3 * 2.4 + h4 * 1.2 - 2.8);
    const finalScore = Math.min(99, Math.max(12, Math.round(outRaw * 100)));

    const scoreDisp = document.getElementById('brain-score-display');
    const badge = document.getElementById('brain-badge');
    const expl = document.getElementById('brain-explanation-text');

    if(scoreDisp) scoreDisp.textContent = `${finalScore}%`;
    if(badge){
      if(finalScore >= 75){
        badge.textContent = 'PASS (DISTINCTION)';
        badge.style.color = '#15803d';
        badge.style.borderColor = '#bbf7d0';
        badge.style.background = '#f0fdf4';
      } else if(finalScore >= 50){
        badge.textContent = 'PASS (AVERAGE)';
        badge.style.color = '#b45309';
        badge.style.borderColor = '#fde68a';
        badge.style.background = '#fffbeb';
      } else {
        badge.textContent = 'NEEDS REMEDIATION';
        badge.style.color = '#b91c1c';
        badge.style.borderColor = '#fecaca';
        badge.style.background = '#fef2f2';
      }
    }

    if(expl){
      if(finalScore >= 80) expl.textContent = `High study hours (${hours}h) and strong attendance fired retention & problem-solving neurons at ${(h1*100).toFixed(0)}% activation.`;
      else if(finalScore >= 60) expl.textContent = `Moderate inputs maintained steady neuron activations. Increasing study or sleep will push performance into distinction.`;
      else expl.textContent = `Low inputs failed to trigger hidden neuron thresholds. The model calculates high probability of missed exam concepts.`;
    }

    const connGroup = document.getElementById('brain-connections');
    const nodeGroup = document.getElementById('brain-nodes');
    if(!connGroup || !nodeGroup) return;

    const inCoords = [{x: 45, y: 55}, {x: 45, y: 125}, {x: 45, y: 195}];
    const hidCoords = [{x: 230, y: 40, act: h1}, {x: 230, y: 95, act: h2}, {x: 230, y: 155, act: h3}, {x: 230, y: 210, act: h4}];
    const outCoord = {x: 410, y: 125, act: outRaw};

    let conns = '';
    inCoords.forEach((inp, i) => {
      const inVal = i===0 ? x1 : i===1 ? x2 : x3;
      hidCoords.forEach((hid) => {
        const opacity = Math.max(0.2, (inVal + hid.act) / 2);
        conns += `<line x1="${inp.x}" y1="${inp.y}" x2="${hid.x}" y2="${hid.y}" stroke="#0099ff" stroke-width="${Math.max(1, inVal*3.5)}" stroke-opacity="${opacity.toFixed(2)}"/>`;
      });
    });
    hidCoords.forEach((hid) => {
      const opacity = Math.max(0.25, (hid.act + outRaw) / 2);
      conns += `<line x1="${hid.x}" y1="${hid.y}" x2="${outCoord.x}" y2="${outCoord.y}" stroke="#6342ff" stroke-width="${Math.max(1, hid.act*4)}" stroke-opacity="${opacity.toFixed(2)}"/>`;
    });
    connGroup.innerHTML = conns;

    let nodes = '';
    const inLabels = ['HOURS', 'ATTEND', 'SLEEP'];
    inCoords.forEach((inp, i) => {
      const v = i===0 ? x1 : i===1 ? x2 : x3;
      nodes += `<circle cx="${inp.x}" cy="${inp.y}" r="16" fill="#ffffff" stroke="#0099ff" stroke-width="${Math.max(2, v*3.5)}"/>
      <text x="${inp.x}" y="${inp.y+4}" fill="#1e293b" font-weight="600" font-size="9" text-anchor="middle" font-family="'IBM Plex Mono', monospace">${inLabels[i]}</text>`;
    });
    const hidLabels = ['H1:RETN', 'H2:DISC', 'H3:SOLV', 'H4:FOCU'];
    hidCoords.forEach((hid, i) => {
      nodes += `<circle cx="${hid.x}" cy="${hid.y}" r="17" fill="${hid.act > 0.5 ? '#f5f3ff' : '#ffffff'}" stroke="${hid.act > 0.5 ? '#6342ff' : '#cbd5e1'}" stroke-width="${Math.max(2, hid.act*3.5)}"/>
      <text x="${hid.x}" y="${hid.y+4}" fill="${hid.act > 0.5 ? '#6342ff' : '#64748b'}" font-weight="600" font-size="8" text-anchor="middle" font-family="'IBM Plex Mono', monospace">${hidLabels[i]}</text>`;
    });
    nodes += `<circle cx="${outCoord.x}" cy="${outCoord.y}" r="24" fill="#ffffff" stroke="#6342ff" stroke-width="${Math.max(2.5, outRaw*5)}" filter="drop-shadow(0 2px 8px rgba(99,66,255,0.2))"/>
    <text x="${outCoord.x}" y="${outCoord.y+5}" fill="#6342ff" font-weight="800" font-size="12" text-anchor="middle" font-family="'IBM Plex Mono', monospace">${finalScore}%</text>`;
    nodeGroup.innerHTML = nodes;
  };

  [hoursInput, attendInput, sleepInput].forEach(inp => inp.oninput = update);
  update();
}

function renderLegacyInteractiveAiWidget(){
  return `
    <div class="galaxy-card">
      <div class="galaxy-header">
        <div>
          <span class="section-kicker">LIVING CANVAS · INTERACTIVE INTUITION</span>
          <h2 style="font-size:26px;margin:4px 0">Connect the Dots: How AI Learns</h2>
        </div>
        <div class="galaxy-toggles">
          <button id="view-galaxy-btn" class="galaxy-toggle-btn ${activeAiView==='galaxy'?'active':''}">✨ Living Synapse Canvas</button>
          <button id="view-flow-btn" class="galaxy-toggle-btn ${activeAiView==='flow'?'active':''}">➔ Step-by-Step Flow</button>
          <button id="view-sim-btn" class="galaxy-toggle-btn ${activeAiView==='sim'?'active':''}">⚡ Harmonic Neuron</button>
        </div>
      </div>

      <!-- VIEW 1: Knowledge Galaxy (Mind Map / Living Synapse Canvas) -->
      <div id="ai-galaxy-view" style="display:${activeAiView==='galaxy'?'block':'none'}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
          <p style="margin:0;font-size:14px;color:var(--text-muted)">
            ${connectSourceNode ? `<strong>🔗 Connecting from ${connectSourceNode.name}:</strong> Click another concept point to bridge a neural synapse!` : `Touch or click any point to inspect, or select two points to weave a neural pathway.`}
          </p>
          <div style="display:flex;gap:8px;align-items:center">
            <button id="auto-connect-btn" class="edition" style="cursor:pointer;background:#ffffff">✨ Auto-Form Full Constellation</button>
            <button id="clear-synapses-btn" class="edition" style="cursor:pointer;background:#ffffff;border-color:#e2e8f0;color:#64748b">🧹 Clear Synapses (${userSynapses.length})</button>
          </div>
        </div>
        <div class="galaxy-wrap">
          ${renderGalaxySvg()}
        </div>
        <div id="galaxy-inspector-box" class="galaxy-inspector">
          ${renderGalaxyInspector(selectedGalaxyNode)}
        </div>
      </div>

      <!-- VIEW 2: How AI Learns (Flowchart) -->
      <div id="ai-flow-view" class="flowchart-wrap" style="display:${activeAiView==='flow'?'block':'none'}">
        <p style="margin:0 0 16px;font-size:14px;color:var(--text-muted)">The exact 5-step lifecycle of how a machine learning model goes from raw numbers to an intelligent production service:</p>
        <div id="flow-steps-container" class="flow-steps-grid">
          ${renderFlowSteps(selectedFlowStage)}
        </div>
        <div id="flow-detail-container" class="flow-detail-box">
          ${renderFlowDetail(selectedFlowStage)}
        </div>
      </div>

      <!-- VIEW 3: Live Neuron Simulator -->
      <div id="ai-sim-view" style="display:${activeAiView==='sim'?'block':'none'}">
        <div class="page-heading" style="margin-bottom:14px">
          <div>
            <span class="section-kicker">INTERACTIVE NEURAL SIMULATOR</span>
            <h3 style="font-size:22px;margin:4px 0">The Neural Pulse: Passing or Failing</h3>
          </div>
          <span class="edition">WEIGHTED COMPUTATION</span>
        </div>
        ${renderBrainSimHtml()}
      </div>
    </div>
  `;
}

function wireLegacyInteractiveAiWidget(){
  const btnGalaxy = document.getElementById('view-galaxy-btn');
  const btnFlow = document.getElementById('view-flow-btn');
  const btnSim = document.getElementById('view-sim-btn');

  const viewGalaxy = document.getElementById('ai-galaxy-view');
  const viewFlow = document.getElementById('ai-flow-view');
  const viewSim = document.getElementById('ai-sim-view');

  const setView = (view) => {
    activeAiView = view;
    if(btnGalaxy) btnGalaxy.classList.toggle('active', view === 'galaxy');
    if(btnFlow) btnFlow.classList.toggle('active', view === 'flow');
    if(btnSim) btnSim.classList.toggle('active', view === 'sim');

    if(viewGalaxy) viewGalaxy.style.display = view === 'galaxy' ? 'block' : 'none';
    if(viewFlow) viewFlow.style.display = view === 'flow' ? 'block' : 'none';
    if(viewSim) viewSim.style.display = view === 'sim' ? 'block' : 'none';

    if(view === 'sim') wireBrainSim();
  };

  if(btnGalaxy) btnGalaxy.onclick = () => setView('galaxy');
  if(btnFlow) btnFlow.onclick = () => setView('flow');
  if(btnSim) btnSim.onclick = () => setView('sim');

  wireGalaxy();
  wireFlowchart();
  wireBrainSim();
}

function wireGalaxy(){
  const svg = document.getElementById('galaxy-svg-elem');
  if(!svg) return;

  svg.querySelectorAll('.galaxy-node').forEach(nodeGroup => {
    nodeGroup.onclick = (e) => {
      e.stopPropagation();
      const id = nodeGroup.dataset.id;
      const found = galaxyNodes.find(n => n.id === id);
      if(!found) return;

      if(!connectSourceNode){
        selectedGalaxyNode = found;
        connectSourceNode = found;
        recentSynapseMessage = `Selected ${found.name}. Now click another point to form a synapse!`;
      } else if(connectSourceNode.id === found.id){
        connectSourceNode = null;
        recentSynapseMessage = null;
      } else {
        const a = connectSourceNode.id;
        const b = found.id;
        const exists = userSynapses.some(([s1, s2]) => (s1===a && s2===b) || (s1===b && s2===a));
        if(!exists){
          userSynapses.push([a, b]);
        }
        selectedGalaxyNode = found;

        const directKey = getSynapseKey(a, b);
        const revKey = getSynapseKey(b, a);
        const insight = synapseInsightsMap[directKey] || synapseInsightsMap[revKey] || `Synapse established between ${connectSourceNode.name} and ${found.name}! Signals now pass directly between them.`;
        recentSynapseMessage = `Connected: ${connectSourceNode.name.split(' ')[0]} ➔ ${found.name.split(' ')[0]}! ${insight}`;

        connectSourceNode = null;
      }

      const wrap = document.querySelector('.galaxy-wrap');
      if(wrap) wrap.innerHTML = renderGalaxySvg();
      
      const inspector = document.getElementById('galaxy-inspector-box');
      if(inspector) inspector.innerHTML = renderGalaxyInspector(selectedGalaxyNode);

      wireGalaxy();
    };
  });

  const autoBtn = document.getElementById('auto-connect-btn');
  if(autoBtn){
    autoBtn.onclick = () => {
      userSynapses = [...canonicalSynapses];
      connectSourceNode = null;
      recentSynapseMessage = '✨ Full constellation formed! All 14 foundational AI learning pathways are active.';
      const wrap = document.querySelector('.galaxy-wrap');
      if(wrap) wrap.innerHTML = renderGalaxySvg();
      const inspector = document.getElementById('galaxy-inspector-box');
      if(inspector) inspector.innerHTML = renderGalaxyInspector(selectedGalaxyNode);
      wireGalaxy();
    };
  }

  const clearBtn = document.getElementById('clear-synapses-btn');
  if(clearBtn){
    clearBtn.onclick = () => {
      userSynapses = [];
      connectSourceNode = null;
      recentSynapseMessage = 'Canvas cleared! Click any two points to weave your own custom synapses.';
      const wrap = document.querySelector('.galaxy-wrap');
      if(wrap) wrap.innerHTML = renderGalaxySvg();
      const inspector = document.getElementById('galaxy-inspector-box');
      if(inspector) inspector.innerHTML = renderGalaxyInspector(selectedGalaxyNode);
      wireGalaxy();
    };
  }
}

function wireFlowchart(){
  const stepCards = document.querySelectorAll('.flow-step-card');
  stepCards.forEach(card => {
    card.onclick = () => {
      const num = card.dataset.step;
      const found = flowStages.find(s => s.num === num);
      if(!found) return;
      selectedFlowStage = found;

      const stepsContainer = document.getElementById('flow-steps-container');
      const detailContainer = document.getElementById('flow-detail-container');
      if(stepsContainer) stepsContainer.innerHTML = renderFlowSteps(selectedFlowStage);
      if(detailContainer) detailContainer.innerHTML = renderFlowDetail(selectedFlowStage);

      wireFlowchart();
    };
  });

  const nextBtn = document.getElementById('flow-next-btn');
  if(nextBtn){
    nextBtn.onclick = () => {
      const curIdx = flowStages.indexOf(selectedFlowStage);
      if(curIdx < flowStages.length - 1){
        selectedFlowStage = flowStages[curIdx + 1];
        const stepsContainer = document.getElementById('flow-steps-container');
        const detailContainer = document.getElementById('flow-detail-container');
        if(stepsContainer) stepsContainer.innerHTML = renderFlowSteps(selectedFlowStage);
        if(detailContainer) detailContainer.innerHTML = renderFlowDetail(selectedFlowStage);
        wireFlowchart();
      }
    };
  }
}

function renderRoadmapHtml(){
  return `<details class="roadmap-box" style="margin-top:28px">
    <summary style="font-weight:700;font-size:18px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;user-select:none">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:20px">🚀</span>
        <span>2026 Corporate AI Career Horizons (5 Engineering Roles)</span>
      </div>
      <span class="edition" style="background:#ffffff">Click to View Paths ▾</span>
    </summary>
    <div style="margin-top:20px">
      <p style="margin-top:0">Select an industry target to reveal the required engineering tech stack, core competencies, and chapter study sequence:</p>
      <div class="role-pills">
        ${corporateRoles.map(r=>`<button class="role-btn ${r.id===selectedRole.id?'active':''}" data-role="${r.id}">${r.icon} <span>${r.title}</span></button>`).join('')}
      </div>
      <div id="role-display" class="role-detail">
        ${renderRoleDetail(selectedRole)}
      </div>
    </div>
  </details>`;
}

function renderRoleDetail(r){
  return `
    <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:12px">
      <div>
        <span class="section-kicker">${r.demand.toUpperCase()} · ${r.track.toUpperCase()}</span>
        <h3 style="font-size:22px;margin:4px 0">${r.icon} ${r.title}</h3>
      </div>
      <a class="role-path-btn" href="#${r.track==='GenAI & Agents'?'genai':'learn'}">Explore This Track (${r.chapters.length} Chapters) ➔</a>
    </div>
    <p style="margin:12px 0 16px">${r.description}</p>
    <div class="role-tags">
      <strong style="font-size:12px;color:var(--text-sub);align-self:center;margin-right:4px">CORE TECH STACK:</strong>
      ${r.tech.map(t=>`<span class="tech-tag">${t}</span>`).join('')}
    </div>
    <div style="border-top:1px solid #e2e8f0;padding-top:14px;margin-top:14px">
      <strong style="font-size:12px;color:var(--text-main);display:block;margin-bottom:8px">RECOMMENDED STUDY SEQUENCE:</strong>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${r.chapters.map(cid=>{
          const ch = catalog.chapters.find(c=>c.id===cid);
          return ch ? `<a href="#chapter/${ch.id}" class="w3-chip"><span style="color:var(--purple);font-weight:700">#${catalog.chapters.indexOf(ch)+1}</span> ${esc(ch.title)} ↗</a>` : '';
        }).join('')}
      </div>
    </div>
  `;
}

/* Homepage v2: a calm editorial introduction and a plain-language learning guide. */
function renderEditorialHero(){
  return `<section class="editorial-hero" aria-labelledby="editorial-title"><div class="editorial-copy"><span class="section-kicker">AILY · A PRACTICAL AI LEARNING SPACE</span><h1 id="editorial-title">Learn the pattern<br>behind the <em>magic.</em></h1><blockquote>“AI becomes less mysterious when you can see the small decisions that make it learn.”</blockquote><p>Build intuition through short lessons, visual experiments, and practical questions—one clear idea at a time.</p><div class="museum-actions"><a class="button" href="#start">Start learning <span>→</span></a><a class="edition" href="#python">Explore Python basics ↗</a></div></div><div class="editorial-art" aria-hidden="true"><div class="art-orbit orbit-one"></div><div class="art-orbit orbit-two"></div><div class="art-sun">AI</div><span class="art-note note-one">curiosity</span><span class="art-note note-two">pattern</span><span class="art-note note-three">practice</span></div></section>`;
}

function renderStoryDetail(stage){
  return `<div><span class="section-kicker">STEP ${stage.num} · ${esc(stage.short)}</span><h3>${esc(stage.title)}</h3><p>${esc(stage.desc)}</p></div><div class="story-analogy"><strong>Think of it like this</strong><span>${esc(stage.analogy)}</span></div>`;
}

function renderLearningStory(){
  return `<section class="learning-story" aria-labelledby="learning-story-title"><div class="learning-story-heading"><span class="section-kicker">A SIMPLE MENTAL MODEL</span><h2 id="learning-story-title">How AI learns, in five clear steps.</h2><p>No dots to connect. Just follow the journey from examples to a useful prediction.</p></div><div class="story-steps" role="list">${flowStages.map(stage=>`<button class="story-step ${stage.num===selectedFlowStage.num?'active':''}" data-story-step="${stage.num}" role="listitem"><span>${stage.num}</span><strong>${esc(stage.short)}</strong></button>`).join('')}</div><div class="story-detail" id="story-detail">${renderStoryDetail(selectedFlowStage)}</div></section>`;
}

function wireLearningStory(){
  document.querySelectorAll('[data-story-step]').forEach(button=>{
    button.onclick=()=>{
      selectedFlowStage=flowStages.find(stage=>stage.num===button.dataset.storyStep)||flowStages[0];
      document.querySelectorAll('[data-story-step]').forEach(item=>item.classList.toggle('active',item===button));
      const detail=document.getElementById('story-detail');
      if(detail) detail.innerHTML=renderStoryDetail(selectedFlowStage);
    };
  });
}

function wireRoadmap(){
  document.querySelectorAll('.role-btn').forEach(btn=>{
    btn.onclick=()=>{
      document.querySelectorAll('.role-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      selectedRole = corporateRoles.find(r=>r.id===btn.dataset.role) || corporateRoles[0];
      const disp = document.getElementById('role-display');
      if(disp) disp.innerHTML = renderRoleDetail(selectedRole);
    };
  });
}

const chapterSupport={
  foundations:{time:'18 min',lab:'Decision Boundary Lab',goal:'Turn a real problem into inputs, a target, and a simple prediction rule.',steps:['Write down the inputs available before a decision is made.','Name the single outcome you want to predict.','Check whether the inputs can realistically separate the outcomes.'],hint:'In the boundary lab, move the line slowly. Watch which examples change from correct to incorrect and ask what information the line is using.'},
  linear:{time:'20 min',lab:'Regression Playground',goal:'Predict a number and notice when a straight-line trend is a useful baseline.',steps:['Put the quantity to predict on the y-axis.','Look for an overall trend before trying a complex curve.','Compare prediction errors instead of judging by a pretty chart.'],hint:'A good first model does not need to be perfect—it needs to give you a comparison point.'},
  problems:{time:'20 min',lab:'Decision Boundary Lab',goal:'Choose classification when the answer is a category and regression when it is a number.',steps:['Ask whether the output is a label or a measurement.','Choose the costliest mistake: false positive or false negative.','Use a threshold only after looking at the trade-off.'],hint:'In the lab, a boundary is just the rule that turns input values into one of two labels.'},
  trees:{time:'22 min',lab:'Tree Split Explorer',goal:'Understand how repeated if/else questions create a decision tree.',steps:['Start with the feature that makes the cleanest first split.','Check whether each branch reduces mixed outcomes.','Stop before tiny groups become rules for noise.'],hint:'If a split only helps one or two examples, it may be memorising rather than learning.'},
  ensembles:{time:'22 min',lab:'Model Comparison Lab',goal:'See why combining many imperfect models can be steadier than trusting one.',steps:['Establish a simple baseline first.','Compare models on the same held-out examples.','Prefer a reliable improvement over a dramatic training score.'],hint:'Boosting pays extra attention to earlier mistakes; that can help, but it can also chase noise.'},
  clustering:{time:'22 min',lab:'K-Means Sandbox',goal:'Group similar examples without pretending the groups are automatically meaningful.',steps:['Pick features that describe meaningful similarity.','Scale features so one unit does not dominate distance.','Inspect the cluster centres and name them only after checking the data.'],hint:'In K-Means, move the centres and watch memberships change. That is the core loop: assign, average, repeat.'},
  evaluation:{time:'24 min',lab:'Overfitting Playground',goal:'Recognise when a model learns the signal versus memorises the training data.',steps:['Keep unseen examples aside before tuning.','Compare training performance with unseen performance.','Use the metric that matches the real mistake you care about.'],hint:'In the overfitting lab, increase complexity slowly. The useful point is where the curve captures the trend without chasing every dot.'},
  prompting:{time:'16 min',lab:'Prompt Workshop',goal:'Give a model a clear task, context, constraints, and an output format.',steps:['State the role and exact task.','Provide only the context needed for the answer.','Specify what a successful output looks like.'],hint:'Change one prompt element at a time so you can tell what improved the result.'},
  embeddings:{time:'20 min',lab:'Semantic Search Explorer',goal:'Use meaning-based similarity rather than exact keyword matching.',steps:['Embed both documents and queries with the same model.','Retrieve the closest candidates first.','Read the top results to verify relevance.'],hint:'Similar vectors are not proof of truth—they are a useful way to find likely relevant material.'},
  generative:{time:'22 min',lab:'RAG Builder',goal:'Ground a response in retrieved evidence before generating an answer.',steps:['Retrieve a small set of relevant passages.','Give the passages and question to the model together.','Ask it to say when the evidence is missing.'],hint:'When a RAG answer is weak, check retrieval before blaming generation.'},
  finetuning:{time:'20 min',lab:'Adaptation Planner',goal:'Choose the lightest method that solves the actual product problem.',steps:['Use prompting for instructions that change often.','Use RAG for private or frequently updated knowledge.','Consider fine-tuning only for repeatable behaviour or style.'],hint:'Ask: is the missing piece knowledge, instruction, or behaviour? That question narrows the choice quickly.'},
  agents:{time:'24 min',lab:'Agent Safety Simulator',goal:'Break a large task into tools, checks, and stopping conditions.',steps:['Define the tool each step may use.','Validate tool output before the next action.','Set a maximum number of steps and a safe fallback.'],hint:'An agent is not magic autonomy: it is a loop with explicit permissions, observations, and limits.'}
};

function renderChapterLabPrep(c){
  const support=chapterSupport[c.id]||{time:'20 min',lab:'Practice Lab',goal:'Connect this concept to a small, observable experiment.',steps:['Identify the inputs.','Try one small change.','Explain what changed and why.'],hint:'Change one control at a time and write down what you observe.'};
  return `<section class="lab-prep-card"><div><span class="section-kicker">LAB PREP · ${esc(support.lab.toUpperCase())}</span><h2>Before you open the lab</h2><p>${esc(support.goal)}</p></div><div class="lab-prep-steps">${support.steps.map((step,index)=>`<div><span>${index+1}</span><p>${esc(step)}</p></div>`).join('')}</div><div class="lab-prep-hint"><strong>How to approach it</strong><p>${esc(support.hint)}</p></div></section>`;
}

function renderBeginnerNotes(c){
  const b=c.beginner;
  if(!b) return '';
  return `<section class="beginner-notes" aria-label="Chapter introduction"><span class="section-kicker">IN PLAIN LANGUAGE</span><p class="beginner-summary">${esc(b.plain)}</p><p><strong>Before you start:</strong> ${esc(b.prerequisite)}</p><dl class="beginner-terms">${b.terms.map(([term,meaning])=>`<div><dt>${esc(term)}</dt><dd>${esc(meaning)}</dd></div>`).join('')}</dl><p class="note">New to AI? <a href="#start">Start from zero →</a> · Code is optional; you can go straight to the activity and quiz.</p></section>`;
}

function renderResources(track,chapterId){
  const items=track==='ML Algorithms' ? [
    ['ml_beginner','Beginner explanation','A short conceptual introduction. No coding required.'],
    ['prework','Before you code','Check the Python and maths background needed for the longer course.'],
    ['course','Go deeper','A full course with exercises. Python and basic algebra are recommended.']
  ] : [
    ['prompting','Try a clearer prompt','Read the examples after the prompting lesson. API code is optional.'],
    ['llm','Go deeper: language models','Technical reading after neural networks and embeddings; not a first lesson.'],
    ['agents','Go deeper: agents','Read after the agent lesson. Familiarity with APIs and software workflows helps.']
  ];
  if(chapterId==='embeddings') items[1]=['embedding','Go deeper: embeddings','Technical lesson with exercises. Read after the introduction to vectors.'];
  if(chapterId==='generative') items[1]=['rag','Go deeper: RAG','An architecture guide after this lesson. Some examples discuss vendor tools.'];
  return `<section class="optional-resources"><h2>Explore further, when you’re ready</h2><p>These readings are optional. You can learn the core ideas and practise here in Aily.</p><div class="cards">${items.map(([id,label,description])=>{const r=catalog.refs[id];return `<a class="card" href="${esc(r[1])}" target="_blank" rel="noopener noreferrer"><span class="section-kicker">${esc(label)}</span><h3>${esc(r[0])} ↗</h3><p>${esc(description)}</p><span class="note">External reading · opens a new tab</span></a>`;}).join('')}</div></section>`;
}

function startFromZero(){
  const ideas=[
    ['AI','The broad field','AI is a broad name for systems that perform tasks such as recognizing patterns, generating language, or planning. Machine learning is one way to build AI.','A parcel app can use AI to help estimate and explain a delivery.'],
    ['Machine learning','Learn from examples','A model learns patterns from past examples and applies them to new inputs. Its prediction can be wrong.','Use distance and past delivery times to estimate when a new parcel will arrive.'],
    ['Generative AI','Create content','A generative model produces text, images, or other content from learned patterns and the context it receives. Modern generative AI uses machine learning.','Draft a friendly explanation of a delay using the tracking information.'],
    ['An AI agent','Use tools to take steps','An agent system can let a model choose a tool, inspect its result, and decide what to do next. It needs permissions and stopping limits.','Look up tracking details, draft an update, then request approval before sending it.']
  ];
  app.innerHTML=`<span class="section-kicker">START FROM ZERO · ABOUT 5 MINUTES</span><h1>AI, without the assumed knowledge</h1><p>No coding needed. Follow one parcel to see how the ideas connect.</p><div class="beginner-map">${ideas.map(([name,label,body,example],i)=>`<article class="lesson"><span class="section-kicker">0${i+1} · ${label}</span><h2>${name}</h2><p>${body}</p><div class="exercise">${example}</div></article>`).join('')}</div><section class="lesson"><h2>Try one small question</h2><p>An app writes a friendly message explaining a parcel’s delay. Which capability is doing the writing?</p><div class="choices">${['Machine learning that predicts arrival time','Generative AI that creates text','A permission check before sending'].map((label,i)=>`<button class="choice" data-start-answer="${i}">${label}</button>`).join('')}</div><p id="start-feedback" class="feedback" role="status"></p></section><section class="lesson"><h2>Your first learning steps</h2><p>Start with the foundations, then choose a direction. You do not need to finish every ML algorithm before exploring generative AI.</p><ol class="beginner-path"><li><a href="#chapter/foundations">Meet Machine Learning</a> — learn inputs, models, and predictions.</li><li><a href="#chapter/evaluation">Evaluation &amp; Overfitting</a> — understand why testing matters.</li><li><a href="#chapter/prompting">Generative AI &amp; Clear Prompts</a> — practise a specific request.</li><li><a href="#chapter/embeddings">Embeddings</a> → <a href="#chapter/generative">RAG</a> → <a href="#chapter/agents">Agents</a> — search, answer with evidence, then use tools.</li></ol><p>Explore <a href="#learn">regression, trees, and other ML methods</a> when you want to understand prediction in more detail. Fine-tuning and boosting can wait.</p><a class="button" href="#chapter/foundations">Start the first lesson →</a></section>`;
  document.querySelectorAll('[data-start-answer]').forEach(button=>button.onclick=()=>{
    document.querySelectorAll('[data-start-answer]').forEach(b=>b.classList.toggle('selected',b===button));
    document.getElementById('start-feedback').textContent=button.dataset.startAnswer==='1'?'Correct. Generative AI drafts the text. A separate prediction model might estimate arrival time, and the application checks permission before sending.':'Try again: focus on creating the message, rather than predicting the time or authorizing an action.';
  });
}

function renderLearningCompass(next,completedCount){
  const support=chapterSupport[next.id]||{time:'20 min',lab:'Practice Lab'};
  return `<section class="learning-compass"><div><span class="section-kicker">YOUR NEXT BEST STEP</span><h2>${completedCount?'Continue where you left off':'Start here: build the foundation'}</h2><p>${completedCount?`Pick up with <strong>${esc(next.title)}</strong> and keep your momentum.`:`Begin with <strong>${esc(next.title)}</strong>. It gives you the vocabulary needed for the first labs.`}</p><div class="compass-meta"><span>◷ ${support.time}</span><span>🧪 Then: ${esc(support.lab)}</span></div><a class="button" href="#chapter/${next.id}">${completedCount?'Continue chapter':'Start first lesson'} →</a></div><div class="compass-progress"><strong>${completedCount} / ${catalog.chapters.length}</strong><span>chapters complete</span><div><i style="width:${completedCount/catalog.chapters.length*100}%"></i></div></div></section>`;
}

home=function(){
  const n=catalog.chapters.filter(c=>done(c.id)).length;
  const next=catalog.chapters.find(c=>!done(c.id))||catalog.chapters[0];

  app.innerHTML=`
    <!-- Editorial hero -->
    ${renderEditorialHero()}

    <section class="beginner-entry"><div><strong>Never studied AI before?</strong><p>Meet AI, machine learning, generative AI, and agents with one everyday example.</p></div><a class="button secondary" href="#start">Start from zero →</a></section>

    <!-- Clear five-step AI learning guide -->
    ${renderLearningStory()}

    ${renderLearningCompass(next,n)}

    <!-- 3-Step Guided Journey -->
    <div class="step-journey-wrap">
      <span class="section-kicker">YOUR GUIDED PATH THROUGH AI</span>
      <div class="step-grid">

        <!-- Step 01: Understand -->
        <div class="step-card">
          <div class="step-top">
            <span class="step-badge" style="color:var(--purple)">STEP 01</span>
            <span class="pill" style="color:var(--purple);background:#f5f3ff;border-color:#ddd6fe">12 CHAPTERS</span>
          </div>
          <span style="font-size:11px;font-family:'IBM Plex Mono',monospace;color:var(--text-sub);letter-spacing:1px;font-weight:600;margin-bottom:6px;display:block">UNDERSTAND</span>
          <h3>Core Curriculum</h3>
          <p>Learn how models predict, how AI generates content, and how agents use tools. Start with plain-language explanations; explore code when you’re ready.</p>
          <div class="step-meta">${n > 0 ? `${n} / ${catalog.chapters.length} chapters complete` : `Start with: ${next.title}`}</div>
          <a class="button step-btn" href="#learn">Explore Chapters ➔</a>
        </div>

        <!-- Step 02: Experiment -->
        <div class="step-card">
          <div class="step-top">
            <span class="step-badge" style="color:var(--emerald,#059669)">STEP 02</span>
            <span class="pill" style="color:#059669;background:#ecfdf5;border-color:#a7f3d0">6 VISUAL LABS</span>
          </div>
          <span style="font-size:11px;font-family:'IBM Plex Mono',monospace;color:var(--text-sub);letter-spacing:1px;font-weight:600;margin-bottom:6px;display:block">EXPERIMENT</span>
          <h3>Challenge Lab</h3>
          <p>Tactile visual sandboxes — drag decision boundaries, witness overfitting, and sculpt K-Means clusters in real time.</p>
          <div class="step-meta">6 interactive experiments</div>
          <a class="button step-btn" href="#challenges" style="background:linear-gradient(135deg,#059669,#10b981)">Open Sandboxes ➔</a>
        </div>

        <!-- Step 03: Master -->
        <div class="step-card">
          <div class="step-top">
            <span class="step-badge" style="color:var(--cyan)">STEP 03</span>
            <span class="pill" style="color:var(--cyan);background:#f0f7ff;border-color:#bae6fd">600+ QUESTIONS</span>
          </div>
          <span style="font-size:11px;font-family:'IBM Plex Mono',monospace;color:var(--text-sub);letter-spacing:1px;font-weight:600;margin-bottom:6px;display:block">MASTER</span>
          <h3>The AI Arcade</h3>
          <p>Curated question arena with instant feedback, CS analogies, difficulty filters, and mastery progress tracking.</p>
          <div class="step-meta">600+ questions · Multiple tracks</div>
          <a class="button step-btn" href="#arcade" style="background:linear-gradient(135deg,#0284c7,#0099ff)">Enter Arena ➔</a>
        </div>

      </div>
    </div>
  `;

  wireLearningStory();
};

learn=function(){
  renderTrackPage('ML Algorithms');
};

function genai(){
  renderTrackPage('GenAI & Agents');
}

function renderTrackPage(activeTrack){
  const mlChapters = catalog.chapters.filter(c=>c.track==='ML Algorithms');
  const genaiChapters = catalog.chapters.filter(c=>c.track==='GenAI & Agents');
  const activeList = activeTrack==='ML Algorithms' ? mlChapters : genaiChapters;

  app.innerHTML=`
    <div class="page-heading">
      <div>
        <span class="section-kicker">STRUCTURED CURRICULUM</span>
        <h1>${activeTrack==='ML Algorithms'?'Learn Machine Learning':'Learn Generative AI &amp; Agents'}</h1>
      </div>
      <a class="edition" href="#home">CAREER ROADMAP ↗</a>
    </div>
    <p>${activeTrack==='ML Algorithms'
      ?'Learn how models use examples to predict numbers, choose categories, and find groups. Begin with Meet Machine Learning; the code can wait.'
      :'Start with clear prompts, then explore meaning-based search, answers supported by documents, and agents that use tools. Leave fine-tuning for later.'}
    </p>
    <section class="beginner-entry"><div><strong>New here?</strong><p>Take the five-minute introduction first. Each chapter includes key words and a no-code activity.</p></div><a class="button secondary" href="#start">Start from zero →</a></section>

    <div class="track-tabs">
      <button class="track-tab ${activeTrack==='ML Algorithms'?'active':''}" onclick="location.hash='#learn'">▤ ML Algorithms (${mlChapters.length})</button>
      <button class="track-tab ${activeTrack==='GenAI & Agents'?'active':''}" onclick="location.hash='#genai'">✦ GenAI &amp; Agents (${genaiChapters.length})</button>
    </div>

    <div class="cards">
      ${chapterCards(activeList)}
    </div>

    ${renderResources(activeTrack)}
    <p class="note">Ready for code? <a href="#python">Explore Python basics →</a></p>
  `;
}

chapter=function(id){
  const c=catalog.chapters.find(c=>c.id===id);
  if(!c){notFound();return}
  const next = catalog.chapters[catalog.chapters.indexOf(c)+1];
  const chapterNum = String(catalog.chapters.indexOf(c)+1).padStart(2,'0');
  const trackLink = c.track==='GenAI & Agents'?'genai':'learn';
  const isComplete = done(id);
  const support = chapterSupport[c.id]||{time:'20 min',lab:'Practice Lab'};

  // Build concept step cards HTML — supports both old array format and new rich object format
  const conceptsHtml = c.sections.map((s,i)=>{
    // Normalize: s can be [title, body] array OR {title,body,keyPoints,example,misconception,analogy} object
    const title       = Array.isArray(s) ? s[0] : s.title;
    const body        = Array.isArray(s) ? s[1] : s.body;
    const keyPoints   = Array.isArray(s) ? [] : (s.keyPoints||[]);
    const example     = Array.isArray(s) ? null : s.example;
    const misconception = Array.isArray(s) ? null : s.misconception;
    const analogy     = Array.isArray(s) ? (s[2]||null) : s.analogy;

    return `
    <div class="concept-stage-wrap ${i===0?'active':''}" id="concept-wrap-${i}">
      <div class="concept-step-card">
        <span class="concept-step-eyebrow">CONCEPT ${String(i+1).padStart(2,'0')} OF ${c.sections.length} · ${esc(c.track.toUpperCase())}</span>
        <h2 class="concept-step-title">${esc(title)}</h2>

        <!-- Body: full explanation -->
        <div class="concept-step-body">${esc(body)}</div>

        ${keyPoints.length ? `
        <!-- Key Takeaways -->
        <div class="concept-key-points">
          <strong class="concept-key-label">📌 KEY TAKEAWAYS</strong>
          <ul class="concept-key-list">
            ${keyPoints.map(p=>`<li>${esc(p)}</li>`).join('')}
          </ul>
        </div>` : ''}

        ${example ? `
        <!-- Real-world example -->
        <div class="concept-example-box">
          <strong>🌍 REAL-WORLD EXAMPLE</strong>
          <p>${esc(example)}</p>
        </div>` : ''}

        ${misconception ? `
        <!-- Common misconception -->
        <div class="concept-misconception-box">
          <strong>⚠️ WATCH OUT</strong>
          <p>${esc(misconception)}</p>
        </div>` : ''}

        ${analogy ? `
        <!-- CS Analogy -->
        <div class="concept-step-analogy">
          <strong>💡 ANOTHER WAY TO THINK ABOUT IT</strong>
          <p>${esc(analogy)}</p>
        </div>` : ''}

        <!-- Navigation -->
        <div class="concept-step-nav">
          <div style="display:flex;align-items:center;gap:12px">
            <button class="concept-step-btn secondary" id="concept-prev-${i}" ${i===0?'disabled':''}>← Back</button>
            <button class="concept-step-btn" id="concept-next-${i}">${i===c.sections.length-1?'Try a small activity ➔':'Next Concept ➔'}</button>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
            <span class="concept-step-counter">${i+1} / ${c.sections.length}</span>
            <div class="concept-step-dots">
              ${c.sections.map((_,di)=>`<span class="concept-dot ${di<i?'done-dot':di===i?'active':''}"></span>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  }).join('');



  // Build quiz cards HTML
  const quizHtml = c.checks.map((q,i)=>`
    <div class="arcade-q-card" id="chk-card-${i}">
      <div class="arcade-q-header">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-family:'IBM Plex Mono',monospace;color:#889ca9;font-size:12px">CHECK ${String(i+1).padStart(2,'0')}</span>
          <span class="arcade-q-topic">Chapter Quiz</span>
        </div>
        <span id="chk-status-${i}" class="pill ${isComplete?'green':''}">${isComplete?'✓ SOLVED':''}</span>
      </div>
      <h3 class="arcade-q-title">${esc(q.question)}</h3>
      <div class="arcade-opts" id="chk-opts-${i}">
        ${q.options.map((opt,optIdx)=>`
          <button class="arcade-opt-btn ${isComplete&&optIdx===q.correct?'correct':''}" data-chk="${i}" data-opt="${optIdx}">
            <span class="arcade-opt-letter">${String.fromCharCode(65+optIdx)}</span>
            <span>${esc(opt)}</span>
          </button>
        `).join('')}
      </div>
      <div id="chk-exp-${i}" class="arcade-explain" style="display:${isComplete?'block':'none'}">
        <strong style="color:var(--purple);display:block;margin-bottom:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">EXPLANATION:</strong>
        ${esc(q.explanation)}
      </div>
    </div>
  `).join('');

  app.innerHTML=`
    <a class="note" href="#${trackLink}">← Back to ${esc(c.track)}</a>

    <!-- Stage Progress Bar -->
    <div class="chapter-stage-bar" id="chapter-stage-bar">
      <div class="chapter-stage active" data-stage="read" id="stage-tab-read">
        <span class="chapter-stage-icon">📖</span>
        <span>Read</span>
        <span class="chapter-stage-num">01</span>
      </div>
      <div class="chapter-stage" data-stage="code" id="stage-tab-code">
        <span class="chapter-stage-icon">⌨️</span>
        <span>Code (optional)</span>
        <span class="chapter-stage-num">02</span>
      </div>
      <div class="chapter-stage" data-stage="try" id="stage-tab-try">
        <span class="chapter-stage-icon">🧪</span>
        <span>Try It</span>
        <span class="chapter-stage-num">03</span>
      </div>
      <div class="chapter-stage" data-stage="quiz" id="stage-tab-quiz">
        <span class="chapter-stage-icon">✅</span>
        <span>Quiz</span>
        <span class="chapter-stage-num">04</span>
      </div>
    </div>

    <!-- Chapter Header -->
    <div class="page-heading" style="margin-bottom:20px">
      <div>
        <p class="section-kicker">${esc(c.track.toUpperCase())} · CHAPTER ${chapterNum}</p>
        <h1>${esc(c.title)}</h1>
      </div>
      <span class="edition">◷ ${esc(support.time)} · ${c.track==='GenAI & Agents'?'No-code activity':esc(gameLink(c.game).title)}</span>
    </div>
    <p style="margin-bottom:24px">${esc(c.summary)}</p>

    <!-- STAGE 1: READ — Concept Step-Through -->
    <div id="stage-read" class="stage-panel">
      ${renderBeginnerNotes(c)}
      ${conceptsHtml}
    </div>

    <!-- STAGE 2: CODE — Blueprint -->
    <div id="stage-code" class="stage-panel" style="display:none">
      <div class="concept-step-card" style="min-height:auto">
        <span class="concept-step-eyebrow">STAGE 02 · PRACTICAL PYTHON</span>
        <h2 class="concept-step-title" style="font-size:22px">Explore the code</h2>
        <p>Optional: read this after the concepts. Some examples illustrate a workflow and require libraries or additional functions to run. <a href="#python">Review Python basics →</a></p>
        <pre style="margin:0 0 18px"><code>${esc(c.example)}</code></pre>
        <div class="scenario-box">
          <strong>THINK IT THROUGH</strong>
          <p>${esc(c.exercise)}</p>
        </div>
        <details class="exercise" style="margin-top:14px">
          <summary style="cursor:pointer;font-weight:600">See an explanation</summary>
          <p style="margin-top:10px">${esc(c.answer)}</p>
        </details>
        <div class="concept-step-nav" style="margin-top:24px">
          <button class="concept-step-btn secondary" onclick="document.getElementById('stage-tab-read').click()">← Back to Read</button>
          <button class="concept-step-btn" onclick="document.getElementById('stage-tab-try').click()">Try It Live ➔</button>
        </div>
      </div>
    </div>

    <!-- STAGE 3: TRY IT — Experiment Link -->
    <div id="stage-try" class="stage-panel" style="display:none">
      ${c.beginner?`<section class="lesson"><span class="section-kicker">NO CODE NEEDED</span><h2>Try it in your own words</h2><p>${esc(c.beginner.activity)}</p><details><summary>Compare your answer</summary><p>${esc(c.beginner.answer)}</p></details><button class="button" style="margin-top:18px" onclick="document.getElementById('stage-tab-quiz').click()">Ready for the quiz →</button></section>`:''}
      ${c.track==='ML Algorithms'?`
      ${renderChapterLabPrep(c)}
      <div class="concept-step-card" style="min-height:auto;text-align:center;align-items:center;padding:48px 40px">
        <span style="font-size:52px;margin-bottom:16px;display:block">🧪</span>
        <span class="concept-step-eyebrow">STAGE 03 · INTERACTIVE EXPERIMENT</span>
        <h2 class="concept-step-title" style="font-size:22px">${gameLink(c.game).title}</h2>
        <p style="max-width:480px;margin:0 auto 28px">${gameLink(c.game).description}</p>
        <a class="button" href="#experiment/${c.game}" style="margin-bottom:18px">Open in Challenge Lab ➔</a>
        <div style="margin-top:20px">
          <button class="concept-step-btn secondary" onclick="document.getElementById('stage-tab-code').click()">← Back to Code</button>
          <span style="display:inline-block;width:12px"></span>
          <button class="concept-step-btn" onclick="document.getElementById('stage-tab-quiz').click()">Take the Quiz ➔</button>
        </div>
      </div>
      `:`<p class="note">Want the technical example? <button class="button secondary" onclick="document.getElementById('stage-tab-code').click()">Explore optional code</button></p>`}
    </div>

    <!-- STAGE 4: QUIZ -->
    <div id="stage-quiz" class="stage-panel" style="display:none">
      <div style="margin-bottom:16px">
        <span class="concept-step-eyebrow">STAGE 04 · KNOWLEDGE CHECK</span>
        <h2 style="font-size:22px;margin:4px 0 8px">Test Your Understanding</h2>
        <p style="margin:0 0 20px;font-size:14px">Answer all questions correctly to complete this chapter.</p>
      </div>
      ${quizHtml}
      <div id="chapter-save" class="feedback" aria-live="polite" style="margin-top:12px">${isComplete?'✓ Completed and saved.':''}</div>

      <!-- Completion Card (hidden until all correct) -->
      <div class="chapter-complete-card ${isComplete?'visible':''}" id="chapter-complete-card">
        <span class="chapter-complete-badge">🎓</span>
        <h2>Chapter Complete!</h2>
        <p>You've mastered <strong>${esc(c.title)}</strong>. Progress saved to your account.</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          ${next?`<a class="button" href="#chapter/${next.id}">Next: ${esc(next.title)} ➔</a>`:''}
          <a class="button" href="#acred" style="background:linear-gradient(135deg,#d97706,#f59e0b);color:#1a1035">View AI Acred 🏅</a>
        </div>
      </div>

      <div class="concept-step-nav" style="margin-top:24px;padding-top:20px;border-top:1px solid var(--line)">
        <button class="concept-step-btn secondary" onclick="document.getElementById('stage-tab-try').click()">← Back to Try It</button>
        ${next?`<a class="button" href="#chapter/${next.id}" style="font-size:13px">Next Chapter ➔</a>`:`<a class="button" href="#acred" style="font-size:13px;background:linear-gradient(135deg,#d97706,#f59e0b);color:#1a1035">View AI Acred 🏅</a>`}
      </div>
    </div>
    ${renderResources(c.track,c.id)}
  `;

  // ── Wire stage tab switching ──────────────────────────
  let activeConceptIdx = 0;
  const stages = ['read','code','try','quiz'];

  const switchStage = (stageName) => {
    stages.forEach(s => {
      const panel = document.getElementById('stage-'+s);
      const tab = document.getElementById('stage-tab-'+s);
      if(panel) panel.style.display = s===stageName ? 'block' : 'none';
      if(tab){
        tab.classList.toggle('active', s===stageName);
        // Mark done stages
        const idx = stages.indexOf(s);
        const activeIdx = stages.indexOf(stageName);
        if(idx < activeIdx) tab.classList.add('done');
        else tab.classList.remove('done');
      }
    });
  };

  stages.forEach(s => {
    const tab = document.getElementById('stage-tab-'+s);
    if(tab) tab.onclick = () => switchStage(s);
  });

  // ── Wire concept Next/Back buttons ────────────────────
  const showConcept = (idx) => {
    c.sections.forEach((_,i) => {
      const wrap = document.getElementById('concept-wrap-'+i);
      if(wrap) wrap.classList.toggle('active', i===idx);
    });
    activeConceptIdx = idx;
  };

  c.sections.forEach((_,i) => {
    const nextBtn = document.getElementById('concept-next-'+i);
    const prevBtn = document.getElementById('concept-prev-'+i);
    if(nextBtn) nextBtn.onclick = () => {
      if(i===c.sections.length-1) switchStage('try');
      else showConcept(i+1);
    };
    if(prevBtn) prevBtn.onclick = () => showConcept(i-1);
  });

  // ── Wire quiz buttons ─────────────────────────────────
  const correctSet = new Set();
  if(isComplete) c.checks.forEach((_,i) => correctSet.add(i));

  document.querySelectorAll('.arcade-opt-btn[data-chk]').forEach(btn => {
    btn.onclick = () => {
      const chkIdx = +btn.dataset.chk;
      const optIdx = +btn.dataset.opt;
      const q = c.checks[chkIdx];
      if(!q) return;
      const optsContainer = document.getElementById('chk-opts-'+chkIdx);
      if(optsContainer){
        optsContainer.querySelectorAll('.arcade-opt-btn').forEach((b,bi) => {
          b.classList.remove('correct','wrong');
          if(bi===q.correct) b.classList.add('correct');
          else if(bi===optIdx && optIdx!==q.correct) b.classList.add('wrong');
        });
      }
      const exp = document.getElementById('chk-exp-'+chkIdx);
      if(exp) exp.style.display='block';
      if(optIdx===q.correct){
        const st = document.getElementById('chk-status-'+chkIdx);
        if(st){ st.textContent='✓ SOLVED'; st.classList.add('green'); }
        correctSet.add(chkIdx);
        if(correctSet.size===c.checks.length){
          completeActivity(id, document.getElementById('chapter-save'));
          const card = document.getElementById('chapter-complete-card');
          if(card) card.classList.add('visible');
        }
      }
    };
  });
};



python=function(){
  app.innerHTML=`
    <div class="page-heading">
      <div>
        <span class="section-kicker">PREREQUISITE REFRESHER</span>
        <h1>Python &amp; Math Essentials for AI</h1>
      </div>
      <a class="edition" href="https://www.w3schools.com/python/" target="_blank" rel="noopener noreferrer">W3SCHOOLS HUB ↗</a>
    </div>
    <p>As a CS student, you already know programming logic. This reference refreshes the <strong>exact Python libraries and vector operations</strong> needed for machine learning and AI development.</p>

    <!-- W3 Quick Links Bar -->
    <div style="margin:20px 0">
      <a class="w3-chip" href="https://www.w3schools.com/python/" target="_blank" rel="noopener noreferrer"><span class="w3-badge">W3</span> Python Tutorial ↗</a>
      <a class="w3-chip" href="https://www.w3schools.com/python/numpy/default.asp" target="_blank" rel="noopener noreferrer"><span class="w3-badge">W3</span> NumPy Vectors ↗</a>
      <a class="w3-chip" href="https://www.w3schools.com/python/pandas/default.asp" target="_blank" rel="noopener noreferrer"><span class="w3-badge">W3</span> Pandas Tables ↗</a>
      <a class="w3-chip" href="https://www.w3schools.com/python/matplotlib_intro.asp" target="_blank" rel="noopener noreferrer"><span class="w3-badge">W3</span> Matplotlib Plots ↗</a>
      <a class="w3-chip" href="https://www.w3schools.com/python/python_ml_getting_started.asp" target="_blank" rel="noopener noreferrer"><span class="w3-badge">W3</span> Machine Learning ↗</a>
    </div>

    <!-- Speed Intuition: Vectors vs Loops -->
    <div class="scenario-box" style="margin-bottom:28px">
      <strong>⚡ THE CS SPEED TRUTH: WHY NUMPY MATTERS</strong>
      <p>A standard Python <code>for</code> loop over 1,000,000 floats takes ~110ms. A vectorized <code>np.dot(a, b)</code> takes ~1.2ms—nearly <strong>100x faster</strong>! Why? NumPy executes pre-compiled C code using CPU SIMD (Single Instruction, Multiple Data) vector registers. In AI, never write a loop when you can vectorize!</p>
    </div>

    <div class="lesson-layout">
      <div class="topic-nav" id="py-topic-nav">
        <a href="#python" data-mod="py-core" class="active"><span>01</span> Core Python for AI</a>
        <a href="#python" data-mod="py-numpy"><span>02</span> NumPy Vectorization</a>
        <a href="#python" data-mod="py-pandas"><span>03</span> Pandas DataFrames</a>
        <a href="#python" data-mod="py-plot"><span>04</span> Visualizing Patterns</a>
        <a href="#python" data-mod="py-quiz"><span>✓</span> Checkpoint Quiz</a>
      </div>
      <div id="py-modules-wrap">
        <section class="lesson" id="py-core" style="display:block">
          <span class="eyebrow">MODULE 01 · CORE SYNTAX</span>
          <h2>Lists, Slicing &amp; Comprehensions</h2>
          <p>ML pipelines manipulate datasets with slices and list comprehensions. Remember: Python indexing starts at <code>0</code>, and negative indices count backwards.</p>
          <pre><code># List comprehension with filter (the standard ML data prep idiom)
scores = [72, 85, 91, 64, 88]
passing_scores = [s for s in scores if s >= 80]  # [85, 91, 88]

# Slicing: [start:stop:step]
last_two = scores[-2:]  # [64, 88]</code></pre>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px">
            <a class="w3-chip" href="https://www.w3schools.com/python/python_lists.asp" target="_blank" rel="noopener noreferrer"><span class="w3-badge">W3</span> W3Schools List Reference ↗</a>
            <button class="button py-next-btn" data-target="py-numpy" style="font-size:12.5px;padding:8px 16px">Next: 02 NumPy Vectorization ➔</button>
          </div>
        </section>

        <section class="lesson" id="py-numpy" style="display:none">
          <span class="eyebrow">MODULE 02 · THE MATH ENGINE</span>
          <h2>NumPy Arrays &amp; Shapes</h2>
          <p>An AI model is fundamentally a series of matrix operations. An array's <code>.shape</code> describes rows and columns. Broadcasting automatically aligns dimensions.</p>
          <pre><code>import numpy as np

# 2D Matrix: (rows=3, columns=2)
X = np.array([[1, 2], [3, 4], [5, 6]])
print("Shape:", X.shape)         # (3, 2)
print("Column means:", X.mean(axis=0))  # [3. 4.]

# Vectorized arithmetic across all elements (No for-loops!)
X_scaled = (X - X.mean(axis=0)) / X.std(axis=0)</code></pre>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px">
            <button class="button secondary py-prev-btn" data-target="py-core" style="font-size:12.5px;padding:8px 16px">← 01 Core Python</button>
            <button class="button py-next-btn" data-target="py-pandas" style="font-size:12.5px;padding:8px 16px">Next: 03 Pandas DataFrames ➔</button>
          </div>
        </section>

        <section class="lesson" id="py-pandas" style="display:none">
          <span class="eyebrow">MODULE 03 · TABULAR DATA</span>
          <h2>Pandas: Cleaning &amp; Filtering Data</h2>
          <p>A DataFrame is a spreadsheet in code. Real-world AI engineering is 80% data cleaning: handling <code>NaN</code> values and selecting feature columns.</p>
          <pre><code>import pandas as pd

df = pd.DataFrame({
    "study_hours": [2, 4, None, 6, 8],
    "passed": [0, 1, 1, 1, 1]
})

# 1. Inspect missing values
print("Missing counts:\n", df.isna().sum())

# 2. Impute or drop nulls
df_clean = df.dropna(subset=["study_hours"])

# 3. Boolean mask filtering
high_study = df_clean[df_clean["study_hours"] >= 4]</code></pre>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px">
            <button class="button secondary py-prev-btn" data-target="py-numpy" style="font-size:12.5px;padding:8px 16px">← 02 NumPy</button>
            <button class="button py-next-btn" data-target="py-plot" style="font-size:12.5px;padding:8px 16px">Next: 04 Visualizing Patterns ➔</button>
          </div>
        </section>

        <section class="lesson" id="py-plot" style="display:none">
          <span class="eyebrow">MODULE 04 · DATA VISUALIZATION</span>
          <h2>Matplotlib: Scatterplots &amp; Histograms</h2>
          <p>Before training any algorithm, plot your data to spot outliers, non-linear curves, and class separability.</p>
          <pre><code>import matplotlib.pyplot as plt

hours = [2, 4, 6, 8, 10]
scores = [50, 65, 78, 88, 95]

plt.scatter(hours, scores, color="#059669", label="Student scores")
plt.xlabel("Hours Studied")
plt.ylabel("Exam Score")
plt.title("Study Hours vs Performance")
plt.legend()
# plt.show()</code></pre>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px">
            <button class="button secondary py-prev-btn" data-target="py-pandas" style="font-size:12.5px;padding:8px 16px">← 03 Pandas</button>
            <button class="button py-next-btn" data-target="py-quiz" style="font-size:12.5px;padding:8px 16px">Take Checkpoint Quiz ➔</button>
          </div>
        </section>

        <section class="lesson" id="py-quiz" style="display:none">
          <h2>Python Readiness Checkpoint</h2>
          <p class="note">Answer these three checks to record Python Essentials as complete.</p>
          ${quiz('What is the shape of an array with 10 rows and 4 columns?',['(4, 10)','(10, 4)','(40,)'],1,'Shape lists axis sizes in order: (rows, columns).','py-shape')}
          ${quiz('Which is substantially faster for calculating dot products of 1M numbers?',['A Python for-loop with list accumulation','np.dot() vectorized array operation','Iterating over a dictionary'],1,'NumPy runs in compiled C using hardware vector instructions.','py-speed')}
          ${quiz('Which expression selects rows in DataFrame df where score is at least 70?',['df[df["score"] >= 70]','df["score" = 70]','df.rows(70)'],0,'Boolean indexing filters rows satisfying the condition.','py-filter')}
          <div id="python-save" class="feedback" aria-live="polite"></div>
          <div style="display:flex;margin-top:20px">
            <button class="button secondary py-prev-btn" data-target="py-plot" style="font-size:12.5px;padding:8px 16px">← 04 Visualizing Patterns</button>
          </div>
        </section>
      </div>
    </div>
  `;

  // Function to activate a specific module
  const switchModule = (modId) => {
    document.querySelectorAll('#py-topic-nav a').forEach(link => {
      link.classList.toggle('active', link.dataset.mod === modId);
    });
    document.querySelectorAll('#py-modules-wrap .lesson').forEach(sec => {
      sec.style.display = sec.id === modId ? 'block' : 'none';
    });
    const targetElem = document.getElementById(modId);
    if(targetElem) targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Wire topic sidebar switches
  document.querySelectorAll('#py-topic-nav a').forEach(link => {
    link.onclick = (e) => {
      e.preventDefault();
      switchModule(link.dataset.mod);
    };
  });

  // Wire next and previous buttons inside modules
  document.querySelectorAll('.py-next-btn, .py-prev-btn').forEach(btn => {
    btn.onclick = () => {
      switchModule(btn.dataset.target);
    };
  });

  const passed = new Set();
  [['py-shape',1,'Shape lists rows then columns.'],['py-speed',1,'NumPy executes in compiled C.'],['py-filter',0,'Boolean masks filter matching rows.']].forEach(([id,n,why])=>{
    wireQuiz(id,n,why,()=>{
      passed.add(id);
      if(passed.size===3) completeActivity('python', document.getElementById('python-save'));
    });
  });
};

function bindScroll(){}


atlas=function(){
  const jargonCategories = [
    {
      name: '💻 CS-to-AI Translations (The Developer Rosetta Stone)',
      items: [
        ['Weights & Parameters', 'In CS terms: Internal constants/coefficients in an equation. Training is simply calculating the optimal constants so the function gives correct outputs.'],
        ['Inference', 'In CS terms: Calling the function in production (e.g. `model.predict(user_input)`). It uses frozen weights without modifying them.'],
        ['Loss / Cost Function', 'In CS terms: A test suite error counter. It measures how many test cases failed or how far predictions deviated from reality.'],
        ['Epoch', 'In CS terms: One complete iteration through the `for` loop over your entire training dataset.'],
        ['Overfitting', 'In CS terms: Hardcoding test cases! The model memorized the training inputs instead of learning the generalized logic.'],
        ['Feature Vector (X)', 'In CS terms: The list of input arguments passed to your function (e.g. `[hours_studied, attendance, gpa]`).']
      ]
    },
    {
      name: '📊 Core Machine Learning Algorithms',
      items: [
        ['Linear Regression', 'Fits a straight line (y = mx + b) to predict continuous numbers. Analogy: Estimating taxi fare based on miles traveled.'],
        ['Logistic Regression', 'Uses a Sigmoid curve to predict probabilities between 0% and 100% for yes/no classification. Analogy: Estimating odds a student passes an exam.'],
        ['Decision Tree', 'Flowchart of nested `if/else` conditions split automatically on features. Analogy: The 20 Questions game.'],
        ['Random Forest', '100 different decision trees voting together. Analogy: Asking a committee of 100 specialists instead of trusting 1 doctor.'],
        ['Gradient Boosting (XGBoost)', 'Sequential trees where each new tree specifically learns to correct the errors of previous trees. The king of tabular Kaggle competitions.'],
        ['K-Means Clustering', 'Unsupervised grouping of unlabelled points around k centroids. Analogy: Finding the optimal locations for 3 delivery warehouses.'],
        ['k-Nearest Neighbors (k-NN)', 'Classifies a point based on the majority label of its k closest neighbors in vector space. Analogy: "You are the average of the 5 people closest to you."']
      ]
    },
    {
      name: '🚀 Modern GenAI, LLMs & Agents',
      items: [
        ['Tokens', 'The basic units of text processed by an LLM (roughly 4 characters or 0.75 words in English). 1,000 tokens ≈ 750 words.'],
        ['Embeddings', 'Converting text into an array of floats (vector). Semantically related concepts cluster close together in geometric space.'],
        ['Cosine Similarity', 'Measuring the angle between two embedding vectors. 1.0 = identical meaning; 0.0 = completely unrelated.'],
        ['Vector Database', 'A database (e.g. Chroma, Pinecone) optimized for finding the nearest semantic neighbors among millions of vectors in milliseconds.'],
        ['RAG (Retrieval-Augmented Generation)', 'Injecting private company documents into the prompt so the LLM answers factually with citations instead of hallucinating.'],
        ['Chain-of-Thought (CoT)', 'Prompting the LLM to write out intermediate reasoning steps before answering, dramatically improving logic and math accuracy.'],
        ['ReAct Agent Loop', 'An autonomous loop where an LLM plans (Thought), executes a tool/API (Action), and inspects the return value (Observation) until done.'],
        ['Model Context Protocol (MCP)', 'An open protocol that lets AI models securely discover and connect to external tools, databases, and local filesystems.'],
        ['LoRA (Low-Rank Adaptation)', 'Parameter-efficient fine-tuning that freezes the original model and trains tiny adapter matrices at 1% of the compute cost.']
      ]
    }
  ];

  app.innerHTML=`
    <div class="page-heading">
      <div>
        <span class="section-kicker">DEVELOPER REFERENCE</span>
        <h1>AI Jargon Buster &amp; Concept Atlas</h1>
      </div>
      <a class="edition" href="https://www.promptingguide.ai/" target="_blank" rel="noopener noreferrer">PROMPT GUIDE ↗</a>
    </div>
    <p>Cut through the hype. Every concept translated into <strong>plain English</strong> with CS analogies.</p>

    <input class="search" id="jargon-search" type="search" placeholder="Search terms (e.g., RAG, Overfitting, Weights, Inference, Agent)…" style="margin-bottom:24px">

    <div id="jargon-container"></div>
  `;

  const renderJargon = () => {
    const q = (document.getElementById('jargon-search')?.value || '').toLowerCase();
    const container = document.getElementById('jargon-container');
    if(!container) return;

    let html = '';
    jargonCategories.forEach(cat=>{
      const matched = cat.items.filter(item=>item[0].toLowerCase().includes(q) || item[1].toLowerCase().includes(q));
      if(matched.length){
        html += `<div class="section-title"><h2>${cat.name}</h2></div><div class="cards" style="grid-template-columns:repeat(auto-fill, minmax(320px, 1fr))">`;
        matched.forEach(item=>{
          html += `<article class="card">
            <span class="eyebrow" style="color:#83d9ff">CONCEPT</span>
            <h3 style="margin:8px 0 10px;font-size:18px">${esc(item[0])}</h3>
            <p style="font-size:13px;line-height:1.6">${esc(item[1])}</p>
          </article>`;
        });
        html += `</div>`;
      }
    });

    container.innerHTML = html || '<p class="empty">No matching concepts. Try searching for "RAG", "Weights", or "Tree".</p>';
  };

  const searchInput = document.getElementById('jargon-search');
  if(searchInput) searchInput.oninput = renderJargon;
  renderJargon();
};

challengeLabPage=function(){
  app.innerHTML=`
    <div class="page-heading">
      <div>
        <span class="section-kicker">HANDS-ON VISUAL EXPERIMENTS</span>
        <h1>Challenge Lab</h1>
      </div>
      <span class="edition">6 INTERACTIVE LABS</span>
    </div>
    <p>Six interactive visual sandboxes. Test assumptions, tune model weights, and watch algorithms respond in real time.</p>
    <div class="cards">
      ${catalog.games.map((g,i)=>`
        <a class="card" href="#experiment/${g.id}">
          <div class="card-top">
            <span class="icon ${i%2?'green':''}">0${i+1}</span>
            <span class="pill">${done('arcade:'+g.id)?'EXPLORED':g.kind.toUpperCase()}</span>
          </div>
          <h3>${esc(g.title)}</h3>
          <p>${esc(g.description)}</p>
          <div class="card-bottom">
            <span>${esc(g.concept)}</span>
            <span>Launch Lab ↗</span>
          </div>
        </a>
      `).join('')}
    </div>
  `;
};
challengesPage = challengeLabPage;

function gameShell(g,controls){
  app.innerHTML=`
    <a class="note" href="#challenges">← All Challenge Lab experiments</a>
    <div class="page-heading">
      <div>
        <p class="section-kicker">${esc(g.concept.toUpperCase())} / ${esc(g.kind.toUpperCase())}</p>
        <h1>${esc(g.title)}</h1>
      </div>
      <a class="button secondary" href="#chapter/${g.chapter}">Read the Concept ↗</a>
    </div>
    <p>${esc(g.description)}</p>
    <div class="lab">
      <div id="game-surface"></div>
      <div class="controls">
        ${controls}
        <div class="feedback" id="game-result" aria-live="polite"></div>
      </div>
    </div>
  `;
}

function gameFooter(g){
  app.insertAdjacentHTML('beforeend',`
    <section class="lesson" style="margin-top:22px">
      <h2>Your Mission</h2>
      <p>${esc(g.goal)}</p>
      ${completionControl('arcade:'+g.id)}
      <p class="note">Mark explored after trying the activity to record your progress.</p>
    </section>
    ${sourceLinks(g.sources)}
  `);
  bindCompletions();
}

experiment=function(id){
  const g=gameLink(id);
  if(!g){notFound();return}
  if(['boundary','overfit'].includes(id)){
    legacyExperiment(id);
    gameFooter(g);
    return;
  }
  if(id==='threshold') thresholdGame(g);
  if(id==='gradient') gradientGame(g);
  if(id==='clusters') clusterGame(g);
  if(id==='iris') irisGame(g);
  gameFooter(g);
};

const pct=x=>x==null?'Undefined':(x*100).toFixed(1)+'%';
function matrixHtml(matrix,labels){
  return `<div class="table-wrap"><table><caption>Confusion matrix · rows = actual, columns = predicted</caption><thead><tr><th scope="col">Actual / predicted</th>${labels.map(l=>`<th scope="col">${l}</th>`).join('')}</tr></thead><tbody>${matrix.map((row,i)=>`<tr><th scope="row">${labels[i]}</th>${row.map(n=>`<td>${n}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function thresholdGame(g){
  const rows=Array.from({length:24},(_,i)=>({score:((i*37+13)%97+1)/100,label:[1,4,6,9,12,14,16,19,21,23].includes(i)?1:0}));
  gameShell(g,'<label for="threshold">Positive decision threshold <output id="threshold-value"></output></label><input id="threshold" type="range" min="0" max="1" step="0.01" value="0.5"><p>Predict positive when score ≥ threshold. Notice the precision vs recall tradeoff.</p>');
  const draw=()=>{
    const t=+document.getElementById('threshold').value,m=AilyMath.confusion(rows,t);
    document.getElementById('threshold-value').textContent=t.toFixed(2);
    document.getElementById('game-surface').innerHTML=matrixHtml([[m.tn,m.fp],[m.fn,m.tp]],['Negative','Positive'])+`<div class="score-pairs"><span>Precision <strong>${pct(m.precision)}</strong></span><span>Recall <strong>${pct(m.recall)}</strong></span></div><details><summary>Inspect all 24 observations</summary><div class="table-wrap"><table><tr><th>Score</th><th>Actual label</th></tr>${rows.map(r=>`<tr><td>${r.score}</td><td>${r.label?'Positive':'Negative'}</td></tr>`).join('')}</table></div></details>`;
    document.getElementById('game-result').textContent=m.recall>=.8?'Mission reached: recall is at least 80%. Notice what happened to precision and false alarms.':'Lower the threshold to catch more actual positives. Watch the false positives too.';
  };
  document.getElementById('threshold').oninput=draw;
  draw();
}

function gradientGame(g){
  let w=-4,steps=0;
  gameShell(g,'<label for="rate">Learning rate <output id="rate-value"></output></label><input id="rate" type="range" min="0.01" max="1.2" step="0.01" value="0.1"><button class="button" id="step">Take one step</button> <button class="button secondary" id="restart">Reset</button><p>Loss L(w) = (w − 3)². Gradient = 2(w − 3). Update: w ← w − η × gradient.</p><p>For this quadratic, learning rates below 1.0 converge; rates above 1.0 overshoot and diverge!</p>');
  const draw=()=>{
    const eta=+document.getElementById('rate').value;
    document.getElementById('rate-value').textContent=eta.toFixed(2);
    const px=x=>35+(x+5)/14*460,py=y=>285-Math.min(y,70)/70*250;
    document.getElementById('game-surface').innerHTML=`<svg viewBox="0 0 540 330" class="plot" role="img" aria-label="Quadratic loss curve and current parameter"><path d="M35 30V285H515" stroke="#49606e" fill="none"/><path d="${Array.from({length:141},(_,i)=>{const x=-5+i*.1;return `${i?'L':'M'}${px(x)} ${py((x-3)**2)}`}).join(' ')}" stroke="#83d9ff" stroke-width="3" fill="none"/>${w>=-5&&w<=9?`<circle cx="${px(w)}" cy="${py((w-3)**2)}" r="7" fill="#bafa4b"/>`:''}<text x="250" y="320" fill="#abc0ce">Parameter w</text><text x="40" y="20" fill="#abc0ce">Loss</text></svg>`;
    const loss=(w-3)**2;
    document.getElementById('game-result').textContent=`Step ${steps}: w = ${w.toFixed(4)}, loss = ${loss.toFixed(4)}. ${loss<.01?'Mission reached: converged to optimal w = 3!':Math.abs(w)>100?'Diverged! The learning rate was too high. Reset and lower the rate.':'Take another step and observe how the parameter moves closer.'}`;
    document.getElementById('step').disabled=Math.abs(w)>100||steps>=200;
  };
  document.getElementById('step').onclick=()=>{w=AilyMath.gradient(w,+document.getElementById('rate').value);steps++;draw()};
  document.getElementById('restart').onclick=()=>{w=-4;steps=0;draw()};
  document.getElementById('rate').oninput=draw;
  draw();
}

function clusterGame(g){
  const points=Array.from({length:45},(_,i)=>{const centers=[[100,90],[270,230],[420,95]],c=centers[i%3];return [c[0]+Math.sin(i*4.3)*42,c[1]+Math.cos(i*2.1)*38]});
  let centroids=[],step=0,labels=[];
  gameShell(g,'<label for="clusters">Number of clusters (k)</label><select id="clusters"><option>2</option><option selected>3</option><option>4</option></select><button id="cluster-step" class="button">Run one iteration</button><button id="cluster-reset" class="button secondary">Reset centroids</button><p>K-Means repeats 2 steps: 1. Assign each point to the nearest centroid. 2. Move each centroid to the average center of its cluster.</p>');
  const colors=['#bafa4b','#83d9ff','#d8b5ff','#ffb574'];
  const draw=()=>{
    document.getElementById('game-surface').innerHTML=`<svg class="plot" viewBox="0 0 540 330" role="img" aria-label="K-means observations and cross-shaped centroids">${points.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="${step?colors[labels[i]]:'#8296a5'}"/>`).join('')}${centroids.map((p,i)=>`<path d="M${p[0]-9} ${p[1]}H${p[0]+9}M${p[0]} ${p[1]-9}V${p[1]+9}" stroke="${colors[i]}" stroke-width="4"/>`).join('')}</svg><p class="note">Crosses = centroids. Colours = assigned cluster.</p>`;
  };
  const reset=()=>{
    const k=+document.getElementById('clusters').value;
    centroids=Array.from({length:k},(_,i)=>[70+i*110,160]);
    step=0;labels=[];
    document.getElementById('cluster-step').disabled=false;
    document.getElementById('game-result').textContent='Centroids initialized. Click "Run one iteration" to see them move.';
    draw();
  };
  document.getElementById('cluster-step').onclick=()=>{
    const r=AilyMath.clusterStep(points,centroids);
    const delta=r.centroids.reduce((s,c,i)=>s+Math.hypot(c[0]-centroids[i][0],c[1]-centroids[i][1]),0);
    centroids=r.centroids;labels=r.labels;step++;
    document.getElementById('game-result').textContent=`Iteration ${step} · Within-cluster distance ${r.inertia.toFixed(1)}. ${delta<.001?'Converged! Centroids have stopped moving.':'Centroids moved towards cluster means. Run another iteration.'}`;
    document.getElementById('cluster-step').disabled=delta<.001||step>=100;
    draw();
  };
  document.getElementById('clusters').onchange=reset;
  document.getElementById('cluster-reset').onclick=reset;
  reset();
}

function irisGame(g){
  gameShell(g,'<label for="neighbors">Nearest neighbours (k)</label><select id="neighbors"><option>1</option><option selected>5</option><option>15</option></select><button class="button" id="train-iris">Fit & evaluate</button><p>105 training flowers, 45 holdout test flowers. Features are standardized and classified by k nearest neighbors.</p><a href="/iris.csv" download="aily-uci-iris.csv">Download 150-row CSV ↗</a>');
  if(!irisRows.length){
    document.getElementById('game-result').textContent='Dataset loaded with standard features.';
  }
  const {train,test}=AilyMath.irisSplit(irisRows.length?irisRows:[]);
  document.getElementById('game-surface').innerHTML='<p>Choose k, then click "Fit & evaluate" to run the k-NN classifier on real flower measurements.</p>';
  document.getElementById('train-iris').onclick=()=>{
    if(!train.length) return;
    const k=+document.getElementById('neighbors').value;
    const r=AilyMath.knn(train,test,k);
    const labels=['setosa','versicolor','virginica'];
    const colors=['#bafa4b','#83d9ff','#d8b5ff'];
    document.getElementById('game-surface').innerHTML=`<svg class="plot" viewBox="0 0 540 330" role="img" aria-label="Holdout flowers by petal dimensions"><path d="M35 20V285H510" fill="none" stroke="#526570"/>${test.map((p,i)=>`<circle cx="${35+(p.x[2]-1)/6*470}" cy="${285-p.x[3]/2.6*250}" r="6" fill="${colors[labels.indexOf(p.label)]}" ${r.predictions[i]!==p.label?'stroke="white" stroke-width="3"':''}/>`).join('')}<text x="190" y="317" fill="#abc0ce">Petal length (cm)</text><text x="40" y="17" fill="#abc0ce">Petal width (cm)</text></svg><p class="note">Lime: setosa · blue: versicolor · purple: virginica. White outline: mistake.</p>${matrixHtml(r.matrix,labels)}`;
    document.getElementById('game-result').textContent=`Holdout accuracy: ${pct(r.accuracy)} with k = ${k}. Baseline random guess: 33.3%. Notice how k-NN captures non-linear species boundaries!`;
  };
}

let arcadeQuestions = [];
let arcadeFilter = {
  category: 'All',
  difficulty: 'All',
  search: '',
  page: 1,
  pageSize: 10,
  sprintMode: false,
  sprintQuestions: []
};

async function loadArcadeQuestions() {
  if (arcadeQuestions.length) return arcadeQuestions;
  try {
    const res = await fetch('/api/questions');
    if (res.ok) {
      const data = await res.json();
      if (data.questions && data.questions.length) {
        arcadeQuestions = data.questions;
        return arcadeQuestions;
      }
    }
  } catch (e) {
    console.warn('API questions fetch failed, trying static /data/questions.json', e);
  }
  try {
    const res = await fetch('/data/questions.json');
    if (res.ok) {
      arcadeQuestions = await res.json();
      return arcadeQuestions;
    }
  } catch (e) {
    console.error('Failed to load questions:', e);
  }
  return arcadeQuestions;
}

const arcadeCategories = [
  'All',
  'Python & NumPy',
  'ML Algorithms',
  'Evaluation & Validation',
  'Deep Learning',
  'GenAI, LLMs & RAG',
  'Agentic AI & MLOps'
];

async function aiArcadePage() {
  app.innerHTML = `
    <div class="page-heading">
      <div>
        <span class="section-kicker">CURATED QUESTION ARENA · 600+ QUESTIONS</span>
        <h1>The AI Arcade</h1>
      </div>
      <span class="edition">INTERACTIVE ARENA</span>
    </div>
    <p>Test your knowledge with 600+ real-world AI, ML, Python, and GenAI interview questions stored directly in the database. Filter by domain or launch a speed sprint.</p>
    <div id="arcade-container"><p role="status">Loading questions database…</p></div>
  `;

  await loadArcadeQuestions();
  renderArcadeApp();
}
arcade = aiArcadePage;

function renderArcadeApp() {
  const container = document.getElementById('arcade-container');
  if (!container) return;

  const solvedCount = completed.filter(id => id.startsWith('q:')).length;
  const totalCount = arcadeQuestions.length || 600;

  let filtered = arcadeQuestions;
  if (arcadeFilter.sprintMode) {
    filtered = arcadeFilter.sprintQuestions;
  } else {
    if (arcadeFilter.category !== 'All') {
      filtered = filtered.filter(q => q.category === arcadeFilter.category);
    }
    if (arcadeFilter.difficulty !== 'All') {
      filtered = filtered.filter(q => q.difficulty === arcadeFilter.difficulty);
    }
    if (arcadeFilter.search.trim()) {
      const s = arcadeFilter.search.toLowerCase().trim();
      filtered = filtered.filter(q => q.question.toLowerCase().includes(s) || q.topic.toLowerCase().includes(s));
    }
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / arcadeFilter.pageSize));
  if (arcadeFilter.page > totalPages) arcadeFilter.page = totalPages;
  const startIdx = (arcadeFilter.page - 1) * arcadeFilter.pageSize;
  const pageQuestions = filtered.slice(startIdx, startIdx + arcadeFilter.pageSize);

  container.innerHTML = `
    <!-- Top Stats -->
    <div class="arcade-top-stats">
      <div class="arcade-stat-item">
        <span class="arcade-stat-num">${totalCount}</span>
        <span class="arcade-stat-lbl">Questions in Database</span>
      </div>
      <div class="arcade-stat-item">
        <span class="arcade-stat-num">${solvedCount}</span>
        <span class="arcade-stat-lbl">Questions Solved</span>
      </div>
      <div style="display:flex;gap:10px">
        <button id="arcade-sprint-btn" class="button ${arcadeFilter.sprintMode ? '' : 'secondary'}" style="font-size:12px;padding:8px 14px">
          ${arcadeFilter.sprintMode ? '✕ Exit Sprint Mode' : '⚡ 10-Question Random Sprint'}
        </button>
      </div>
    </div>

    ${!arcadeFilter.sprintMode ? `
      <!-- Search & Category Filters -->
      <div class="arcade-search-bar">
        <input type="search" id="arcade-search-box" class="arcade-search-input" placeholder="Search 600+ questions (e.g. broadcasting, LoRA, backprop, k-means)..." value="${esc(arcadeFilter.search)}">
        <div class="arcade-diff-list">
          <span style="font-size:11px;color:#7e94a1;margin-right:4px">DIFFICULTY:</span>
          ${['All', 'Beginner', 'Intermediate', 'Advanced'].map(d => `
            <button class="arcade-diff-btn ${arcadeFilter.difficulty === d ? 'active' : ''}" data-diff="${d}">${d}</button>
          `).join('')}
        </div>
      </div>

      <div class="arcade-cat-list">
        ${arcadeCategories.map(c => `
          <button class="arcade-cat-pill ${arcadeFilter.category === c ? 'active' : ''}" data-cat="${c}">
            ${c === 'All' ? '🌟 All (600)' : c}
          </button>
        `).join('')}
      </div>
      <div style="font-size:12px;color:#859ba8;margin-bottom:16px;display:flex;justify-content:space-between">
        <span>Showing <strong>${filtered.length}</strong> matching questions</span>
        <span>Page ${arcadeFilter.page} of ${totalPages}</span>
      </div>
    ` : `
      <div class="scenario-box" style="margin-bottom:16px">
        <strong>⚡ RANDOM 10-QUESTION SPEED SPRINT</strong>
        <p>Answer these 10 randomly selected questions across all domains to test your rapid recall.</p>
      </div>
    `}

    <!-- Questions Feed -->
    <div class="arcade-questions-feed">
      ${pageQuestions.length ? pageQuestions.map((q, idx) => renderQuestionCard(q, startIdx + idx + 1)).join('') : '<p class="empty" style="padding:30px;text-align:center">No questions match your current search/filter. Try a different topic or reset filters.</p>'}
    </div>

    <!-- Pagination -->
    ${totalPages > 1 ? `
      <div class="arcade-pager">
        <button id="arcade-prev" class="button secondary" style="font-size:12px;padding:8px 14px" ${arcadeFilter.page <= 1 ? 'disabled' : ''}>← Previous Page</button>
        <span class="arcade-page-info">Page ${arcadeFilter.page} / ${totalPages}</span>
        <button id="arcade-next" class="button secondary" style="font-size:12px;padding:8px 14px" ${arcadeFilter.page >= totalPages ? 'disabled' : ''}>Next Page →</button>
      </div>
    ` : ''}
  `;

  wireArcadeEvents();
}

function renderQuestionCard(q, num) {
  const isDone = done('q:' + q.id);
  const diffColor = q.difficulty === 'Beginner' ? '#16a34a' : q.difficulty === 'Intermediate' ? '#0284c7' : '#7c3aed';
  const diffBg = q.difficulty === 'Beginner' ? '#f0fdf4' : q.difficulty === 'Intermediate' ? '#f0f9ff' : '#f5f3ff';
  const diffBorder = q.difficulty === 'Beginner' ? '#bbf7d0' : q.difficulty === 'Intermediate' ? '#bae6fd' : '#ddd6fe';
  return `
    <div class="arcade-q-card" id="q-card-${q.id}">
      <div class="arcade-q-header">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-family:'IBM Plex Mono',monospace;color:#889ca9;font-size:12px">#${String(q.id).padStart(3, '0')}</span>
          <span class="arcade-q-topic">${esc(q.topic)}</span>
          <span class="pill" style="color:${diffColor};background:${diffBg};border-color:${diffBorder};font-size:10px">${q.difficulty.toUpperCase()}</span>
        </div>
        <span id="q-status-${q.id}" class="pill ${isDone ? 'green' : ''}">${isDone ? '✓ SOLVED' : q.category.toUpperCase()}</span>
      </div>

      <h3 class="arcade-q-title">${esc(q.question)}</h3>

      ${q.code_snippet ? `
        <pre style="margin:0 0 14px;padding:14px 16px;font-size:12.5px;background:#1e293b;border:1px solid #334155;border-radius:10px;color:#f8fafc"><code>${esc(q.code_snippet)}</code></pre>
      ` : ''}

      <div class="arcade-opts" id="opts-${q.id}">
        ${q.options.map((opt, optIdx) => `
          <button class="arcade-opt-btn ${isDone && optIdx === q.correct ? 'correct' : ''}" data-qid="${q.id}" data-opt="${optIdx}">
            <span class="arcade-opt-letter">${String.fromCharCode(65 + optIdx)}</span>
            <span>${esc(opt)}</span>
          </button>
        `).join('')}
      </div>

      <div id="q-exp-${q.id}" class="arcade-explain" style="display:${isDone ? 'block' : 'none'}">
        <strong style="color:var(--purple);display:block;margin-bottom:4px;font-size:11px;font-family:'IBM Plex Mono',monospace">SENIOR DEVELOPER TAKEAWAY:</strong>
        ${esc(q.explanation)}
      </div>
    </div>
  `;
}

function wireArcadeEvents() {
  document.querySelectorAll('.arcade-opt-btn').forEach(btn => {
    btn.onclick = () => {
      const qid = +btn.dataset.qid;
      const optIdx = +btn.dataset.opt;
      const q = arcadeQuestions.find(item => item.id === qid);
      if (!q) return;

      const optsContainer = document.getElementById('opts-' + qid);
      if (optsContainer) {
        optsContainer.querySelectorAll('.arcade-opt-btn').forEach((b, i) => {
          b.classList.remove('correct', 'wrong');
          if (i === q.correct) b.classList.add('correct');
          else if (i === optIdx && optIdx !== q.correct) b.classList.add('wrong');
        });
      }

      const expBox = document.getElementById('q-exp-' + qid);
      if (expBox) expBox.style.display = 'block';

      if (optIdx === q.correct) {
        completeActivity('q:' + q.id);
        const statusPill = document.getElementById('q-status-' + qid);
        if (statusPill) {
          statusPill.textContent = '✓ SOLVED';
          statusPill.classList.add('green');
        }
      }
    };
  });

  const searchBox = document.getElementById('arcade-search-box');
  if (searchBox) {
    searchBox.oninput = () => {
      arcadeFilter.search = searchBox.value;
      arcadeFilter.page = 1;
      renderArcadeApp();
    };
  }

  document.querySelectorAll('.arcade-cat-pill').forEach(btn => {
    btn.onclick = () => {
      arcadeFilter.category = btn.dataset.cat;
      arcadeFilter.page = 1;
      renderArcadeApp();
    };
  });

  document.querySelectorAll('.arcade-diff-btn').forEach(btn => {
    btn.onclick = () => {
      arcadeFilter.difficulty = btn.dataset.diff;
      arcadeFilter.page = 1;
      renderArcadeApp();
    };
  });

  const sprintBtn = document.getElementById('arcade-sprint-btn');
  if (sprintBtn) {
    sprintBtn.onclick = () => {
      arcadeFilter.sprintMode = !arcadeFilter.sprintMode;
      if (arcadeFilter.sprintMode) {
        const shuffled = [...arcadeQuestions].sort(() => 0.5 - Math.random());
        arcadeFilter.sprintQuestions = shuffled.slice(0, 10);
      }
      arcadeFilter.page = 1;
      renderArcadeApp();
    };
  }

  const prevBtn = document.getElementById('arcade-prev');
  if (prevBtn) {
    prevBtn.onclick = () => {
      if (arcadeFilter.page > 1) {
        arcadeFilter.page--;
        renderArcadeApp();
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }
    };
  }

  const nextBtn = document.getElementById('arcade-next');
  if (nextBtn) {
    nextBtn.onclick = () => {
      arcadeFilter.page++;
      renderArcadeApp();
      window.scrollTo({ top: 300, behavior: 'smooth' });
    };
  }
}

const modelRows=[
  ['Numeric quantity (e.g. Price, Latency)','Baseline: Median / Mean → Linear Regression → XGBoost / LightGBM','Inspect residuals and feature collinearity. Tree ensembles excel on nonlinear tabular features.','MAE / RMSE. Always use chronological time splits for forecasts.'],
  ['Labelled categories (e.g. Pass/Fail, Fraud)','Baseline: Majority class → Logistic Regression → Random Forest / XGBoost','Examine precision, recall, and class imbalance. Tune decision threshold to task costs.','Precision, Recall, F1, ROC-AUC, Confusion Matrix.'],
  ['Unlabelled groups (e.g. Customer Segments)','Inspect feature distributions → Standardize scaling → K-Means','Examine cluster inertia, silhouette scores, and real-world business interpretability.','No ground truth accuracy without labels; test cluster stability across runs.'],
  ['Text Search & Intent (e.g. Support Tickets)','Keyword baseline (BM25) → Text Embeddings + Cosine Similarity','Pretrained embedding models (e.g. text-embedding-3) capture semantic meaning.','Top-k retrieval accuracy and semantic relevance on real user queries.'],
  ['Answers from Documents (Enterprise Q&A)','Keyword search baseline → RAG (Retrieval-Augmented Generation)','Chunk documents (300-500 tokens), index in Vector DB, inject retrieved context into prompt.','Evaluate retrieval recall and answer faithfulness (absence of hallucinations) separately.']
];

function modelsPage(){
  app.innerHTML=`
    <div class="page-heading">
      <div>
        <span class="section-kicker">ARCHITECTURE SELECTION</span>
        <h1>The Model Guide</h1>
      </div>
      <a class="edition" href="#home">CAREER ROADMAP ↗</a>
    </div>
    <p>A senior engineer's guide to picking the right model. Start simple, evaluate rigorously, and justify complexity.</p>
    <label for="problem-type" style="font-weight:600;display:block;margin:18px 0 8px">What kind of problem are you solving?</label>
    <select id="problem-type" style="background:#111c24;color:#eaf0f3;border:1px solid #2e4350;padding:10px 14px;border-radius:6px;font-size:14px;width:100%;max-width:500px">
      ${modelRows.map((m,i)=>`<option value="${i}">${m[0]}</option>`).join('')}
    </select>
    <section class="lesson" id="model-advice" style="margin-top:20px"></section>
    <h2>Before training, always write down…</h2>
    <div class="cards">
      ${[['The Prediction','What is one observation row? What exact target outcome is needed, and at what timestamp?'],
        ['The Evidence','What features are guaranteed to be available at prediction time without data leakage?'],
        ['The Tradeoffs','Which errors cost more (False Positives vs False Negatives)? What are latency & budget constraints?']].map(x=>`
        <article class="card">
          <span class="eyebrow" style="color:#83d9ff">CHECKLIST</span>
          <h3 style="margin:8px 0 6px">${x[0]}</h3>
          <p>${x[1]}</p>
        </article>
      `).join('')}
    </div>
    ${sourceLinks(['intro','linear','tree','cluster','eval'])}
  `;
  const draw=()=>{
    const m=modelRows[+document.getElementById('problem-type').value];
    document.getElementById('model-advice').innerHTML=`
      <span class="eyebrow" style="color:var(--purple)">RECOMMENDED PIPELINE</span>
      <h2 style="margin:8px 0 10px">${m[1]}</h2>
      <p>${m[2]}</p>
      <div class="scenario-box" style="margin-top:14px">
        <strong>EVALUATION STRATEGY</strong>
        <p>${m[3]}</p>
      </div>
      <a class="button secondary" href="#challenges" style="margin-top:12px;display:inline-block">Test This in Challenge Lab ↗</a>
    `;
  };
  document.getElementById('problem-type').onchange=draw;
  draw();
}

function accountPage(){
  app.innerHTML=`
    <div class="page-heading">
      <div>
        <span class="section-kicker">ACCOUNT &amp; PROGRESS</span>
        <h1>My Learning Account</h1>
      </div>
      <span class="edition">${account ? 'SYNCED' : 'GUEST MODE'}</span>
    </div>
    <p>Sign in with your email and password to securely sync your completed chapters, arcade mastery, and accredited diploma across devices.</p>

    ${account ? `
      <!-- Connected Account Profile -->
      <section class="lesson" style="border-left: 4px solid var(--purple)">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <span class="eyebrow" style="color:var(--purple)">AUTHENTICATED USER</span>
            <h2 style="margin:4px 0">${esc(account.email)}</h2>
            <p style="margin:0;font-size:13px;color:var(--text-sub)">Connected with Supabase Auth · ${completed.length} activities verified</p>
          </div>
          <div style="display:flex;gap:10px">
            <button class="button secondary" id="btn-sync-now" style="font-size:12px;padding:8px 14px">Sync Progress</button>
            <button class="button secondary" id="btn-sign-out" style="font-size:12px;padding:8px 14px;color:#ef4444;border-color:#fecaca">Sign Out</button>
          </div>
        </div>
      </section>

      <!-- Stat Cards -->
      <div class="cards" style="margin-top:20px">
        <article class="card">
          <span class="pill" style="color:var(--purple);background:#f5f3ff;border-color:#ddd6fe">CURRICULUM</span>
          <h3>Chapters Completed</h3>
          <strong style="font-size:24px;color:var(--purple);font-family:'Space Grotesk'">${catalog.chapters.filter(c=>done(c.id)).length} / ${catalog.chapters.length}</strong>
        </article>
        <article class="card">
          <span class="pill" style="color:#059669;background:#ecfdf5;border-color:#a7f3d0">LABS</span>
          <h3>Challenge Labs</h3>
          <strong style="font-size:24px;color:#059669;font-family:'Space Grotesk'">${catalog.games.filter(g=>done('arcade:'+g.id)).length} / 6</strong>
        </article>
        <article class="card">
          <span class="pill" style="color:#0284c7;background:#f0f9ff;border-color:#bae6fd">ARCADE</span>
          <h3>Questions Solved</h3>
          <strong style="font-size:24px;color:#0284c7;font-family:'Space Grotesk'">${completed.filter(id=>id.startsWith('q:')||id.startsWith('challenge:')).length} / 600+</strong>
        </article>
      </div>

      <section class="lesson" style="margin-top:24px">
        <h2>Verified Learning History</h2>
        ${completed.length ? `
          <ul style="padding-left:20px;line-height:1.8;font-size:14px;color:#334155">
            ${completed.map(id=>`<li>${esc(activityTitle(id))}</li>`).join('')}
          </ul>
        ` : '<p style="color:var(--text-sub)">No completed activities recorded yet. Complete chapter quizzes to populate your record.</p>'}
      </section>
    ` : `
      <!-- Supabase Email & Password Sign In / Sign Up Card -->
      <div style="max-width:540px;margin:24px 0">
        <div class="card" style="padding:28px">
          <div style="display:flex;gap:12px;margin-bottom:20px;border-bottom:1px solid var(--line);padding-bottom:12px">
            <button id="tab-login" class="button" style="padding:6px 14px;font-size:13px">Sign In</button>
            <button id="tab-signup" class="button secondary" style="padding:6px 14px;font-size:13px">Create Account</button>
          </div>

          <h2 id="auth-title" style="font-size:20px;margin-bottom:6px">Sign in with Email &amp; Password</h2>
          <p id="auth-sub" style="font-size:13px;color:var(--text-sub);margin-bottom:18px">Enter your credentials to save and sync your learning progress.</p>

          <form id="auth-form" onsubmit="return false;" style="display:flex;flex-direction:column;gap:14px">
            <div>
              <label for="auth-email" style="display:block;font-size:12px;font-weight:600;margin-bottom:5px">Email Address</label>
              <input type="email" id="auth-email" required placeholder="you@example.com" style="width:100%;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none">
            </div>

            <div>
              <label for="auth-password" style="display:block;font-size:12px;font-weight:600;margin-bottom:5px">Password</label>
              <input type="password" id="auth-password" required placeholder="••••••••" style="width:100%;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none">
            </div>

            <div id="auth-msg" class="feedback" style="display:none;margin-top:4px"></div>

            <button type="submit" id="auth-submit-btn" class="button" style="width:100%;padding:12px;font-size:14px;margin-top:6px">
              Sign In to Aily ➔
            </button>
          </form>

        </div>
      </div>
    `}
  `;

  // Wire Auth Buttons and Events
  let isSignUp = false;
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const authTitle = document.getElementById('auth-title');
  const authSub = document.getElementById('auth-sub');
  const authSubmit = document.getElementById('auth-submit-btn');
  const authMsg = document.getElementById('auth-msg');

  if(tabLogin && tabSignup){
    tabLogin.onclick = () => {
      isSignUp = false;
      tabLogin.className = 'button';
      tabSignup.className = 'button secondary';
      authTitle.textContent = 'Sign in with Email & Password';
      authSub.textContent = 'Enter your credentials to save and sync your learning progress.';
      authSubmit.textContent = 'Sign In to Aily ➔';
      if(authMsg) authMsg.style.display = 'none';
    };

    tabSignup.onclick = () => {
      isSignUp = true;
      tabSignup.className = 'button';
      tabLogin.className = 'button secondary';
      authTitle.textContent = 'Create New Account';
      authSub.textContent = 'Enter your email and create a password to track progress.';
      authSubmit.textContent = 'Create Account ➔';
      if(authMsg) authMsg.style.display = 'none';
    };
  }

  const authForm = document.getElementById('auth-form');
  if(authForm){
    authForm.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('auth-email').value.trim();
      const password = document.getElementById('auth-password').value;
      if(!email || !password) return;

      authSubmit.disabled = true;
      authSubmit.textContent = isSignUp ? 'Creating account…' : 'Signing in…';
      if(authMsg) authMsg.style.display = 'none';

      try {
        if(window.AilyAuth && window.AilyAuth.isConfigured()){
          if(isSignUp){
            await window.AilyAuth.signUp(email, password);
            authMsg.textContent = 'Account created! Please check your email to confirm, or sign in.';
            authMsg.style.display = 'block';
          } else {
            const data = await window.AilyAuth.signIn(email, password);
            account = { email: data.user.email, id: data.user.id };
            await loadAccount();
            accountPage();
          }
        } else {
          throw new Error('Sign-in is temporarily unavailable. Please try again shortly.');
        }
      } catch(err) {
        if(authMsg){
          authMsg.textContent = err.message || 'Authentication error. Please verify your credentials.';
          authMsg.style.color = '#dc2626';
          authMsg.style.borderColor = '#fecaca';
          authMsg.style.background = '#fef2f2';
          authMsg.style.display = 'block';
        }
      } finally {
        authSubmit.disabled = false;
        authSubmit.textContent = isSignUp ? 'Create Account ➔' : 'Sign In to Aily ➔';
      }
    };
  }

  const signOutBtn = document.getElementById('btn-sign-out');
  if(signOutBtn){
    signOutBtn.onclick = async () => {
      if(window.AilyAuth) await window.AilyAuth.signOut();
      account = null;
      headerAccount();
      accountPage();
    };
  }

  const syncNowBtn = document.getElementById('btn-sync-now');
  if(syncNowBtn){
    syncNowBtn.onclick = async () => {
      syncNowBtn.disabled = true;
      syncNowBtn.textContent = 'Syncing…';
      const results=await Promise.all(completed.map(id=>window.AilyAuth?.saveProgress(id)));
      if(results.every(Boolean)){
        syncNowBtn.disabled = false;
        syncNowBtn.textContent = '✓ Synced';
      }else{
        syncNowBtn.disabled = false;
        syncNowBtn.textContent = 'Retry sync';
      }
    };
  }
}


function activityTitle(id){
  if(id.startsWith('q:')){
    const qid = +id.slice(2);
    const q = arcadeQuestions.find(x => x.id === qid);
    return q ? `Arcade Q#${q.id}: ${q.topic}` : `Arcade Question #${qid}`;
  }
  return catalog.chapters.find(x=>x.id===id)?.title||catalog.games.find(x=>'arcade:'+x.id===id)?.title||catalog.challenges.find(x=>'challenge:'+x.id===id)?.question||(id==='python'?'Python essentials':id);
}

function sourcesPage(){
  app.innerHTML=`
    <div class="page-heading">
      <div>
        <span class="section-kicker">PROVENANCE &amp; CITATIONS</span>
        <h1>Sources, References &amp; Data</h1>
      </div>
      <span class="edition">REVIEWED: ${catalog.reviewed}</span>
    </div>
    <p>All explanations, algorithms, and references are checked against primary industry documentation.</p>
    <section class="lesson">
      <h2>Primary References</h2>
      <p>Aily links to official documentation from W3Schools, Scikit-Learn, Google ML, Anthropic Research, and the UCI Machine Learning Repository.</p>
    </section>
    <div class="glossary">
      ${Object.values(catalog.refs).map(r=>`<a class="card" href="${r[1]}" target="_blank" rel="noopener noreferrer"><h3>${r[0]} ↗</h3><p>${new URL(r[1]).hostname}</p></a>`).join('')}
    </div>
  `;
}

function notFound(){
  app.innerHTML='<h1>Page Not Found</h1><p>This lesson, challenge, or experiment does not exist.</p><a class="button" href="#home">Back to Overview ↗</a>';
}

route=function(){
  if(!catalog) return;
  const [page, id] = (location.hash.slice(1)||'home').split('/');
  const names = {
    start: 'Start from zero',
    home: 'Overview & Roadmap',
    learn: 'ML Algorithms',
    genai: 'GenAI & Agents',
    python: 'Python Essentials',
    challenges: 'Challenge Lab',
    arcade: 'The AI Arcade',
    atlas: 'AI Jargon Buster',
    models: 'Model Guide',
    account: 'My Progress',
    sources: 'Sources & Data',
    career: 'Career Paths',
    acred: 'AI Acred',
    chapter: 'Learning Path',
    experiment: 'Challenge Lab'
  };

  const active = page==='chapter' ? (catalog.chapters.find(c=>c.id===id)?.track==='GenAI & Agents'?'genai':'learn') : page==='experiment' ? 'challenges' : page;
  
  const breadcrumb = document.getElementById('breadcrumb');
  if(breadcrumb) breadcrumb.innerHTML = `Your workspace <span>/ ${names[page]||'Overview'}</span>`;

  document.querySelectorAll('nav a').forEach(a=>{
    const isActive = a.hash === '#' + active;
    a.classList.toggle('active', isActive);
    if(isActive) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });

  const routes = {
    start: startFromZero,
    home,
    learn,
    genai,
    python,
    challenges: challengeLabPage,
    arcade: aiArcadePage,
    atlas,
    models: modelsPage,
    account: accountPage,
    sources: sourcesPage,
    career: careerPaths,
    acred: acredPage,
    chapter: () => chapter(id),
    experiment: () => experiment(id)
  };

  (routes[page] || notFound)();
  document.title = `${names[page]||'Overview'} — Aily`;
  if(typeof window.scrollTo==='function') window.scrollTo(0, 0);

  // Open Core Curriculum accordion if we're on a sub-page
  const currAccordion = document.getElementById('nav-curriculum');
  if(currAccordion && ['python','learn','genai','chapter'].includes(page)){
    currAccordion.open = true;
  }

  // Highlight sub-nav links
  const subActive = page==='chapter'
    ? (catalog.chapters.find(c=>c.id===id)?.track==='GenAI & Agents'?'genai':'learn')
    : active;
  document.querySelectorAll('.nav-sub a').forEach(a=>{
    const isSubActive = a.hash === '#' + subActive;
    a.classList.toggle('active', isSubActive);
  });
};

function acredPage(){
  const chapters = catalog.chapters;
  const totalChapters = chapters.length;
  const doneChapters = chapters.filter(c=>done(c.id)).length;
  const mlChapters = chapters.filter(c=>c.track==='ML Algorithms');
  const genaiChapters = chapters.filter(c=>c.track==='GenAI & Agents');
  const mlDone = mlChapters.filter(c=>done(c.id)).length;
  const genaiDone = genaiChapters.filter(c=>done(c.id)).length;
  const pythonDone = done('python') ? 1 : 0;
  const overallPct = Math.round((doneChapters/totalChapters)*100);
  const mlPct = mlChapters.length ? Math.round((mlDone/mlChapters.length)*100) : 0;
  const genaiPct = genaiChapters.length ? Math.round((genaiDone/genaiChapters.length)*100) : 0;
  const isLoggedIn = !!account;
  const allComplete = doneChapters === totalChapters && pythonDone;

  const badges = [
    { icon:'🐍', name:'Python Ready', earned: pythonDone },
    { icon:'📊', name:'ML Foundations', earned: mlDone>=3 },
    { icon:'🧠', name:'Neural Thinker', earned: done('neural')||done('foundations') },
    { icon:'✦', name:'GenAI Explorer', earned: genaiDone>=2 },
    { icon:'🤖', name:'Agent Builder', earned: done('agents') },
    { icon:'🎓', name:'Full Graduate', earned: allComplete }
  ];

  app.innerHTML=`
    <div class="page-heading">
      <div>
        <span class="section-kicker">YOUR CERTIFICATION DASHBOARD</span>
        <h1>AI Acred 🏅</h1>
      </div>
      <span class="pill" style="color:var(--purple);background:#f5f3ff;border-color:#ddd6fe;font-size:13px;padding:6px 14px">${overallPct}% COMPLETE</span>
    </div>
    <p>Track your verified progress across all AI tracks. Complete all chapters to generate your official, accredited certificate.</p>

    <div class="acred-grid">
      <!-- Left: Progress -->
      <div class="acred-progress-card">
        <h2>Curriculum Tracker</h2>

        <div class="acred-track">
          <div class="acred-track-label">
            <span>🐍 Python Refresher</span>
            <span>${pythonDone?'1/1':'0/1'}</span>
          </div>
          <div class="acred-bar"><div class="acred-bar-fill green" style="width:${pythonDone?100:0}%"></div></div>
        </div>

        <div class="acred-track">
          <div class="acred-track-label">
            <span>📊 ML Algorithms</span>
            <span>${mlDone}/${mlChapters.length}</span>
          </div>
          <div class="acred-bar"><div class="acred-bar-fill" style="width:${mlPct}%"></div></div>
        </div>

        <div class="acred-track">
          <div class="acred-track-label">
            <span>✦ GenAI &amp; Agents</span>
            <span>${genaiDone}/${genaiChapters.length}</span>
          </div>
          <div class="acred-bar"><div class="acred-bar-fill blue" style="width:${genaiPct}%"></div></div>
        </div>

        <div class="acred-track" style="margin-top:24px;padding-top:16px;border-top:1px solid var(--line)">
          <div class="acred-track-label">
            <span style="font-weight:700;font-size:14px">Overall Completion</span>
            <span style="font-size:14px">${overallPct}%</span>
          </div>
          <div class="acred-bar" style="height:12px"><div class="acred-bar-fill" style="width:${overallPct}%"></div></div>
        </div>

        <div style="margin-top:24px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
          <p style="font-size:13px;margin:0"><strong>${doneChapters} of ${totalChapters}</strong> chapters complete.</p>
          <a class="button" href="#learn" style="font-size:13px;margin-left:auto">Continue Learning ➔</a>
        </div>
      </div>

      <!-- Right: Certificate -->
      <div class="acred-cert-card">
        <span class="acred-cert-icon">${allComplete?'🏅':'🔒'}</span>
        <h3>${allComplete?'Certificate Unlocked!':'Certificate of AI Mastery'}</h3>
        <p>${allComplete
          ? 'Congratulations! You have completed the full Aily AI curriculum. Your certificate is verified and ready.'
          : `Complete all ${totalChapters} chapters to unlock your verified credential. ${totalChapters-doneChapters} chapters remaining.`
        }</p>
        
        <div style="display:flex;flex-direction:column;gap:10px;align-items:center;width:100%">
          ${allComplete
            ? `<button class="acred-cert-btn" onclick="openCertificateModal()">View &amp; Download Certificate ↓</button>`
            : `<button class="acred-cert-btn secondary" onclick="openCertificateModal(true)" style="background:rgba(255,255,255,0.15);color:#ffffff;border:1px solid rgba(255,255,255,0.3)">Preview Certificate Template 👁</button>
               <span style="font-size:11px;color:rgba(255,255,255,0.5)">Official credential unlocks upon 100% completion</span>`
          }
        </div>
      </div>
    </div>

    <!-- Badges -->
    <div style="margin-top:28px">
      <span class="section-kicker">ACHIEVEMENT BADGES</span>
      <div class="acred-badges">
        ${badges.map(b=>`
          <div class="acred-badge-item ${b.earned?'earned':''}">
            <span class="acred-badge-icon">${b.icon}</span>
            <div class="acred-badge-name">${b.name}</div>
            ${b.earned?`<div style="font-size:10px;color:#15803d;margin-top:4px;font-family:'IBM Plex Mono',monospace">EARNED ✓</div>`:
              `<div style="font-size:10px;color:var(--text-sub);margin-top:4px">Locked</div>`}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Certificate Modal Container -->
    <div id="cert-modal-backdrop" class="cert-backdrop" style="display:none">
      <div class="cert-modal">
        <div class="cert-modal-toolbar">
          <div style="display:flex;align-items:center;gap:10px">
            <span class="section-kicker" style="color:var(--purple)">CREDENTIAL VERIFICATION</span>
            <span class="pill green">AILY ACCREDITED</span>
          </div>
          <div style="display:flex;gap:10px;align-items:center">
            <button class="button" onclick="window.print()" style="padding:8px 16px;font-size:12px;background:var(--purple)">Print / Save as PDF 🖨</button>
            <button class="button secondary" onclick="closeCertificateModal()" style="padding:8px 14px;font-size:12px">✕ Close</button>
          </div>
        </div>

        <div style="margin-bottom:16px;background:#f8fafc;padding:12px 18px;border-radius:10px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <label style="font-size:13px;font-weight:600;color:#334155" for="cert-user-name">Certificate Name:</label>
          <input type="text" id="cert-user-name" value="${esc(account?.email?.split('@')[0] || 'AI Practitioner')}" oninput="document.getElementById('cert-display-name').textContent=this.value||'AI Practitioner'" style="padding:6px 12px;border:1.5px solid #cbd5e1;border-radius:8px;font-size:14px;font-weight:600;min-width:200px">
          <span style="font-size:12px;color:#64748b">Type your full name to customize your official diploma</span>
        </div>

        <!-- Rendered Physical Certificate -->
        <div class="printable-certificate" id="diploma-frame">
          <div class="cert-border-outer">
            <div class="cert-border-inner">
              <div class="cert-header">
                <div class="cert-logo-row">
                  <span style="font-size:32px">✦</span>
                  <span class="cert-org-title">AILY ACADEMY OF ARTIFICIAL INTELLIGENCE</span>
                  <span style="font-size:32px">✦</span>
                </div>
                <div class="cert-subtitle">FOUNDATION FOR ACCREDITED MACHINE LEARNING &amp; AGENTIC SYSTEMS</div>
              </div>

              <div class="cert-body">
                <p class="cert-intro">THIS IS TO OFFICIALLY CERTIFY THAT</p>
                <h1 class="cert-recipient" id="cert-display-name">${esc(account?.email?.split('@')[0] || 'AI Practitioner')}</h1>
                <p class="cert-description">
                  has demonstrated verified competence, theoretical comprehension, and practical implementation skills across the full spectrum of Artificial Intelligence engineering, covering:
                </p>
                
                <div class="cert-pillars">
                  <div class="cert-pillar"><span>01</span> Mathematical Foundations &amp; Optimization</div>
                  <div class="cert-pillar"><span>02</span> Classical ML &amp; Gradient Boosted Trees</div>
                  <div class="cert-pillar"><span>03</span> Vector Embeddings &amp; High-Dimensional Spaces</div>
                  <div class="cert-pillar"><span>04</span> Retrieval-Augmented Generation (RAG)</div>
                  <div class="cert-pillar"><span>05</span> Autonomous Multi-Step ReAct Agents &amp; MCP</div>
                </div>
              </div>

              <div class="cert-footer">
                <div class="cert-sig-block">
                  <div class="cert-sig-line">Aily Curriculum Board</div>
                  <div class="cert-sig-title">DIRECTOR OF CURRICULUM</div>
                </div>

                <div class="cert-seal">
                  <div class="cert-seal-inner">
                    <span style="font-size:24px">🏅</span>
                    <span style="font-size:9px;font-weight:800;letter-spacing:1px;margin-top:2px">VERIFIED</span>
                    <span style="font-size:7px;font-family:'IBM Plex Mono',monospace">AILY-2026</span>
                  </div>
                </div>

                <div class="cert-sig-block">
                  <div class="cert-sig-line">${new Date().toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric'})}</div>
                  <div class="cert-sig-title">DATE OF ISSUANCE · ID #AILY-${Math.floor(100000 + Math.random()*900000)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.openCertificateModal = function(isPreview){
  const modal = document.getElementById('cert-modal-backdrop');
  if(modal) modal.style.display = 'flex';
};

window.closeCertificateModal = function(){
  const modal = document.getElementById('cert-modal-backdrop');
  if(modal) modal.style.display = 'none';
};



/* ── Welcome Gateway ──────────────────────────────────── */
function renderWelcomeGateway(){
  return `
  <div class="welcome-gateway-backdrop" id="welcome-gateway-backdrop">
    <div class="welcome-gateway-card">
      <div class="welcome-header">
        <div class="welcome-logo">✦ Aily</div>
        <h2 class="welcome-title">Your AI Learning Journey Starts Here</h2>
        <p class="welcome-sub">Learn AI & Machine Learning through hands-on labs, interactive quizzes, and real projects — at your own pace.</p>
      </div>

      <div class="welcome-info-tab">
        <div class="welcome-info-label">🗺 What is Aily?</div>
        <p style="margin:0 0 12px;color:#c9cad6;font-size:14px;line-height:1.6">Aily is a structured AI curriculum — from core Python & Math all the way to deploying real ML models. No fluff, just what matters.</p>
        <ol class="welcome-steps-list">
          <li class="welcome-step-item">
            <span class="step-num">1</span>
            <div><strong>Learn</strong> — 12 chapters covering ML foundations, deep learning, NLP, and production AI.</div>
          </li>
          <li class="welcome-step-item">
            <span class="step-num">2</span>
            <div><strong>Practice</strong> — Python labs, GenAI Arcade quiz challenges, and live model experiments.</div>
          </li>
          <li class="welcome-step-item">
            <span class="step-num">3</span>
            <div><strong>Certify</strong> — Complete all pillars and claim your AI Mastery Certificate.</div>
          </li>
        </ol>
      </div>

      <div class="welcome-choices-grid">
        <div class="welcome-choice-box" id="wg-guest-btn">
          <div class="wc-icon">👤</div>
          <div class="wc-title">Guest Mode</div>
          <div class="wc-desc">Explore freely. Progress saved locally — no account needed.</div>
          <button class="button secondary wc-action">Continue as Guest</button>
        </div>
        <div class="welcome-choice-box featured" id="wg-signin-btn">
          <div class="wc-icon">🔐</div>
          <div class="wc-title">Sign In / Sign Up</div>
          <div class="wc-desc">Sync your progress across devices and earn your certificate.</div>
          <button class="button wc-action">Get Started →</button>
        </div>
      </div>

      <p style="text-align:center;font-size:11px;color:#555;margin:16px 0 0">By continuing you agree to use this platform for learning. No spam, ever.</p>
    </div>
  </div>`;
}

window.openWelcomeGateway = function(){
  // Remove any existing instance
  const existing = document.getElementById('welcome-gateway-backdrop');
  if(existing) existing.remove();

  document.body.insertAdjacentHTML('beforeend', renderWelcomeGateway());

  const backdrop = document.getElementById('welcome-gateway-backdrop');

  document.getElementById('wg-guest-btn').addEventListener('click', function(){
    sessionStorage.setItem('aily_welcome_dismissed','true');
    backdrop.remove();
  });

  document.getElementById('wg-signin-btn').addEventListener('click', function(){
    sessionStorage.setItem('aily_welcome_dismissed','true');
    backdrop.remove();
    location.hash = '#account';
  });

  // Click outside card to dismiss as guest
  backdrop.addEventListener('click', function(e){
    if(e.target === backdrop){
      sessionStorage.setItem('aily_welcome_dismissed','true');
      backdrop.remove();
    }
  });
};

function setupMobileNavigation(){
  const sidebar=document.querySelector('aside');
  const header=document.querySelector('header');
  if(!sidebar||!header||document.getElementById('mobile-nav-toggle')) return;

  sidebar.id='site-sidebar';
  const toggle=document.createElement('button');
  toggle.id='mobile-nav-toggle';
  toggle.className='mobile-nav-toggle';
  toggle.type='button';
  toggle.setAttribute('aria-label','Open navigation menu');
  toggle.setAttribute('aria-controls','site-sidebar');
  toggle.setAttribute('aria-expanded','false');
  toggle.innerHTML='<span></span><span></span><span></span>';
  header.prepend(toggle);

  const backdrop=document.createElement('div');
  backdrop.id='mobile-nav-backdrop';
  backdrop.className='mobile-nav-backdrop';
  backdrop.setAttribute('aria-hidden','true');
  document.body.append(backdrop);

  const close=()=>{
    sidebar.classList.remove('mobile-nav-open');
    backdrop.classList.remove('visible');
    document.body.classList.remove('mobile-nav-open');
    toggle.setAttribute('aria-expanded','false');
  };
  const open=()=>{
    sidebar.classList.add('mobile-nav-open');
    backdrop.classList.add('visible');
    document.body.classList.add('mobile-nav-open');
    toggle.setAttribute('aria-expanded','true');
  };
  toggle.onclick=()=>sidebar.classList.contains('mobile-nav-open')?close():open();
  backdrop.onclick=close;
  sidebar.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',close));
  window.addEventListener('hashchange',close);
  window.addEventListener('resize',()=>{if(window.innerWidth>900) close();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape') close();});
}

function careerPaths(){

  app.innerHTML=`
    <div class="page-heading">
      <div>
        <span class="section-kicker">2026 AI INDUSTRY LANDSCAPE</span>
        <h1>Career Paths in AI</h1>
      </div>
      <a class="edition" href="#home">← Back to Overview</a>
    </div>
    <p>Select an industry target to explore the required engineering stack, core competencies, and your study sequence.</p>
    <div class="role-pills">
      ${corporateRoles.map(r=>`<button class="role-btn ${r.id===selectedRole.id?'active':''}" data-role="${r.id}">${r.icon} <span>${r.title}</span></button>`).join('')}
    </div>
    <div id="role-display" class="role-detail" style="margin-top:20px">
      ${renderRoleDetail(selectedRole)}
    </div>
  `;
  wireRoadmap();
}



async function boot(){
  try {
    setupMobileNavigation();
    const r = await fetch('/course.json');
    if(!r.ok) throw Error('Could not load course.json');
    catalog = await r.json();
    try {
      const d = await fetch('/iris.json');
      if(d.ok) irisRows = await d.json();
    } catch {}
    await loadAccount();
    route();
    window.addEventListener('hashchange', route);
    if(!sessionStorage.getItem('aily_welcome_dismissed')){
      setTimeout(openWelcomeGateway, 200);
    }
  } catch(e) {
    console.error(e);
    const appElem = document.querySelector('#app');
    if(appElem) appElem.innerHTML = '<h1>Could not load the lessons</h1><p>Please check your connection and reload.</p><button class="button" onclick="location.reload()">Reload</button>';
  }
}
boot();
