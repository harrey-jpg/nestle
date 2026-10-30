// Full-body companions. The approved portrait heads are reused without redrawing.
include('couple-study.px.js');

const fullBodyMoods=['neutral','happy','affectionate','sad','surprised','sleepy','laughing','angry',
  'worried','shy','confused','annoyed','crying','excited','winking','kissing'];

function body(c,longHair) {
  // Feet share a baseline so swapping expressions never shifts a character.
  // Shoes and lower garments are a proposed outfit completion; the photo was cropped.
  c.poly([20,89,30,89,29,105,28,119,24,123,19,120,20,109],'a');
  c.poly([35,89,44,89,45,108,44,121,39,123,35,120,34,105],'a');
  c.poly([22,93,28,93,27,108,26,119,22,120,21,116],'s');
  c.poly([36,93,41,93,43,108,42,119,38,120,36,116],'c');
  c.line(23,104,23,113,'l',2);c.line(38,104,39,112,'s',2);
  c.hline(22,117,5,'c');c.hline(37,117,5,'b');
  // Soft dark loafers, rather than block feet.
  c.poly([20,119,27,119,29,122,28,126,15,126,14,124,16,121],'h');
  c.poly([36,119,43,119,47,122,49,124,48,126,35,126,34,123],'h');
  c.poly([18,122,24,121,27,122,26,124,16,124],'H');
  c.poly([37,122,41,121,46,123,47,124,36,124],'H');
  c.hline(17,122,7,'j');c.hline(38,122,6,'j');
  c.hline(16,126,12,'t');c.hline(36,126,12,'t');

  // Back hair is behind the arms and garments, not a rectangle pasted on top.
  if(longHair) {
    c.poly([11,40,17,40,21,49,20,63,16,72,11,70,10,59],'h');
    c.poly([39,40,48,39,51,54,50,73,47,82,39,79,38,58],'h');
    c.line(13,48,13,63,'H',2);c.line(47,47,48,66,'H',2);
  }
  // Rounded shoulders, elbows and a slight bend at the wrists.
  c.poly([22,51,17,52,14,56,12,63,10,74,10,82,12,86,15,85,16,81,15,73,18,64,24,59],'a');
  c.poly([41,51,47,53,50,57,52,64,54,75,53,83,51,87,48,85,48,81,50,74,46,65,40,59],'a');
  c.poly([17,55,15,58,14,64,12,74,12,80,14,81,14,72,17,64,21,58],'s');
  c.poly([46,56,49,60,51,66,52,74,51,81,49,81,51,73,47,64,44,59],'c');
  c.line(15,59,14,67,'l');c.line(49,61,50,69,'s');
  // Mitt-like hands with a thumb notch and a two-pixel warm highlight.
  c.poly([10,79,14,78,16,82,15,86,12,88,9,85,9,82],'a');
  c.poly([10,80,13,80,14,83,13,86,11,86,10,84],'s');
  c.line(10,81,10,83,'l');c.px(14,82,'c');
  c.poly([50,79,53,80,55,84,53,88,50,89,47,86,48,82],'a');
  c.poly([50,81,52,81,53,84,51,87,49,86,49,83],'c');
  c.line(50,81,49,83,'s');

  // Neck follows the already approved jaw and its warm shading.
  c.poly([25,42,39,42,39,50,43,53,38,60,27,60,22,53,26,50],'a');
  c.poly([28,44,36,44,36,51,39,53,35,57,30,57,27,53,28,50],'s');
  c.poly([28,45,36,46,36,50,32,52,28,50],'c');

  if(longHair) {
    // Softer shoulders, fitted waist and an A-line skirt give the body a gentler silhouette.
    c.poly([24,50,27,53,32,59,37,53,40,50,44,53,46,60,45,65,42,70,40,77,42,82,40,86,24,86,22,82,24,76,22,70,19,64,19,58,21,54],'t');
    c.poly([23,55,25,54,31,62,34,62,39,54,42,55,44,60,43,65,40,71,38,77,40,82,37,84,27,84,24,81,26,76,24,69,21,63,21,59],'u');
    c.poly([17,54,20,53,22,57,20,64,17,73,16,79,14,82,11,80,11,74,13,63,14,58],'T');
    c.poly([44,54,48,56,50,61,53,74,52,81,49,82,47,78,49,70,46,63,43,58],'T');
    // Rosettes are deliberately placed and clipped to the fabric colors.
    for(let y=55;y<82;y+=5) for(let x=11+(y%3);x<54;x+=6) {
      if(!c.is(x,y,'uT'))continue;
      for(const [dx,dy]of [[0,0],[1,-1],[2,0],[0,2],[2,2]])
        if(c.is(x+dx,y+dy,'uT'))c.px(x+dx,y+dy,'H');
      if(c.is(x+1,y+1,'uT'))c.px(x+1,y+1,'t');
    }
    c.line(24,51,31,61,'T');c.line(40,51,34,62,'t');
    c.poly([23,81,41,81,44,85,46,90,49,96,46,98,17,98,15,96,18,90,20,85],'h');
    c.poly([24,84,30,84,29,94,19,96,18,94,21,87],'H');
    c.poly([35,84,40,84,43,88,46,95,40,96],'H');
    c.line(24,85,21,94,'j');c.line(37,86,41,95,'j');
    c.hline(24,82,16,'j');c.hline(18,97,28,'k');
    // Long hair falls over one shoulder, consistent with the photograph.
    c.poly([40,41,48,42,49,55,47,65,47,74,44,79,39,77,40,66,41,54],'h');
    c.poly([44,45,46,46,47,55,45,67,45,74,43,76,42,73,43,61],'H');
    c.line(45,49,45,58,'j');c.line(44,63,43,73,'j');
    c.poly([12,42,17,42,17,52,16,59,13,63,11,61,13,52],'h');
    c.line(14,45,14,56,'H');
  } else {
    // Leaner jersey silhouette with narrower sides and relaxed armholes.
    c.poly([24,50,27,52,32,55,37,52,39,50,43,53,45,59,42,65,41,74,43,84,40,88,25,88,22,84,24,74,22,65,19,59,20,54],'m');
    c.poly([25,55,29,57,34,58,39,55,41,57,40,64,38,74,40,82,37,85,27,85,25,82,27,73,24,64],'M');
    c.line(22,54,21,59,'w');c.line(21,59,24,64,'w');
    c.line(42,54,43,59,'w');c.line(43,59,41,64,'w');
    c.line(25,53,30,57,'p');c.line(30,57,35,57,'p');c.line(35,57,40,53,'p');
    c.poly([35,63,38,63,44,78,44,83,41,82],'p');
    c.line(35,62,42,78,'w',2);c.line(38,63,43,75,'P');
    c.rect(25,67,5,4,'n');c.hline(26,67,3,'N');c.px(37,75,'w');c.px(39,79,'w');
    c.hline(23,85,18,'m');
    c.poly([23,87,41,87,43,92,42,100,40,102,35,101,32,95,30,102,23,102,22,99],'h');
    c.poly([25,89,31,89,31,94,28,100,24,100,24,97],'N');
    c.poly([34,89,39,89,41,93,40,99,36,100,34,95],'n');
    c.hline(23,89,17,'N');c.vline(32,91,6,'h');c.hline(23,101,6,'j');c.hline(36,101,6,'H');
  }
}

for(const [id,longHair]of [['long_hair',true],['short_hair',false]]) {
  for(const mood of fullBodyMoods) {
    sprite(`fullbody_${id}_${mood}`,{w:64,h:128},
      c=>body(c,longHair),
      clip([0,0,64,47],stamp(`portrait_${id}_${mood}`,0,0)));
  }
  anim(`fullbody_idle_${id}`,{base:`fullbody_${id}_neutral`},
    frame({ms:1600}),
    frame({ms:120},c=>{
      c.rect(21,27,8,6,'l');c.rect(34,27,8,6,'l');
      c.poly([38,27,42,27,42,33,39,33],'s');
      c.line(22,29,25,30,'H');c.hline(25,30,3,'H');
      c.hline(35,30,3,'H');c.line(38,30,40,29,'H');
    }),
    frame({ms:1300}));
  sheet(`fullbody_${id}_sheet`,fullBodyMoods.map(m=>`fullbody_${id}_${m}`),{cols:4,pad:2});
}

scene('fullbody_preview',{w:324,h:184,bg:'f'},c=>{
  c.rect(0,0,324,24,'z');c.text(12,8,'A LITTLE MORE YOU','Q',{scale:2});
  c.text(247,11,'FULL BODY / 02','F');
  for(const [index,[id,mood,label]]of [
    ['long_hair','neutral','HER / NEUTRAL'],['short_hair','neutral','HIM / NEUTRAL'],
    ['long_hair','happy','HER / HAPPY'],['short_hair','affectionate','HIM / AFFECTION']
  ].entries()) {
    const x=8+index*79;
    c.rect(x,30,72,139,'F');c.box(x,30,72,139,'v');
    c.ellipse(x+36,162,21,3,'v');c.stamp(`fullbody_${id}_${mood}`,x+4,35);
    c.text(x+36,175,label,'z',{align:'c'});
  }
});

for(const [id,label]of [['long_hair','HER FULL-BODY EXPRESSIONS'],['short_hair','HIS FULL-BODY EXPRESSIONS']]) {
  scene(`fullbody_review_${id}`,{w:316,h:624,bg:'f'},c=>{
    c.rect(0,0,316,23,'z');c.text(12,8,label,'Q');c.text(273,8,'SET 02','F');
    for(const [index,mood]of fullBodyMoods.entries()) {
      const x=6+(index%4)*78,y=41+Math.floor(index/4)*143;
      c.text(x+35,y-10,`${index+1} ${mood.toUpperCase()}`,'z',{align:'c'});
      c.rect(x,y,72,132,'F');c.box(x,y,72,132,'v');
      c.ellipse(x+36,y+127,21,3,'v');c.stamp(`fullbody_${id}_${mood}`,x+4,y+1);
    }
    c.text(158,615,'SAME FACES / ALL SIXTEEN EXPRESSIONS','z',{align:'c'});
  });
}
