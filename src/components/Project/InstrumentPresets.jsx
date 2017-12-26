import Tone from 'tone';

const defaultEffectMethod = (property) =>
    (shape, val) => {
        shape.synth.set(property, val);
    };

const defaultDynamicParams = [
    {
        name: 'glide',
        default: 0.01,
        func: defaultEffectMethod('glide')
    }, {
        name: 'attack',
        default: 0.01,
        func: defaultEffectMethod('attack')
    }, {
        name: 'decay',
        default: 0.01,
        func: defaultEffectMethod('decay')
    }, {
        name: 'sustain',
        default: 0.01,
        func: defaultEffectMethod('sustain')
    }
];

const InstrumentPresets = [
    {   // KEYS
        name: {
            label: 'Keys',
            value: 0,
        },
        baseSynth: Tone.Synth,
        params: {
            'portamento': 0,
            'oscillator': {
                'detune': 0,
                'type': 'custom',
                'partials' : [2, 1, 2, 2],
                'phase': 0,
                'volume': -6
            },
            'envelope': {
                'attack': 0.005,
                'decay': 0.3,
                'sustain': 0.2,
                'release': 1,
            }
        },
        effects:  [
            {
                type: Tone.Freeverb,
                params: {
                    'roomSize': 0.8,
                    'dampening': 2000,
                    'wet': 1
                }
            },
            {
                type: Tone.FeedbackDelay,
                params: {
                    'delayTime': .7,
                    'feedback': .8,
                    'wet': 1
                }
            }
        ],
        dynamicParams:  [
            {
                name: 'glide',
                default: 0,
                func: function (shape,val) {
                    //var newVal =  scale_val_to_range(val, 0, 101, 0, .2);
                    //shape.synth.set('portamento',newVal);
                }
            }, 
            {
                name: 'attack',
                default: 0.1,//scale_val_to_range(keysParams.envelope.attack, 0, 1, 0, 100),
                func: function (shape,val) {
                    //shape.synth.envelope.set('attack', scale_val_to_range(val, 0, 101, 0, 1)+0.005);
                }
            }, 
            {
                name: 'space',
                default: 10,
                func: function (shape,val) {
                    //shape.set_effect_amount(val, 0, 'wet');
                }  
            }, 
            {
                name: 'delay',
                default: 5,
                func: function (shape,val) {
                    //shape.set_effect_amount(val, 1, 'wet');
                }
            }
        ],
    },
    {
        // DUO
        name: {
            label: 'Duo',
            value: 1,
        },
        baseSynth: Tone.DuoSynth,
        params: {},
        effects:  [
            {
                type: Tone.Chorus,
                params: {
                    frequency: 1.5,
                    delayTime: 3.5,
                    depth: 0.9,
                    feedback: 0.1,
                    type: 'sine',
                    spread: 180
                }
            }
        ], 
        dynamicParams: [
            {
                name: 'glide',
                default: 0,
                func: function (shape,val) {
                    // shape.synth.set('portamento', scale_val_to_range(val, 0, 101, 0, .5));
                }
            }, {
                name: 'chorus',
                default: 20,
                func: function (shape,val) {
                    // shape.set_effect_amount(val, 0, 'wet'); 
                }
            }, {
                name: 'vibrato',
                default: 10,
                func: function (shape,val) {
                    // shape.synth.set('vibratoAmount', scale_val_to_range(val, 0, 101, 0, 1));
                }  
            }, {
                name: 'harmonicity',
                default: 10, //scale_val_to_range(1.5, 0, 3, 0, 100),
                func: function (shape,val) {
                    // shape.synth.set('harmonicity', scale_val_to_range(val, 0, 101, 0, 3));
                }
            }
        ],
    }
];

export default InstrumentPresets;