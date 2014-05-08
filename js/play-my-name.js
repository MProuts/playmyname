$(document).ready(function(){
  var pitches = ["a/4", "b/4", "c/4", "d/4", "e/4", "f/4", "g/4"]
  var name = window.location.search.slice(1).toLowerCase();

  function pitchFor(char) {
    index = (char.charCodeAt(0) - 97) % 7;
    return pitches[index];
  }

  //create notes based on chars
  var notes = [];
  for (i=0; i<name.length; i++){
    var nn = pitchFor(name[i]);
    notes.push(new Vex.Flow.StaveNote({ keys: [nn], duration: "q" }))
  }

  //draw staff
  var canvas = $("canvas")[0];
  var renderer = new Vex.Flow.Renderer(canvas,
    Vex.Flow.Renderer.Backends.CANVAS);

  var ctx = renderer.getContext();
  var stave = new Vex.Flow.Stave(10, 0, 500);
  stave.addClef("treble").setContext(ctx).draw();

  // Create a voice in 4/4
  var voice = new Vex.Flow.Voice({
    num_beats: name.length,
    beat_value: 4,
    resolution: Vex.Flow.RESOLUTION
  });

  // Add notes to voice
  voice.addTickables(notes);

  // Format and justify the notes to 500 pixels
  var formatter = new Vex.Flow.Formatter().
    joinVoices([voice]).format([voice], 500);

  // Render voice
  voice.draw(ctx, stave);

});

function playExample() {
  var Synth = function(audiolet, frequency) {

    AudioletGroup.apply(this, [audiolet, 0, 1]);
    this.sine = new Sine(this.audiolet, frequency);
    this.modulator = new Saw(this.audiolet, 2 * frequency);
    this.modulatorMulAdd = new MulAdd(this.audiolet, frequency / 2, frequency);
    this.gain = new Gain(this.audiolet);

    this.modulator.connect(this.modulatorMulAdd);
    this.modulatorMulAdd.connect(this.sine);
    this.envelope.connect(this.gain, 0, 1);
    this.sine.connect(this.outputs[0]);
  };
  extend(Synth, AudioletGroup);

  var AudioletApp = function() {
    this.audiolet = new Audiolet();
    var synth = new Synth(this.audiolet, 440);
    synth.connect(this.audiolet.output);
  };

  this.audioletApp = new AudioletApp();
};
