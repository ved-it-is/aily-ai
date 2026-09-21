import fs from 'node:fs';import path from 'node:path';
import './create-course.mjs';
const assets={};
function readDist(dir, prefix=''){
  for(const name of fs.readdirSync(dir)){
    const p = path.join(dir, name);
    const rel = prefix + '/' + name;
    if(fs.statSync(p).isDirectory()){
      if(name !== 'server' && name !== '.openai') readDist(p, rel);
    } else if(['.html','.js','.css','.svg','.json','.csv'].includes(path.extname(p))){
      assets[rel]={body:fs.readFileSync(p,'utf8'),type:({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.csv':'text/csv'})[path.extname(p)]};
    }
  }
}
readDist('dist');
const catalog=JSON.parse(fs.readFileSync('dist/course.json','utf8'));const ids=[...catalog.chapters.map(x=>x.id),...catalog.games.map(x=>'arcade:'+x.id),...catalog.challenges.map(x=>'challenge:'+x.id),'python'];
fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
fs.writeFileSync('dist/server/index.js',fs.readFileSync('server/worker.mjs','utf8')+'\nexport default createWorker('+JSON.stringify(assets)+','+JSON.stringify(ids)+');\n');
fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
fs.cpSync('drizzle','dist/.openai/drizzle',{recursive:true});

// Inject Vercel Supabase Environment Variables into dist/index.html if available
const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const sbKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
if (sbUrl && sbKey) {
  let indexHtml = fs.readFileSync('dist/index.html', 'utf8');
  const injectScript = `<script>window.AILY_CONFIG={supabaseUrl:${JSON.stringify(sbUrl)},supabaseAnonKey:${JSON.stringify(sbKey)}};</script>`;
  indexHtml = indexHtml.replace('<head>', '<head>' + injectScript);
  fs.writeFileSync('dist/index.html', indexHtml);
  console.log('✓ Injected Supabase environment variables into index.html');
}

console.log('Built Aily Worker, '+Object.keys(assets).length+' assets, '+ids.length+' progress activities.');
