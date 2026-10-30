// Adult-proportioned, softly outlined pixel interpretation of a cozy home-game body.
// Original artwork; the approved portrait head is reused exactly at offset (8, 0).
include('couple-study.px.js');
const homeBodyMoods=['neutral','happy','affectionate','sad','surprised','sleepy','laughing','angry',
  'worried','shy','confused','annoyed','crying','excited','winking','kissing'];

function homeBody(c,longHair) {
  // Broader, slightly shorter body geometry; the approved head is stamped separately.
  const ink=c;
  const x=value=>Math.round(40+(value-40)*1.16);
  const y=value=>value<=47?value:47+Math.round((value-47)*.9);
  c={
    poly:(points,color)=>ink.poly(points.map((value,index)=>index%2?y(value):x(value)),color),
    line:(x0,y0,x1,y1,color,width)=>ink.line(x(x0),y(y0),x(x1),y(y1),color,width),
    rect:(left,top,w,h,color)=>ink.rect(x(left),y(top),Math.max(1,x(left+w)-x(left)),Math.max(1,y(top+h)-y(top)),color),
    px:(left,top,color)=>ink.px(x(left),y(top),color),
    hline:(left,top,length,color)=>ink.hline(x(left),y(top),Math.max(1,x(left+length)-x(left)),color),
    vline:(left,top,length,color)=>ink.vline(x(left),y(top),Math.max(1,y(top+length)-y(top)),color),
    is:(left,top,colors)=>ink.is(x(left),y(top),colors)
  };
  // Flat warm fills and a single shadow band replace the anatomical highlight clusters.
  if(longHair) {
    c.poly([24,113,37,113,36,148,34,178,33,209,28,216,23,213,24,184,24,155],'a');
    c.poly([26,118,35,118,34,150,31,181,31,209,27,211,26,206,27,179,26,153],'s');
    c.poly([44,114,56,114,57,150,54,181,54,210,49,216,44,212,45,181,43,151],'a');
    c.poly([46,119,54,119,55,151,51,181,52,209,48,212,47,207,48,178,46,151],'s');
    c.line(27,172,31,173,'c');c.line(48,172,52,172,'c');
  } else {
    c.poly([23,121,37,121,37,152,35,183,34,212,29,217,23,213,25,182,23,153],'a');
    c.poly([26,125,35,125,35,153,32,184,32,210,28,213,26,208,28,182,26,153],'s');
    c.poly([44,122,58,122,59,151,57,182,58,211,53,216,47,213,46,183,44,152],'a');
    c.poly([47,125,56,125,57,152,54,183,55,210,52,213,49,208,49,182,47,153],'s');
    c.hline(27,174,6,'c');c.hline(49,174,6,'c');
  }
  // Rounded everyday shoes with simple cream soles.
  c.poly([24,208,33,208,36,214,34,221,16,221,15,218,18,214],'h');
  c.poly([47,208,56,208,63,215,65,218,64,221,45,221,44,217],'h');
  c.poly([22,213,31,211,34,215,32,217,18,218,18,216],'H');
  c.poly([49,212,55,212,61,216,62,218,47,217,47,215],'H');
  c.hline(17,219,17,'q');c.hline(46,219,18,'q');
  c.hline(23,214,7,'j');c.hline(50,214,7,'j');

  // Natural neck and soft shoulder line; the portrait overlays its top boundary.
  c.poly([33,42,47,42,47,56,53,61,45,69,34,69,27,61,34,55],'a');
  c.poly([36,44,44,44,44,56,49,60,43,65,36,65,31,61,37,56],'s');
  c.poly([36,45,44,46,44,53,39,55,36,52],'c');

  if(longHair) {
    // Long hair behind a gently fitted blouse; one arm rests on the hip.
    c.poly([19,41,26,41,27,62,24,91,19,105,16,101,17,76],'h');
    c.poly([47,41,57,41,61,65,60,92,57,107,48,104,47,72],'h');
    // The sleeve on the viewer's left bends outward, then returns to the hip.
    c.poly([26,59,21,61,16,68,11,80,8,93,10,99,16,104,23,110,29,110,31,105,25,100,17,94,16,91,20,81,27,72],'t');
    c.poly([24,63,19,70,14,82,11,93,13,97,25,106,28,106,24,103,15,95,14,91,19,79,25,72],'u');
    // A relaxed hanging arm on the other side, with a small rounded hand.
    c.poly([55,61,61,65,65,75,67,91,68,113,67,128,64,133,59,131,57,125,59,110,58,94,54,79,49,70],'t');
    c.poly([57,65,61,72,63,82,64,97,65,115,64,126,61,127,61,112,60,95,56,81,52,71],'u');
    c.poly([60,125,65,125,67,130,66,137,63,141,59,139,57,134,58,129],'a');
    c.poly([60,128,64,128,64,135,62,138,59,135,59,131],'s');
    // Rounded bust, tapered waist, and a subtle flare toward the skirt waistband.
    c.poly([29,57,33,59,40,69,47,59,51,57,57,62,59,71,56,84,52,98,51,110,55,122,51,128,28,128,24,123,29,109,27,96,22,81,22,70,25,62],'t');
    c.poly([29,62,32,62,39,73,42,73,48,62,51,62,55,68,55,79,50,96,48,109,52,121,48,125,31,125,28,121,32,109,30,96,26,81,26,70],'u');
    c.line(31,59,39,72,'T');c.line(49,59,42,73,'t');
    // Sparse printed rosettes belong to the blouse, not to the skin or skirt.
    for(let y=67;y<123;y+=8)for(let x=12+(y%3);x<66;x+=9) {
      if(!c.is(x,y,'u'))continue;
      for(const [dx,dy]of [[0,0],[1,-1],[2,0],[0,2],[2,2]])
        if(c.is(x+dx,y+dy,'u'))c.px(x+dx,y+dy,'H');
      if(c.is(x+1,y+1,'u'))c.px(x+1,y+1,'T');
    }
    // Her hand sits visibly on the waist, beyond the patterned sleeve.
    c.poly([23,105,28,102,33,102,35,105,32,108,31,113,26,115,22,112],'a');
    c.poly([25,106,29,104,32,105,29,108,29,111,26,112,24,110],'s');
    c.poly([27,123,52,123,56,130,60,146,58,151,21,151,19,147,23,132],'h');
    c.poly([29,127,36,127,34,147,23,148,24,139],'H');
    c.poly([45,127,50,128,55,145,55,148,47,148],'H');
    c.hline(28,125,23,'j');c.line(30,133,28,145,'j');
    // Front hair extends from the approved head to below the chest.
    c.poly([48,41,56,42,59,62,57,82,57,101,53,110,48,109,48,96,50,76,50,57],'h');
    c.poly([52,47,55,48,56,65,54,84,54,100,51,106,50,103,52,80],'H');
    c.line(54,55,54,72,'j');c.line(52,87,51,101,'j');
  } else {
    // Relaxed lean arms taper smoothly; hands settle into the shorts pockets.
    c.poly([22,59,17,62,12,71,10,83,11,96,17,110,24,123,30,124,33,119,29,111,22,99,19,87,21,77,28,68],'a');
    c.poly([20,64,16,72,14,83,15,94,21,108,27,119,30,119,25,109,19,97,16,85,19,75,25,68],'s');
    c.poly([57,59,63,63,68,73,70,85,68,99,62,113,56,124,50,124,48,119,52,111,58,100,61,88,59,77,52,68],'a');
    c.poly([59,65,63,73,66,85,64,98,58,111,53,119,51,119,56,108,61,97,64,85,60,73,56,68],'s');
    // Simple sport jersey with a soft shoulder cap and a gently narrowed waist.
    c.poly([28,57,32,59,40,64,48,59,51,57,59,61,62,68,58,78,54,93,54,109,57,124,53,131,27,131,23,126,26,110,25,94,21,79,18,69,21,61],'m');
    c.poly([28,63,33,64,40,68,48,64,53,63,57,67,54,78,51,94,51,110,54,123,50,128,30,128,27,124,29,110,28,94,25,79,23,68],'M');
    c.line(23,62,21,69,'w',2);c.line(21,69,25,78,'w');
    c.line(57,62,60,69,'w',2);c.line(60,69,56,78,'w');
    c.line(31,61,39,67,'p');c.line(39,67,48,61,'p');
    c.line(43,79,52,110,'w',2);c.line(47,81,54,105,'P');
    c.rect(29,86,6,5,'n');c.hline(30,86,4,'N');c.px(48,113,'w');
    c.poly([26,127,54,127,57,134,56,157,53,161,43,160,40,149,37,161,26,161,23,157,24,138],'h');
    c.poly([28,131,39,131,38,147,34,158,27,158,27,143],'N');
    c.poly([43,131,52,131,54,139,53,157,45,157,43,147],'n');
    c.hline(28,130,23,'j');c.line(40,136,40,149,'h');
    c.line(26,132,31,139,'h');c.line(54,132,49,139,'h');
    // A few skin pixels at each pocket keep the posture clear without drawn fingers.
    c.poly([26,124,30,124,32,129,31,135,28,136,25,131],'a');
    c.poly([27,125,29,126,30,131,28,132,27,129],'s');
    c.poly([50,124,54,124,56,130,52,136,49,133,48,129],'a');
    c.poly([51,126,53,126,53,130,51,133,50,130],'s');
  }
}

for(const [id,longHair]of [['long_hair',true],['short_hair',false]]) {
  for(const mood of homeBodyMoods)
    sprite(`homebody_${id}_${mood}`,{w:80,h:208},c=>homeBody(c,longHair),
      clip([8,0,64,47],stamp(`portrait_${id}_${mood}`,8,0)));
  anim(`homebody_idle_${id}`,{base:`homebody_${id}_neutral`},
    frame({ms:1600}),
    frame({ms:120},c=>{
      c.rect(29,27,8,6,'l');c.rect(42,27,8,6,'l');
      c.poly([46,27,50,27,50,33,47,33],'s');
      c.line(30,29,33,30,'H');c.hline(33,30,3,'H');
      c.hline(43,30,3,'H');c.line(46,30,48,29,'H');
    }),
    frame({ms:1300}));
  sheet(`homebody_${id}_sheet`,homeBodyMoods.map(m=>`homebody_${id}_${m}`),{cols:4,pad:2});
}

scene('homebody_preview',{w:376,h:262,bg:'f'},c=>{
  c.rect(0,0,376,24,'z');c.text(11,8,'AT HOME, TOGETHER','Q',{scale:2});
  c.text(283,11,'APPROVED STYLE','F');
  for(const [index,[id,mood,label]]of [
    ['long_hair','neutral','HER / NEUTRAL'],['short_hair','neutral','HIM / NEUTRAL'],
    ['long_hair','happy','HER / HAPPY'],['short_hair','affectionate','HIM / AFFECTION']
  ].entries()) {
    const x=7+index*92;
    c.rect(x,30,86,216,'F');c.box(x,30,86,216,'v');
    c.ellipse(x+43,238,30,3,'v');c.stamp(`homebody_${id}_${mood}`,x+3,34);
    c.text(x+43,253,label,'z',{align:'c'});
  }
});
