import express from 'express';
import multer from 'multer';
import path from 'path';
import {fileURLToPath} from 'url';
const app=express();const dir=path.dirname(fileURLToPath(import.meta.url));
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:8*1024*1024}});
app.disable('x-powered-by');
app.get('/api/status',(req,res)=>res.json({ok:true,version:'16.0.0',aiConfigured:!!process.env.OPENAI_API_KEY}));
let last=0;
app.post('/api/ai/design',upload.single('image'),async(req,res)=>{
 try{
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'OPENAI_API_KEY ontbreekt in Render environment.'});
  if(Date.now()-last<10000)return res.status(429).json({error:'Wacht 10 seconden voor de volgende generatie.'});
  const prompt=String(req.body.prompt||'').trim();if(!prompt||prompt.length>2500)return res.status(400).json({error:'Ontwerpbeschrijving verplicht (max 2500 tekens).'});
  if(req.file&&!['image/png','image/jpeg','image/webp'].includes(req.file.mimetype))return res.status(400).json({error:'Alleen PNG, JPG of WebP toegestaan.'});
  last=Date.now();
  const fullPrompt='Create a high-quality realistic professional apparel product design image, clean studio background, clearly visible garment, realistic fabric drape and seams. Follow the user instructions: '+prompt;
  let url='https://api.openai.com/v1/images/generations',options={method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-image-1.5',prompt:fullPrompt,size:'1024x1024',quality:'medium'})};
  if(req.file){url='https://api.openai.com/v1/images/edits';const form=new FormData();form.append('model','gpt-image-1.5');form.append('prompt',fullPrompt+' Use the attached image as visual reference.');form.append('size','1024x1024');form.append('quality','medium');form.append('image',new Blob([req.file.buffer],{type:req.file.mimetype}),req.file.originalname||'reference.png');options={method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY},body:form}}
  const response=await fetch(url,options);const data=await response.json();if(!response.ok)return res.status(response.status).json({error:data.error?.message||'AI provider error'});
  const b64=data.data?.[0]?.b64_json;if(!b64)return res.status(502).json({error:'AI leverde geen afbeelding terug.'});
  res.json({image:'data:image/png;base64,'+b64});
 }catch(err){console.error('AI design error',err.message);res.status(500).json({error:'Generatie mislukt. Controleer serverlogs.'})}
});
app.use(express.static(path.join(dir,'public')));
app.use((err,req,res,next)=>{if(err?.code==='LIMIT_FILE_SIZE')return res.status(413).json({error:'Upload maximaal 8 MB.'});res.status(400).json({error:'Upload mislukt.'})});
app.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('WAISI V16 running'));
