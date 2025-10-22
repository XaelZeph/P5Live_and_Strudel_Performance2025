/*	
	_hydra_multi // cc teddavis.org 2021	
	extends _hydra_scope for multiple instances!
	+ see HY5 demos for better hydra + p5 bridge
*/

let libs = ['https://unpkg.com/hydra-synth', 'includes/libs/hydra-synth.js']

let synthCount = 3 // # of hydra instances
let sphereSize = 20;

// gen hydra instances
let pg = [synthCount],
	hc = [synthCount],
	synth = [synthCount]

for(let i = 1; i < synthCount; i++) {
	hc[i] = document.createElement('canvas') // hydra canvas + custom size
	hc[i].width = 200 // window.innerWidth // for full res
	hc[i].height = 200 // window.innerHeight // for full res
	
	// document.body.appendChild(hc[i]);

	synth[i] = new Hydra({
		// detectAudio: false, // no mic
		// autoLoop: true,
		detectAudio: false,
		canvas: hc[i], // use hydra canvas
		makeGlobal: false, // scoped
	}).synth // scoped hydra
}

// hc[0] is created separately as it has detectAudio:true
// and the resolution is lower to lower lag
// I believe it will just choose which one to apply based on which hydra has
// src(s0).layer(o0).out(o0)
hc[0] = document.createElement('canvas') // hydra canvas + custom size
hc[0].width =  window.innerWidth // for full res
hc[0].height = window.innerHeight // for full res

document.body.appendChild(hc[0]);

synth[0] = new Hydra({
	// detectAudio: false, // no mic
	// autoLoop: true,
	detectAudio: true,
	canvas: hc[0], // use hydra canvas
	makeGlobal: false, // scoped
}).synth // scoped hydra


// sandbox - start
// access each instance via synth[index]

// set up audio for hydra 0
synth[0].a.show() // a.hide() to remove
synth[0].a.setBins(3)
synth[0].a.setSmooth(.8)

// overall texture (applied to the entire screen)
// each code section has a "header" which describes what each modulation does
// found that synth[#] does NOT like verticle spaces, it detects "end" of one hydra texture
// with verticle spaces
synth[0].src(synth[0].o0)
	 .layer(synth[0].src(synth[0].s0)
     .modulate(synth[0].osc(100), .01)
     .modulateScrollY(synth[0].osc(5), ()=>sin(frameCount/50*3)*.05)
     )
     .scale(0.8).modulate(synth[0].osc(100), .01).modulate(synth[0].osc(8,-0.5, 1).blend(synth[0].o0))
	 .modulate(synth[0].shape(4).rotate(0.5, 0.5).scale(2)
		.repeatX(2, 2).modulate(synth[0].o0).repeatY(2, 2))
     .diff(synth[0].src(synth[0].s0).modulateScrollY(synth[0].osc(5), ()=>sin(frameCount*30/15)*.05))
     // add on to create a cool eclipse effect 
     // .diff(synth[0].src(synth[0].s0).modulateScrollY(synth[0].osc(5), ()=>sin(frameCount*30/15)*.1))
     // intensify the light -> neon
     // .add(synth[0].src(synth[0].s0).modulateScrollY(synth[0].osc(5), ()=>sin(frameCount*30/15)*.05))
     // flashing square WOOOAH!!
     // .modulatePixelate(synth[0].s0)
     // pixelate into this cool squiggly pattern on top???
     // .modulatePixelate(synth[0].noise(10),102,8)
     // pixelate
     // .modulatePixelate(synth[0].noise(3).pixelate(8,8),1024,8)
	 // this one only modulates the scale of synth[1] based on audio 
	 .modulateScale(synth[1].src(synth[1].o0).scale(1.01), 
	 ()=>(synth[0].a.fft[0]))
	 // ^^ i'm not actually quite sure.. why it doesn't modulate the square as well?? 
	 // because the modulate scale below effects synth[1], even though only synth[2] is called
	 // it seems to only affect parts with material
	 // .modulateScale(synth[2].src(synth[2].o0).scale(1.01), ()=>(synth[0].a.fft[0]))
.out(synth[0].o0)
	
// ball texture
synth[1].noise()
.brightness(0.25)
// changes color based on audio (which is initialized by only synth[0])
.color(0.5, 1, 0.7).hue(()=>synth[0].a.fft[0])
.out()

// flames texture
synth[2]
// changes color based on audio (which is initialized by only synth[0])
.solid(0.5, 1, 0.7).hue(()=>synth[0].a.fft[0])
.out()
// sandbox - stop

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL)
	background(0)
	noStroke()
	
	// starts up particle systems (ps is the big ball flames, ps2 is the background tiny flickering flames)
	ps = new ParticleSystem(createVector(width / 2, 50, 50));
	ps2 = new ParticleSystem2(createVector(width / 2, 50, 50));
	
	// this starts up the whole screen texture
	synth[0].s0.init({
		src: canvas
	})
	
	// prep synth layers
	for(let i = 0; i < synthCount; i++) {
		pg[i] = createGraphics(hc[i].width, hc[i].height)
		pg[i].drawingContext.drawImage(hc[i], 0, 0, pg[i].width, pg[i].height)
	}	
}

function draw() {
	// orbitControl(5)
	
	// note that and background(0) are necessary to reset the board
	// so that the entire screen doesn't get filled with modulations
	// try getting rid of one or the other, see the effect it creates!
	clear()
	background(0)
	// rotateX(frameCount / 15)
	// rotateY(frameCount / 5)
	

	// grab + apply hydra textures 
	for(let i = 0; i < synthCount; i++) {
		pg[i].clear()
		pg[i].drawingContext.drawImage(hc[i], 0, 0, pg[i].width, pg[i].height)
	}
	
	// One way to use audio within other draw() code (not just in Hydra section)
	let cFlame = color(synth[0].a.fft[0] * height / 2, synth[0].a.fft[1] * height / 2, synth[0].a.fft[2] * height / 2)
	// let cFlame = color(synth[0].a.fft[0] * height / 2, synth[0].a.fft[0] * height / 2, synth[0].a.fft[0] * height / 2)
	// let cFlame = color(255)
	
	// creates a flame which follows the mouse:
	push()
	fill(cFlame)
	buildFlame();
	pop()
	
	// creates moving flames 
	for (let i = 1; i < 4; i ++) {
		push()
		x1 = noise(frameCount * 0.002 * i) * width - (300 * i)
		y1 = noise(frameCount * 0.003 * i) * height - (150*i)
		s1 = noise(frameCount * 0.02 * i) * 30 + 10
		// fill(cFlame)
		texture(pg[2]) // use hydra for sphere flames
		buildFlame(x1, y1, s1);
		pop()
		
	}
	
	// create background flickering flames
	push()
	// fill(cFlame)
	texture(pg[2])
	for (let i = 0; i < 2; i++) {
		buildFlameStatic(random(-700, 500), random(-300, 300), random(-500, 0))
	}
	pop()
	
	// middle ball 
	push()
	texture(pg[1]) // use hydra for ball
	rotateY(frameCount/3)
	rotateX(frameCount/3)
	sphere(height/5, 40)
	pop()
	
	// middle box
	push()
	fill(0)
	stroke(255)
	strokeWeight(2)
	translate(0,0,-100)
	box(-255)
	pop()
	

	// right corner boxes
	push()
	fill(0)
	stroke(255)
	strokeWeight(2)
	translate(550, 230, 0)
	rotateX(frameCount/50)
	rotateY(frameCount/50)
	box(100)
	pop()
	

	// left corner boxes
	push()
	fill(0)
	stroke(255)
	strokeWeight(2)
	translate(-550, 255, 0)
	rotateX(frameCount/50)
	rotateY(frameCount/50)
	box(75)
	pop()
	push()
	fill(0)
	stroke(255)
	strokeWeight(2)
	translate(-500, 230, -100)
	rotateX(frameCount/50)
	rotateY(frameCount/50)
	box(150)
	pop()
	
}

// first particle system, creates the larger sphere flames
class Particle {
  constructor(x, y, z) {
    this.acceleration = createVector(0, -0.1, 0);
    this.velocity = createVector(random(-0.3, 0.3), random(0, 0.1), random(-0.3, 0.3));
    this.position = createVector(x, y, z);
    this.lifespan = random(5.0, 150.0);
  }

  run() {
    this.update();
    this.display();
  }

  // Method to update position
  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.lifespan -= 3.0;
  }

  // Method to display
  display() {
  	push();
  	noStroke();
    //stroke(255);
    
    tint(255, this.lifespan);
    // texture(pg);
    // noLights();
    let new_x = random(this.position.x - 10, this.position.x + 10);
    let new_z = random(this.position.z - 10, this.position.z + 10);
    translate(new_x, this.position.y - 20, new_z)
    angleMode(DEGREES);
    rotate(180, [0, 0, 1]);
    //ellipse(new_x, this.position.y, 12, 12);
    sphere(10, 20);
    pop();
  }

  // Is the particle still useful?
  isDead() {
    if (this.lifespan < 0.0) {
      return true;
    } else {
      return false;
    }
  }
}


class ParticleSystem {

  constructor(x, y, z) {
    this.origin = createVector(x, y, z);
    this.particles = [];
  }

  addParticle(x, y, z) {
  	if (x !== undefined && y !== undefined && z !==undefined) {
      this.particles.push(new Particle(x, y, z));
    } else {
      this.particles.push(new Particle(this.origin.x, this.origin.y, this.origin.z));
    }
  }

  run() {
    // Run every particle
    // ES6 for..of loop
    for (let particle of this.particles) {
      particle.run();
    }

    // Filter removes any elements of the array that do not pass the test
    this.particles = this.particles.filter(particle => !particle.isDead());
  }
}

// builds sphere flame, if x y are undefined, 
function buildFlame(x, y, s) {
	// glowing sphere
	  // emissiveMaterial(255, 0, 0, 0.2)
	  if (x !== undefined && y !== undefined && s !==undefined) {
	  	push();
		translate(x, y, 65);
		sphere(s)
		pop();
		ps.run();
		push();
		ps.origin.set(x, y, 65);
		ps.addParticle();
		pop();
	  }
	  else if (s !== undefined) {
		push();
		translate(mouseX - windowWidth/2, mouseY - windowHeight/2, 65);
		sphere(s)
		pop();
		ps.run();
		push();
		ps.origin.set(mouseX - windowWidth/2, mouseY - windowHeight/2, 65);
		ps.addParticle();
		pop();
	  }
	  else {
		push();
		translate(mouseX - windowWidth/2, mouseY - windowHeight/2, 65);
		sphere(sphereSize)
		pop();
		ps.run();
		push();
		ps.origin.set(mouseX - windowWidth/2, mouseY - windowHeight/2, 65);
		ps.addParticle();
		pop();
	}
}

class Particle2 {

  constructor(x, y, z) {
    this.acceleration = createVector(0, -0.1, 0);
    this.velocity = createVector(random(-0.3, 0.3), random(0, 0.1), random(-0.3, 0.3));
    this.position = createVector(x, y, z);
    this.lifespan = random(5.0, 150.0);
  }

  run() {
    this.update();
    this.display();
  }

  // Method to update position
  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.lifespan -= 3.0;
  }

  // Method to display
  display() {
  	push();
  	noStroke();
    //stroke(255);
    
    tint(255, this.lifespan);
    // texture(pg);
    // noLights();
    let new_x = random(this.position.x - 10, this.position.x + 10);
    let new_z = random(this.position.z - 10, this.position.z + 10);
    translate(new_x, this.position.y - 20, new_z)
    angleMode(DEGREES);
    rotate(180, [0, 0, 1]);
    //ellipse(new_x, this.position.y, 12, 12);
    sphere(5, 20);
    pop();
  }

  // Is the particle still useful?
  isDead() {
    if (this.lifespan < 0.0) {
      return true;
    } else {
      return false;
    }
  }
}

class ParticleSystem2 {

  constructor(x, y, z) {
    this.origin = createVector(x, y, z);
    this.particles = [];
  }

  addParticle(x, y, z) {
  	if (this.particles.length > 50) {
  		
  	}
  	else if (x !== undefined && y !== undefined && z !==undefined) {
      this.particles.push(new Particle2(x, y, z));
    } else {
      this.particles.push(new Particle2(this.origin.x, this.origin.y, this.origin.z));
    }
  }

  run() {
    // Run every particle
    // ES6 for..of loop
    for (let particle of this.particles) {
      particle.run();
    }

    // Filter removes any elements of the array that do not pass the test
    this.particles = this.particles.filter(particle => !particle.isDead());
  }
}

function buildFlameStatic(x, y, z) {
	// glowing sphere
	  // emissiveMaterial(255, 0, 0, 0.2)
	  push();
	  translate(x, y, z);
	  // sphere(sphereSize)
	  pop();
	  ps2.run();
	  push();
	  ps2.origin.set(x, y, z);
	  ps2.addParticle();
	  pop();
}