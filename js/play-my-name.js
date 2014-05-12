$(document).ready(function(){
  //for engraving
  var pitches = ["a/4", "b/4", "c/4", "d/4", "e/4", "f/4", "g/4"]
  var originalName = window.location.search.slice(3).replace(/\+/g, ' ');
  var upperName = window.location.search.slice(3).replace(/\+/g, '');
  var name = upperName.toLowerCase();

  $('#search input[type=text]').val(originalName);

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
  var stave = new Vex.Flow.Stave(10, 0, 720);
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


  playExample(name);
  $('#play button').click(function(){
    $('#search').submit();
  });
}); //end document ready

function playExample(name) {
  var Synth = function(audiolet, frequency) {

    AudioletGroup.apply(this, [audiolet, 0, 1]);
    this.sine = new Sine(this.audiolet, frequency);
    this.modulator = new Saw(this.audiolet, 2 * frequency);
    this.modulatorMulAdd = new MulAdd(this.audiolet, frequency / 2, frequency);
    this.gain = new Gain(this.audiolet);
    this.envelope = new PercussiveEnvelope(this.audiolet, 1, 0.2, 0.5,
                                           function() {
                                             this.audiolet.scheduler.addRelative(0,
                                                                                 this.remove.bind(this));
                                           }.bind(this)
                                          );
                                          this.modulator.connect(this.modulatorMulAdd);
                                          this.modulatorMulAdd.connect(this.sine);
                                          this.envelope.connect(this.gain, 0, 1);
                                          this.sine.connect(this.gain);
                                          this.gain.connect(this.outputs[0]);
  };
  extend(Synth, AudioletGroup);

  var scale = new MajorScale();
  var baseFrequency = 65; // The base frequency of the scale
  var octave = 2; // The second octave
  var freq1 = scale.getFrequency(0, baseFrequency, octave);
  var freq2 = scale.getFrequency(1, baseFrequency, octave);
  var freq3 = scale.getFrequency(2, baseFrequency, octave);
  var freq4 = scale.getFrequency(3, baseFrequency, octave);

  function frequencyFor(char) {
    index = (char.charCodeAt(0) - 92) % 7;
    return scale.getFrequency(index, 65, 1);
  }

  var frequencies = [];
  for (i=0; i<name.length; i++){
    frequencies.push(frequencyFor(name[i]));
  }


  var AudioletApp = function() {
    this.audiolet = new Audiolet();
    var frequencyPattern = new PSequence(frequencies);

    this.audiolet.scheduler.play([frequencyPattern], 1,
                                 function(frequency) {
                                   var synth = new Synth(this.audiolet, frequency);
                                   synth.connect(this.audiolet.output);
                                 }.bind(this)
                                );
  };

  this.audioletApp = new AudioletApp();
};
