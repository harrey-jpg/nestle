// Shared controller overlay: screen and thumbs only, independent of faces and outfits.
include('activities.px.js');
function playGame(c,step) {
  if(!step)return;
  c.rect(52,107,26,10,'d');c.rect(52,117,26,2,'o');
  c.rect(53,115,5,3,'u');c.rect(73,113,3,5,'g');
  const x=[64,64,66,68][step],y=[110,110,108,110][step];
  c.rect(x,y,4,8,'p');c.px(x+2,y+1,'Q');
  if(step===2)c.hline(63,116,3,'q');
  // The palms stay around the console while each thumb briefly presses inward.
  if(step===1||step===3){c.ellipse(41,112,3,2,'a');c.hline(40,111,3,'s');}
  if(step===2||step===3){c.ellipse(87,111,3,2,'a');c.hline(86,110,3,'s');}
}
anim('gaming_thumb_taps',{w:128,h:208},
  frame({ms:4000}),...[1,2,3].map(step=>frame({ms:400},c=>playGame(c,step))));
scene('gaming_motion_review',{w:512,h:240,bg:'f'},c=>{
  for(let step=0;step<4;step++) {
    c.stamp('gaming_homebody_short_hair_neutral',step*128,24);
    c.stamp('gaming_thumb_taps',step*128,24,{frame:step});
    c.text(step*128+64,8,['PLAY','LEFT TAP','RIGHT TAP','SETTLE'][step],'z',{align:'c'});
  }
});
