export const mediaLimit=10*1024*1024;
export async function inspectImage(file){
  if(!file||file.size===0||file.size>mediaLimit)throw new Error('Choose a photo or GIF under 10 MB.');
  const b=new Uint8Array(await file.slice(0,16).arrayBuffer()),s=String.fromCharCode(...b);
  const ext=b[0]===255&&b[1]===216&&b[2]===255?'jpg':s.startsWith('\x89PNG\r\n\x1a\n')?'png':/^GIF8[79]a/.test(s)?'gif':s.startsWith('RIFF')&&s.slice(8,12)==='WEBP'?'webp':null;
  if(!ext)throw new Error('Choose a JPEG, PNG, WebP photo or an animated GIF.');
  return {ext,type:ext==='jpg'?'image/jpeg':`image/${ext}`};
}
export function validMediaPath(path){return /^(alexa|harry)\/[a-f0-9-]{36}\/image\.(jpg|png|webp|gif)$/.test(path||'');}
export async function uploadImage(client,profile,id,file){
  const {ext,type}=await inspectImage(file),path=`${profile}/${id}/image.${ext}`;
  const {error}=await client.storage.from('nestle-chat').upload(path,file,{contentType:type,upsert:false});
  // A lost upload response may leave the immutable object present. Its signed URL proves access.
  if(error){const existing=await client.storage.from('nestle-chat').createSignedUrl(path,60);if(existing.error)throw new Error('Photo upload failed. Keep this screen open and try again.');}
  return path;
}
export function showMedia(client,node,path){
  if(!validMediaPath(path)||node.dataset.path===path)return;
  node.dataset.path=path;node.hidden=false;
  let refreshed=false;
  const load=async()=>{
    const {data,error}=await client.storage.from('nestle-chat').createSignedUrl(path,3600);
    if(error){node.alt='Photo couldn’t load. Tap to retry.';return;}
    node.src=data.signedUrl;node.alt=path.endsWith('.gif')?'Animated GIF':'Shared photo';
  };
  node.addEventListener('error',()=>{if(!refreshed){refreshed=true;load();}});
  node.addEventListener('click',()=>{refreshed=false;load();});load();
}
