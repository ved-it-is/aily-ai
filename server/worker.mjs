export function createWorker(assets, activityIds) {
  const known = new Set(activityIds);
  const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'}});
  const userOf=req=>{const id=req.headers.get('oai-authenticated-user-id'),email=req.headers.get('oai-authenticated-user-email');return id&&email?{id,email}:null;};
  return {async fetch(request,env){
    const url=new URL(request.url),user=userOf(request);
    if(url.pathname.startsWith('/api/')){
      if(url.pathname==='/api/questions'){
        if(env.QUESTIONS_DB){
          try{
            const cat = url.searchParams.get('category');
            const diff = url.searchParams.get('difficulty');
            const search = url.searchParams.get('search');
            let sql = 'SELECT * FROM questions WHERE 1=1';
            const params = [];
            if(cat && cat !== 'All') { sql += ' AND category = ?'; params.push(cat); }
            if(diff && diff !== 'All') { sql += ' AND difficulty = ?'; params.push(diff); }
            if(search) { sql += ' AND (question LIKE ? OR topic LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
            sql += ' ORDER BY id';
            const rows = await env.QUESTIONS_DB.prepare(sql).bind(...params).all();
            const items = (rows.results || []).map(r => ({
              ...r,
              options: typeof r.options === 'string' ? JSON.parse(r.options) : r.options
            }));
            return json({ questions: items, total: items.length });
          }catch(err){console.error('Questions DB error', err)}
        }
        if(assets['/data/questions.json']){
          let list = JSON.parse(assets['/data/questions.json'].body);
          const cat = url.searchParams.get('category');
          const diff = url.searchParams.get('difficulty');
          const search = url.searchParams.get('search')?.toLowerCase();
          if(cat && cat !== 'All') list = list.filter(q => q.category === cat);
          if(diff && diff !== 'All') list = list.filter(q => q.difficulty === diff);
          if(search) list = list.filter(q => q.question.toLowerCase().includes(search) || q.topic.toLowerCase().includes(search));
          return json({ questions: list, total: list.length });
        }
        return json({ questions: [], total: 0 });
      }
      if(!user)return json({error:'Sign in to sync your progress.'},401);
      if(url.pathname==='/api/account'&&request.method==='GET')return json({email:user.email});
      if(url.pathname!=='/api/progress')return json({error:'Not found'},404);
      if(!env.DB)return json({error:'Progress is temporarily unavailable. Please retry.'},503);
      try{
        if(request.method==='GET'){
          const rows=await env.DB.prepare('SELECT activity_id, completed_at FROM progress WHERE user_id = ? ORDER BY completed_at').bind(user.id).all();
          return json({progress:rows.results});
        }
        if(request.method!=='POST')return json({error:'Method not allowed'},405);
        if(request.headers.get('origin')!==url.origin)return json({error:'Request origin not allowed.'},403);
        if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Expected JSON.'},415);
        if(Number(request.headers.get('content-length'))>4096)return json({error:'Request too large.'},413);
        const text=await request.text();if(text.length>4096)return json({error:'Request too large.'},413);
        let data;try{data=JSON.parse(text)}catch{return json({error:'Invalid JSON.'},400)}
        if(!data||Object.keys(data).some(k=>k!=='activityId')||(!known.has(data.activityId)&&!data.activityId.startsWith('q:')))return json({error:'Unknown activity.'},400);
        await env.DB.prepare('INSERT INTO progress (user_id, activity_id, completed_at) VALUES (?, ?, ?) ON CONFLICT(user_id, activity_id) DO NOTHING').bind(user.id,data.activityId,new Date().toISOString()).run();
        return json({saved:true,activityId:data.activityId});
      }catch(error){console.error('Progress storage unavailable',error?.message);return json({error:'Could not sync progress. Your answer is still here; retry saving.'},503)}
    }
    if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
    const file=assets[url.pathname==='/'?'/index.html':url.pathname];
    if(!file)return new Response('Not found',{status:404});
    return new Response(request.method==='HEAD'?null:file.body,{headers:{'content-type':file.type,'cache-control':'no-cache','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin'}});
  }};
}
