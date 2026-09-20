import fs from 'node:fs';import path from 'node:path';
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
console.log('Built Aily Worker, '+Object.keys(assets).length+' assets, '+ids.length+' progress activities.');
