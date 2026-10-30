// Original pixel portraits drawn from the supplied couple photo.
// Portraits: 64x64. Overworld sprites: 24x40. Not integrated into the app yet.
pal({
  k:'#241c24', h:'#17191d', H:'#2c2929', j:'#463b33', J:'#655044',
  a:'#774637', b:'#a66449', c:'#c8855c', s:'#dfa374', l:'#f2bd88', L:'#ffcf9c',
  r:'#a85650', R:'#cb7864', e:'#faf0d0', i:'#453025', I:'#80523a',
  m:'#76283f', M:'#a63b59', p:'#cb5070', P:'#e6768c', w:'#f9dab6',
  t:'#69503a', T:'#ae865a', u:'#d6b17a', U:'#f0cd91', g:'#d7ac61',
  n:'#253b46', N:'#435561', q:'#ead7c5', Q:'#fff1dc', z:'#6f354b',
  f:'#f5e5d2', F:'#e5c7ad', v:'#bd8c70', d:'#74acc3', D:'#c0e5e5'
});

function blouse(c) {
  c.poly([5,64,7,55,16,51,23,48,40,48,49,52,57,56,61,64],'t');
  c.poly([7,64,9,56,24,50,39,50,53,56,58,64],'u');
  // Intentional leopard rosettes follow the blouse, rather than random noise.
  for(let y=51;y<64;y+=4) for(let x=8+(y%3);x<58;x+=6) {
    if(!c.is(x,y,'u'))continue;
    for(const [dx,dy] of [[0,0],[1,-1],[2,0],[2,1],[0,2]])
      if(c.is(x+dx,y+dy,'u'))c.px(x+dx,y+dy,'H');
    if(c.is(x+1,y+1,'u'))c.px(x+1,y+1,'T');
  }
  c.poly([24,49,39,49,33,60,30,60],'a');
  c.poly([26,49,37,49,32,57],'s');
  c.line(23,50,29,61,'T');c.line(40,50,34,61,'t');
}

function jersey(c) {
  c.poly([2,64,4,57,18,51,24,48,39,48,46,51,58,57,62,64],'a');
  c.poly([3,64,6,57,17,53,18,64],'c');
  c.poly([47,53,57,58,60,64,46,64],'s');
  c.poly([14,64,17,53,25,49,39,49,47,53,51,64],'m');
  c.poly([20,64,20,54,26,52,37,52,44,55,47,64],'M');
  c.poly([26,49,39,49,36,54,31,56,27,53],'a');
  c.line(18,53,16,63,'w');c.line(45,53,49,63,'w');
  c.line(22,55,27,58,'p');c.line(27,58,32,58,'p');c.line(32,58,39,54,'p');
  c.line(38,57,45,64,'w');c.line(41,56,49,64,'P');
  c.rect(24,60,5,3,'n');c.rect(25,60,3,1,'N');
  c.px(39,61,'w');c.px(43,59,'w');
}

function portrait(c,longHair,expression) {
  // Different silhouettes retain the long centre part and the shorter curtain fringe.
  if(longHair) {
    c.poly([10,64,10,30,11,18,15,10,22,5,30,3,38,5,45,10,49,19,50,41,53,64],'h');
    c.poly([12,60,13,22,17,13,25,7,30,6,27,26,22,43,21,61],'H');
    c.poly([37,9,44,16,47,30,48,52,45,64,37,64,36,36],'H');
    blouse(c);
  } else jersey(c);
  // Neck and ears.
  c.poly([25,40,39,40,39,49,35,55,30,55,25,49],'a');
  c.poly([27,42,37,43,37,49,33,52,28,49],'c');
  c.poly([28,43,35,44,35,48,31,49,28,47],'s');
  c.ellipse(17,29,3,5,'a');c.ellipse(46,29,3,5,'a');
  c.ellipse(17,28,2,3,'c');c.ellipse(46,28,2,3,'c');
  // The long-haired partner has a more tapered chin; the short-haired partner a wider jaw.
  c.poly(longHair
    ? [18,18,24,12,34,11,41,16,45,24,44,34,40,42,34,47,29,47,23,43,19,35]
    : [17,18,23,12,35,11,43,17,46,25,45,36,41,43,34,47,27,46,21,41,18,33], 'a');
  c.poly(longHair
    ? [19,19,25,14,34,13,40,17,43,24,42,35,38,42,33,45,29,45,24,41,20,33]
    : [19,19,25,14,35,13,41,18,44,25,43,35,39,42,34,45,28,44,23,40,20,32], 's');
  c.poly([21,22,26,16,33,15,38,19,39,26,36,30,26,31,22,28],'l');
  c.poly([20,30,25,31,28,35,28,40,25,39,22,35],'l');
  c.poly([40,24,43,27,42,35,38,41,34,44,29,43,36,40,39,34],'c');
  c.line(25,42,29,44,'b');c.line(29,44,34,45,'c');
  // Brows, eyes, nose and lips are separate clusters, with no smoothing.
  c.line(22,25,26,24,'H');c.line(27,24,28,25,'j');
  c.line(35,24,39,24,'H');c.px(40,25,'j');
  if(expression==='happy'||expression==='affectionate') {
    c.line(22,29,24,28,'k');c.line(24,28,27,29,'k');
    c.line(35,29,37,28,'k');c.line(37,28,40,29,'k');
    c.hline(23,30,3,'b');c.hline(36,30,3,'b');
  } else {
    c.hline(22,28,6,'a');c.hline(35,28,6,'a');
    c.hline(22,29,6,'e');c.hline(35,29,6,'e');
    c.rect(24,28,3,4,'i');c.rect(37,28,3,4,'i');
    c.hline(24,28,3,'k');c.hline(37,28,3,'k');
    c.px(24,29,'e');c.px(37,29,'e');c.px(26,31,'I');c.px(39,31,'I');
    c.line(23,32,26,32,'b');c.line(36,32,39,32,'b');
    if(longHair){c.px(21,28,'k');c.px(40,28,'k');}
  }
  c.line(32,29,31,34,'c');c.line(31,34,33,35,'b');
  c.px(34,34,'l');c.hline(30,36,4,'c');
  c.hline(23,34,3,'R');c.hline(38,34,3,'R');
  if(expression==='happy') {
    c.poly([27,38,36,38,34,42,30,42],'a');
    c.hline(28,38,7,'e');c.hline(30,41,4,'r');
  } else {
    c.line(28,39,31,40,'r');c.line(31,40,35,39,'a');
    c.hline(30,41,4,'R');c.px(35,38,'b');
    if(longHair)c.hline(29,39,5,'r');
  }
  if(expression==='affectionate') {
    c.hline(22,35,5,'R');c.hline(37,35,5,'R');
    c.px(23,36,'r');c.px(40,36,'r');
  }
  // New expressions repaint only facial clusters. The approved three remain unchanged.
  if(['sad','surprised','sleepy','laughing','angry'].includes(expression)) {
    c.rect(21,23,8,10,'l');c.rect(34,23,8,10,'l');
    c.poly([38,24,42,25,42,33,39,33],'s');
    c.rect(27,37,10,6,'s');c.hline(28,43,8,'s');
    if(expression==='sad') {
      c.line(22,26,27,23,'H');c.line(35,23,40,26,'H');
      c.hline(23,29,5,'a');c.hline(35,29,5,'a');
      c.rect(25,29,2,3,'i');c.rect(36,29,2,3,'i');
      c.px(25,29,'e');c.px(36,29,'e');
      c.line(28,41,31,39,'r');c.line(31,39,35,41,'a');
      c.hline(30,42,4,'c');
    } else if(expression==='surprised') {
      c.line(22,24,25,22,'H');c.hline(35,22,5,'H');
      c.ellipse(25,29,3,4,'a');c.ellipse(37,29,3,4,'a');
      c.ellipse(25,29,2,3,'e');c.ellipse(37,29,2,3,'e');
      c.rect(25,28,2,4,'i');c.rect(37,28,2,4,'i');
      c.px(25,28,'L');c.px(37,28,'L');
      c.ellipse(32,40,2,3,'a');c.hline(31,42,3,'r');
    } else if(expression==='sleepy') {
      c.hline(23,25,5,'j');c.hline(35,25,5,'j');
      c.line(22,29,25,31,'H');c.hline(25,31,3,'H');
      c.line(35,31,38,31,'H');c.px(39,30,'H');
      c.hline(24,33,4,'c');c.hline(35,33,4,'c');
      c.ellipse(32,40,2,2,'r');c.hline(31,39,3,'a');
    } else if(expression==='angry') {
      // A focused glare and a closed, tense mouth instead of a pinched grimace.
      c.line(22,25,27,27,'H');c.line(35,27,40,25,'H');
      c.hline(23,29,5,'a');c.hline(35,29,5,'a');
      c.hline(24,30,4,'e');c.hline(35,30,4,'e');
      c.rect(25,29,2,3,'i');c.rect(36,29,2,3,'i');
      c.px(25,30,'I');c.px(36,30,'I');
      c.line(28,40,31,39,'a');c.line(31,39,35,40,'a');
      c.hline(30,41,4,'r');c.px(28,40,'c');c.px(36,40,'c');
    } else {
      c.line(22,25,26,24,'H');c.hline(35,24,5,'H');
      c.line(22,30,25,28,'k');c.line(25,28,28,30,'k');
      c.line(35,30,38,28,'k');c.line(38,28,41,30,'k');
      c.hline(23,33,4,'R');c.hline(37,33,4,'R');
      c.poly([26,37,38,37,36,42,33,44,30,44,27,41],'a');
      c.hline(27,37,10,'e');c.hline(28,38,8,'e');
      c.hline(30,42,5,'r');c.hline(31,43,3,'R');
    }
  }
  if(['worried','shy','confused','annoyed','crying','excited','winking','kissing'].includes(expression)) {
    c.rect(21,23,8,10,'l');c.rect(34,23,8,10,'l');
    c.poly([38,24,42,25,42,33,39,33],'s');
    c.rect(27,37,10,6,'s');c.hline(28,43,8,'s');
    const eye=(x,y=28,look=0)=>{
      c.hline(x,y,6,'a');c.hline(x,y+1,6,'e');
      c.rect(x+2+look,y,2,4,'i');c.px(x+2+look,y+1,'e');
      c.hline(x+1,y+4,4,'c');
    };
    const smile=()=>{c.line(28,39,31,40,'r');c.line(31,40,35,39,'a');c.hline(30,41,4,'R');};
    const closed=()=>{
      c.line(22,29,25,30,'H');c.hline(25,30,3,'H');
      c.hline(35,30,3,'H');c.line(38,30,40,29,'H');
    };
    if(expression==='worried') {
      c.line(22,26,27,23,'H');c.line(35,23,40,26,'H');
      eye(22,29,1);eye(35,29,1);
      c.line(28,41,31,39,'r');c.hline(31,39,3,'r');c.px(35,40,'a');
    } else if(expression==='shy') {
      c.line(22,25,27,24,'j');c.hline(35,24,5,'j');
      eye(22,30,-1);eye(35,30,-1);smile();
      c.hline(22,35,5,'R');c.hline(37,35,5,'R');c.hline(23,36,3,'r');c.hline(38,36,3,'r');
    } else if(expression==='confused') {
      c.line(22,25,27,26,'H');c.line(35,23,39,22,'H');
      eye(22,29,-1);eye(35,28,-1);
      c.line(28,40,31,40,'a');c.line(31,40,35,38,'r');c.px(35,39,'c');
    } else if(expression==='annoyed') {
      c.hline(22,25,6,'H');c.line(35,25,40,26,'H');
      c.hline(22,30,6,'a');c.hline(35,30,6,'a');
      c.hline(23,31,5,'e');c.hline(36,31,5,'e');
      c.rect(23,30,2,3,'i');c.rect(36,30,2,3,'i');
      c.hline(28,40,8,'r');c.px(35,39,'a');c.hline(30,42,4,'c');
    } else if(expression==='crying') {
      c.line(22,26,27,23,'H');c.line(35,23,40,26,'H');
      c.line(22,30,25,29,'k');c.line(25,29,28,31,'k');
      c.line(35,31,38,29,'k');c.line(38,29,41,30,'k');
      for(const x of [24,39]) {
        c.rect(x,32,2,5,'d');c.vline(x,33,3,'D');c.px(x,37,'d');
      }
      c.poly([28,41,30,38,33,38,36,41,33,40,30,40],'a');c.hline(30,41,4,'r');
    } else if(expression==='excited') {
      c.line(22,24,25,22,'H');c.line(35,22,40,24,'H');
      eye(22,27);eye(35,27);c.px(25,27,'L');c.px(38,27,'L');
      c.poly([27,37,37,37,35,42,32,44,29,42],'a');
      c.hline(28,37,8,'e');c.hline(29,38,6,'e');c.hline(30,42,4,'R');
      c.hline(23,34,4,'R');c.hline(38,34,4,'R');
    } else if(expression==='winking') {
      c.line(22,25,27,24,'H');c.line(35,24,40,25,'H');
      c.line(22,30,25,28,'k');c.line(25,28,28,30,'k');eye(35,28);
      c.hline(23,33,4,'R');smile();c.px(35,38,'a');
    } else {
      c.line(22,25,27,24,'j');c.hline(35,24,5,'j');closed();
      c.hline(22,35,5,'R');c.hline(38,35,4,'R');
      c.line(31,37,34,38,'r');c.line(34,38,32,39,'a');
      c.line(32,39,34,40,'r');c.line(34,40,31,41,'r');c.px(35,39,'R');
    }
  }
  // Photo landmarks: her cheek; his anatomical left side of the nose, just above the nostril.
  c.px(longHair?39:37,34,'a');
  if(longHair) {
    // Hair divides at the centre and falls mostly over the right shoulder in the photo.
    c.poly([13,27,13,18,17,10,24,6,30,5,30,12,26,17,23,20,20,24,18,32,16,38],'h');
    c.poly([31,5,38,7,45,12,48,22,48,46,50,63,39,64,39,52,42,39,43,27,39,21,35,17,31,12],'h');
    c.poly([15,22,17,14,23,9,28,8,27,12,22,16,19,23,17,31],'H');
    c.line(18,19,22,13,'j');c.line(22,13,27,10,'j');
    c.line(31,7,31,11,'c');c.px(30,12,'b');
    c.poly([34,9,39,12,43,18,45,30,43,46,43,59,40,62,41,43,42,28,39,19],'H');
    c.line(35,11,40,17,'j');c.line(40,17,43,27,'j');
    c.line(44,32,43,45,'j');c.line(43,48,42,58,'j');
    c.line(45,40,45,55,'j');c.line(14,34,14,45,'H');
    c.px(18,33,'g');c.px(18,34,'U');c.px(44,33,'g');
  } else {
    c.poly([14,30,12,23,13,15,16,10,21,7,29,6,35,4,40,6,45,8,49,13,50,20,47,29,44,31,42,23,37,18,33,16,29,19,25,20,22,24,18,27,17,33],'h');
    c.poly([15,23,16,16,21,11,29,9,34,7,31,13,27,17,22,18,18,23],'H');
    c.poly([34,8,39,8,46,12,48,19,45,25,42,20,38,18,34,14],'H');
    c.line(19,16,24,12,'j');c.line(24,12,29,11,'j');
    c.line(17,19,21,15,'J');c.line(21,15,25,14,'j');
    c.line(36,9,42,12,'j');c.line(42,12,45,16,'j');
    c.line(35,11,39,14,'J');c.line(39,14,42,15,'j');
    c.line(30,8,27,13,'j');c.line(27,13,25,16,'H');
    c.poly([23,15,28,13,26,18,23,22,24,17,21,21],'h');
    c.line(26,14,24,18,'H');
    c.px(32,7,'j');c.px(17,26,'H');
  }
}

function small(c,longHair,back=false,blink=false) {
  // Shaped shoulders, elbows, knees and shoes replace the original rectangular body.
  // Lower garments remain a styling choice because the photo is cropped.
  if(longHair)c.poly([6,16,5,8,7,4,11,2,16,3,19,7,19,20,18,27,6,27],'h');
  // Legs and shoes, with a shared baseline and visible separation.
  c.poly([8,29,12,29,12,34,11,37,8,37],'a');
  c.poly([14,29,17,29,17,36,14,37,13,34],'a');
  c.rect(9,31,2,5,'s');c.rect(14,31,2,5,'c');
  c.px(9,35,'l');c.px(14,35,'s');
  c.poly([8,36,11,36,12,38,11,39,6,39,6,38],'h');
  c.poly([14,36,17,36,19,38,19,39,13,39,13,37],'h');
  c.hline(7,37,3,'j');c.hline(14,37,3,'j');
  c.hline(7,39,4,'t');c.hline(14,39,4,'t');
  // Relaxed arms have shoulders and forearms rather than straight dangling sticks.
  c.poly([8,17,5,18,4,21,4,25,5,28,7,28,8,24,10,21,16,21,17,24,18,28,20,28,21,25,20,20,18,18,16,17],'a');
  c.poly([6,19,8,19,7,23,6,25,5,25,5,22],'s');
  c.poly([18,20,19,21,20,25,18,25,17,22],'c');
  c.rect(5,26,2,3,'c');c.px(5,26,'l');c.px(6,28,'s');
  c.rect(18,26,2,3,'c');c.px(18,26,'s');
  c.poly([10,14,15,14,15,18,12,20,10,18],'a');
  c.rect(11,15,3,3,'s');c.hline(11,17,3,'c');
  if(longHair) {
    // Tailored V-neck, long printed sleeves and a short dark skirt.
    c.poly([8,17,10,17,12,20,14,17,17,18,18,25,16,28,8,28,6,25,6,20],'t');
    c.poly([8,19,10,18,12,21,15,18,16,20,16,25,14,27,9,26],'u');
    c.poly([6,19,8,19,7,25,5,26,4,24,5,21],'T');
    c.poly([17,19,19,20,20,25,18,26,17,23],'T');
    for(const [x,y]of [[6,21],[5,24],[9,21],[14,20],[10,24],[14,24],[18,22],[18,25]]) {
      c.px(x,y,'H');c.px(x+1,y+1,'t');
    }
    c.poly([8,27,16,27,18,31,17,32,7,32,6,31],'h');
    c.hline(9,28,6,'H');c.line(8,29,7,31,'j');c.line(15,29,16,31,'H');
  } else {
    // Open armholes, cream piping and diagonal jersey detail at game scale.
    c.poly([8,17,10,17,12,19,15,17,17,18,17,22,16,25,17,28,8,28,8,23,7,20],'m');
    c.poly([10,19,12,21,15,19,15,24,16,27,9,27,9,22],'M');
    c.line(8,18,8,21,'w');c.line(16,18,16,21,'w');
    c.line(10,18,12,20,'p');c.line(12,20,15,18,'p');
    c.line(13,22,16,25,'w');c.line(13,24,15,26,'P');c.px(10,24,'n');
    c.poly([8,28,17,28,17,33,14,34,13,31,12,34,8,33],'h');
    c.rect(9,29,3,4,'N');c.rect(14,29,2,4,'n');c.hline(10,29,5,'N');
    if(back){
      c.poly([9,18,15,18,16,21,15,25,16,27,9,27,9,23],'M');
      c.hline(10,18,5,'w');c.hline(11,19,3,'m');c.vline(10,22,3,'p');
    }
  }
  // Ears, jaw, brow and eye clusters share the portrait's warm palette.
  c.rect(6,9,2,4,'a');c.rect(17,9,2,4,'a');c.px(6,10,'s');c.px(18,10,'c');
  c.poly([8,6,11,4,15,5,17,7,18,11,16,15,13,17,10,16,7,13,7,9],'a');
  c.poly([9,6,13,5,16,7,17,11,15,15,12,16,9,14,8,11],'s');
  c.poly([9,7,13,6,15,7,15,10,10,10,8,9],'l');
  c.hline(9,10,2,'a');c.hline(14,10,2,'a');
  if(blink){c.hline(9,11,2,'h');c.hline(14,11,2,'h');}
  else {c.rect(9,11,2,2,'h');c.rect(14,11,2,2,'h');c.px(9,11,'e');c.px(14,11,'e');}
  c.px(12,13,'c');c.hline(11,15,3,'r');c.px(10,13,'R');
  c.px(longHair?16:13,13,'b');
  if(longHair) {
    c.poly([6,10,6,6,8,3,12,2,12,5,9,7,8,12,7,19,5,24,5,15],'h');
    c.poly([13,2,17,4,19,8,18,15,18,23,17,27,15,26,15,18,17,11,16,7,13,5],'h');
    c.poly([7,8,8,5,11,3,11,5,9,7,8,11],'H');
    c.line(8,5,10,4,'j');c.line(17,8,17,15,'j');c.line(16,19,16,24,'H');
    c.px(12,4,'c');c.px(7,13,'g');c.px(17,14,'g');
  } else {
    c.poly([6,10,5,7,6,4,9,2,12,2,15,1,17,3,19,5,19,8,17,11,16,8,13,6,11,7,8,8,7,12],'h');
    c.poly([7,7,8,4,12,3,10,6,8,8],'H');
    c.line(8,5,11,4,'j');c.line(14,3,17,5,'H');c.px(8,6,'J');c.px(11,7,'h');
  }
  if(back) {
    c.poly([6,7,8,3,15,2,18,5,19,9,17,14,14,16,10,16,7,14],'h');
    c.poly([8,6,10,4,15,4,17,7,16,12,8,12],'H');
    c.line(9,5,13,4,'j');c.hline(10,14,5,'j');
    if(longHair) {
      c.poly([6,8,18,8,19,17,18,25,16,28,8,28,5,25,5,15],'h');
      c.poly([8,10,11,8,11,24,9,26,7,24],'H');
      c.line(9,11,9,23,'j');c.line(13,14,13,25,'H');c.line(16,10,17,24,'j');
    }
  }
}

function smallSide(c,longHair) {
  // Facing left; the opposite direction is a pixel-perfect flip.
  c.rect(10,30,3,7,'a');c.rect(14,30,3,7,'c');c.rect(10,31,2,5,'s');
  c.poly([9,36,13,36,13,39,7,39,7,38],'h');c.hline(8,38,4,'j');
  c.poly([14,36,17,36,18,39,13,39,13,38],'h');c.px(15,37,'j');
  c.poly([10,17,15,17,18,20,17,28,18,31,8,31,9,26,8,21],'h');
  c.poly([10,18,15,18,17,20,16,27,9,27,9,21],longHair?'u':'M');
  c.poly([14,20,17,21,17,25,15,28,13,27,14,24],longHair?'t':'a');
  c.line(15,21,15,25,longHair?'T':'s',2);c.rect(13,26,3,3,'c');c.px(13,26,'l');
  if(longHair){c.px(10,21,'h');c.px(11,24,'t');c.px(15,23,'h');}
  else {c.line(9,18,9,22,'w');c.line(10,23,12,25,'P');c.rect(10,28,6,5,'n');}
  c.rect(10,14,4,4,'a');c.rect(10,14,3,3,'s');
  c.poly([8,6,12,4,17,6,18,11,16,15,11,17,8,14,7,11,6,10,8,9],'a');
  c.poly([9,7,13,6,16,8,16,12,13,15,10,15,8,12,8,10,9,10],'s');
  c.hline(9,8,4,'l');c.px(8,11,'h');c.px(9,11,'e');c.px(7,13,'c');c.hline(9,15,2,'r');
  c.poly([7,8,7,5,10,2,15,2,18,4,19,8,18,13,15,15,14,11,13,8,10,6,8,9],'h');
  c.line(10,4,14,3,'j');c.line(15,5,17,7,'H');c.rect(14,10,2,3,'c');
  if(longHair) {
    c.poly([14,8,18,8,20,18,18,27,14,28,13,25,14,18],'h');
    c.line(17,11,18,19,'j');c.line(16,17,16,25,'H');c.px(14,13,'g');
  }
}

const portraitExpressions=['neutral','happy','affectionate','sad','surprised','sleepy','laughing','angry',
  'worried','shy','confused','annoyed','crying','excited','winking','kissing'];
for(const [id,longHair]of [['long_hair',true],['short_hair',false]]) {
  for(const expression of portraitExpressions)
    sprite(`portrait_${id}_${expression}`,{w:64,h:64},c=>portrait(c,longHair,expression));
  sprite(`sprite_${id}_front`,{w:24,h:40},c=>small(c,longHair));
  sprite(`sprite_${id}_back`,{w:24,h:40},c=>small(c,longHair,true));
  sprite(`sprite_${id}_left`,{w:24,h:40},c=>smallSide(c,longHair));
  sprite(`sprite_${id}_right`,{base:`sprite_${id}_left`,flip:'x'});
  anim(`idle_${id}`,{w:24,h:40},
    frame({ms:1600},c=>small(c,longHair)),
    frame({ms:120},c=>small(c,longHair,false,true)),
    frame({ms:1300},c=>small(c,longHair)));
}

scene('couple_preview',{w:268,h:214,bg:'f'},c=>{
  c.rect(0,0,268,23,'z');c.text(10,7,'A LITTLE US','Q',{scale:2});
  c.text(170,10,'CHARACTER STUDY 02','F');
  c.text(80,29,'EVERYDAY','z');c.text(153,29,'HAPPY','z');c.text(218,29,'AFFECTION','z');
  for(const [row,id]of ['long_hair','short_hair'].entries()) {
    const y=39+row*82;
    c.rect(6,y,37,70,'F');c.box(6,y,37,70,'v');
    c.stamp(`sprite_${id}_front`,12,y+14);
    c.text(13,y+60,'FRONT','z');
    for(const [col,expression]of ['neutral','happy','affectionate'].entries()) {
      const x=49+col*71;
      c.rect(x,y,67,70,'t');c.rect(x+1,y+1,65,68,'u');
      c.rect(x+2,y+2,63,66,'U');c.rect(x+3,y+3,61,64,'F');
      c.stamp(`portrait_${id}_${expression}`,x+2,y+4);
      c.hline(x+4,y+2,59,'Q');c.vline(x+1,y+4,61,'g');
      c.px(x+2,y+2,'Q');c.px(x+64,y+67,'t');
    }
  }
  c.text(10,205,'PHOTO OUTFITS / 64PX PORTRAITS / 24X40 SPRITES','z');
});
scene('expression_preview',{w:292,h:206,bg:'f'},c=>{
  c.rect(0,0,292,23,'z');c.text(10,7,'MORE MOODS','Q',{scale:2});
  c.text(198,10,'4 NEW EXPRESSIONS','F');
  for(const [col,expression]of ['sad','surprised','sleepy','laughing'].entries()) {
    const x=7+col*71;
    c.text(x+33,29,expression.toUpperCase(),'z',{align:'c'});
    for(const [row,id]of ['long_hair','short_hair'].entries()) {
      const y=40+row*78;
      c.rect(x,y,67,70,'t');c.rect(x+1,y+1,65,68,'u');c.rect(x+2,y+2,63,66,'F');
      c.stamp(`portrait_${id}_${expression}`,x+2,y+4);c.hline(x+3,y+2,61,'Q');
    }
  }
  c.text(146,197,'SIXTEEN EXPRESSIONS / SAME TWO FAMILIAR FACES','z',{align:'c'});
});

// Numbered sheets let the user review each mood without changing the approved neutral faces.
for(const [id,label]of [['long_hair','HER EXPRESSIONS'],['short_hair','HIS EXPRESSIONS']]) {
  scene(`review_${id}`,{w:292,h:382,bg:'f'},c=>{
    c.rect(0,0,292,23,'z');c.text(10,7,label,'Q',{scale:2});
    c.text(235,10,'REVIEW 02','F');
    for(const [index,expression]of portraitExpressions.entries()) {
      const x=7+(index%4)*71,y=40+Math.floor(index/4)*84;
      c.text(x+33,y-11,`${index+1} ${expression.toUpperCase()}`,'z',{align:'c'});
      c.rect(x,y,67,70,'t');c.rect(x+1,y+1,65,68,'u');c.rect(x+2,y+2,63,66,'F');
      c.stamp(`portrait_${id}_${expression}`,x+2,y+4);
      c.hline(x+3,y+2,61,'Q');c.vline(x+1,y+3,64,'g');
    }
    c.text(146,373,'NESTLE / SIXTEEN MOODS / EXPRESSION REVIEW','z',{align:'c'});
  });
}

scene('sprite_preview',{w:212,h:158,bg:'f'},c=>{
  c.rect(0,0,212,23,'z');c.text(9,7,'LITTLE YOU','Q',{scale:2});
  c.text(143,10,'SPRITE STUDY 02','F');
  for(const [col,direction]of ['front','back','left','right'].entries()) {
    const x=39+col*42;
    c.text(x+18,29,direction.toUpperCase(),'z',{align:'c'});
    for(const [row,id]of ['long_hair','short_hair'].entries()) {
      const y=39+row*53;
      c.rect(x,y,36,48,'F');c.box(x,y,36,48,'v');
      c.ellipse(x+18,y+43,10,2,'v');c.stamp(`sprite_${id}_${direction}`,x+6,y+5);
    }
  }
  c.text(7,54,'LOOK','z');c.text(10,62,'01','z');
  c.text(7,107,'LOOK','z');c.text(10,115,'02','z');
  c.text(106,150,'PHOTO OUTFITS / 24X40 / FOUR DIRECTIONS','z',{align:'c'});
});
sheet('couple_portraits',['portrait_*'],{cols:8,pad:2});
sheet('couple_sprites',['sprite_long_hair_*','sprite_short_hair_*'],{cols:4,pad:2});
