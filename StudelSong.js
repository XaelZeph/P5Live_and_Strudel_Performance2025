samples('github:tidalcycles/Dirt-Samples/master/')


// $: s("[bd <hh oh>]*2").bank("tr909").dec(.4)
// const melody = "a2 a2 [c e f]@2 g@2 f d e -" 
const noize = "<[a3, c4, e4] [e4, g4, b4] [c4, eb4, g4] [f4, ab4, c5]>"
const rhythm = "[bd bd] ~ [ ~ hh] [ ~ hh]"
const beat = "[~ bd] * 4"
// const melody = "f#4 d4 [ [d4 d4] g4] [f#4 d4] "
const num_melody = "6 4 [[[4 ~] 4] 7] [6 4]"
const drama = "[7 6 5 4] * 2" 
const cycle_tracker = "<1 2 3 4>"


$: note(cycle_tracker).gain(0)
$: sound("crow").gain(.05).almostAlways(x => x.gain(0)).delay(rand.range(0, 0.5))
$: sound("gm_breath_noise").lastOf(2, x=>x.rev()).slow(2.5)
$: sound("fire").slow(5).gain(.2)
$: note(noize).sustain(3).gain(.25)
$: n(drama).scale("<A:minor E:minor C:minor F:minor>").gain(.5)//.rib(4, 1/16)
.clip(2).s("gm_electric_guitar_clean")//.rib(1, 1/8)
$: sound(rhythm)
$: sound(beat)
$: n(num_melody).scale("<A:minor E:minor C:minor F:minor>").gain(2).spiral()//.rev()//.rib (3, 1/16)
$: sound("amencutup").n(rand.range(0, 31)).fast(16).gain(2)//.rib(4, 1/16)

all (x => x.lpf(slider(5000, 100, 5000, 100)).room(slider(0.623, 0, 1)).spectrum())