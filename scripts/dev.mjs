import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {DatabaseSync} from 'node:sqlite';import {createWorker} from '../server/worker.mjs';
// Development identity exists only in this loopback adapter, never in the Worker.
fs.mkdirSync('.sites-runtime',{recursive:true});const db=new DatabaseSync('.sites-runtime/dev.sqlite');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql'))){const sql=fs.readFileSync('drizzle/'+f,'utf8');try{db.exec(sql)}catch(e){if(!e.message.includes('already exists'))throw e}}
const DB={prepare(sql){return {bind(...args){return {async all(){return {results:db.prepare(sql).all(...args)}},async run(){db.prepare(sql).run(...args);return {success:true}}}}}}};
let qDb = null;
if (fs.existsSync('data/questions.db')) {
  qDb = new DatabaseSync('data/questions.db');
}
const QUESTIONS_DB = qDb ? {
  prepare(sql) {
    return {
      bind(...args) {
        return {
          async all() {
            return { results: qDb.prepare(sql).all(...args) };
          }
        };
      }
    };
  }
} : null;

function loadAssets(dir, prefix = '') {
  const map = {};
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const rel = prefix + '/' + name;
    if (fs.statSync(p).isDirectory()) {
      Object.assign(map, loadAssets(p, rel));
    } else {
      map[rel] = {
        body: fs.readFileSync(p, 'utf8'),
        type: ({html:'text/html',js:'text/javascript',css:'text/css',svg:'image/svg+xml',json:'application/json',csv:'text/csv'})[name.split('.').pop()] || 'text/plain'
      };
    }
  }
  return map;
}

http.createServer(async(req,res)=>{try{
  const assets = loadAssets('dist');
  const c=JSON.parse(assets['/course.json'].body);
  const ids=[...c.chapters.map(x=>x.id),...c.games.map(x=>'arcade:'+x.id),...c.challenges.map(x=>'challenge:'+x.id),'python'];
  const headers=new Headers();
  for(const[k,v]of Object.entries(req.headers))if(v&&!k.startsWith('oai-'))headers.set(k,String(v));
  headers.set('oai-authenticated-user-id','local-demo');
  headers.set('oai-authenticated-user-email','local-preview@example.test');
  let body='';
  for await(const chunk of req)body+=chunk;
  const request=new Request('http://127.0.0.1:5173'+req.url,{method:req.method,headers,...(body?{body}:{})});
  const result=await createWorker(assets,ids).fetch(request,{DB, QUESTIONS_DB});
  res.writeHead(result.status,Object.fromEntries(result.headers));
  res.end(await result.text());
}catch(e){console.error(e);res.writeHead(500).end('Preview unavailable')}}).listen(5173,'127.0.0.1',()=>console.log('http://127.0.0.1:5173 — LOCAL DEMO ACCOUNT (separate from hosted data)'));

