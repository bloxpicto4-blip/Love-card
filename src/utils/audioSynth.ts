// Generates genuine playable romantic instrumental WAV Blob URLs
// so the built-in music player works natively without external audio URLs.

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM
  view.setUint16(20, 1, true); // Linear PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

interface NoteEvent {
  freq: number;
  start: number;
  duration: number;
  gain: number;
}

function addRomanticNote(
  samples: Float32Array,
  sampleRate: number,
  note: NoteEvent,
  mode: 'piano' | 'music_box'
) {
  const startIdx = Math.floor(note.start * sampleRate);
  const totalLen = Math.floor(note.duration * sampleRate);
  for (let i = 0; i < totalLen && startIdx + i < samples.length; i++) {
    const t = i / sampleRate;
    const attack = Math.min(1, t / (mode === 'music_box' ? 0.01 : 0.035));
    const decayRate = mode === 'music_box' ? 3.2 : 1.75;
    const envelope = attack * Math.exp(-decayRate * t);

    let wave = 0;
    if (mode === 'piano') {
      wave =
        0.65 * Math.sin(2 * Math.PI * note.freq * t) +
        0.22 * Math.sin(2 * Math.PI * note.freq * 2 * t) * Math.exp(-2.5 * t) +
        0.08 * Math.sin(2 * Math.PI * note.freq * 3 * t) * Math.exp(-3.5 * t);
    } else {
      wave =
        0.75 * Math.sin(2 * Math.PI * note.freq * t) +
        0.2 * Math.sin(2 * Math.PI * note.freq * 2.002 * t) * Math.exp(-4 * t);
    }

    samples[startIdx + i] += wave * envelope * note.gain;
  }
}

const cachedUrls: Record<string, string> = {};

export function getSynthTrackUrl(preset: 'piano_waltz' | 'music_box'): string {
  if (cachedUrls[preset]) return cachedUrls[preset];

  const sampleRate = 22050;
  const durationSeconds = 36;
  const samples = new Float32Array(sampleRate * durationSeconds);

  if (preset === 'piano_waltz') {
    // Gentle romantic F major / D minor progression in 3/4 waltz feel
    const chords = [
      [174.61, 220.0, 261.63, 349.23, 440.0, 523.25], // Fmaj7
      [146.83, 220.0, 261.63, 329.63, 440.0, 392.0], // Dm9
      [116.54, 174.61, 220.0, 293.66, 349.23, 440.0], // Bbmaj7
      [130.81, 196.0, 261.63, 329.63, 392.0, 440.0], // C6
    ];
    const melody = [
      523.25, 440.0, 392.0, 440.0, 523.25, 587.33,
      523.25, 440.0, 349.23, 392.0, 440.0, 349.23,
      392.0, 440.0, 523.25, 440.0, 349.23, 329.63,
      349.23, 392.0, 440.0, 392.0, 349.23, 261.63,
    ];

    const step = 0.75;
    const totalSteps = Math.floor((durationSeconds - 2) / step);
    for (let s = 0; s < totalSteps; s++) {
      const chord = chords[Math.floor(s / 6) % chords.length];
      const noteTime = s * step;

      // Bass + arpeggio accompaniment
      const arpFreq = chord[s % 4];
      addRomanticNote(
        samples,
        sampleRate,
        { freq: arpFreq, start: noteTime, duration: 2.2, gain: 0.16 },
        'piano'
      );
      if (s % 3 === 0) {
        addRomanticNote(
          samples,
          sampleRate,
          { freq: chord[0], start: noteTime, duration: 2.8, gain: 0.14 },
          'piano'
        );
      }

      // Expressive melody line
      const melFreq = melody[s % melody.length];
      addRomanticNote(
        samples,
        sampleRate,
        { freq: melFreq, start: noteTime + 0.04, duration: 1.9, gain: 0.22 },
        'piano'
      );
    }
  } else {
    // Music Box dreamy lullaby in C major / A minor
    const pattern = [
      523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 587.33,
      523.25, 659.25, 783.99, 987.77, 880.0, 783.99, 659.25, 523.25,
      440.0, 523.25, 659.25, 523.25, 698.46, 659.25, 587.33, 523.25,
      392.0, 493.88, 587.33, 659.25, 587.33, 493.88, 392.0, 523.25,
    ];
    const bass = [261.63, 220.0, 174.61, 196.0];
    const step = 0.55;
    const totalSteps = Math.floor((durationSeconds - 1.5) / step);
    for (let s = 0; s < totalSteps; s++) {
      const t = s * step;
      addRomanticNote(
        samples,
        sampleRate,
        { freq: pattern[s % pattern.length], start: t, duration: 1.5, gain: 0.2 },
        'music_box'
      );
      if (s % 4 === 0) {
        addRomanticNote(
          samples,
          sampleRate,
          { freq: bass[Math.floor(s / 8) % bass.length], start: t, duration: 2.4, gain: 0.15 },
          'piano'
        );
      }
    }
  }

  // Smooth fade-in and fade-out at edges
  const fadeSamples = Math.floor(sampleRate * 1.2);
  for (let i = 0; i < fadeSamples; i++) {
    samples[i] *= i / fadeSamples;
    const endIdx = samples.length - 1 - i;
    samples[endIdx] *= i / fadeSamples;
  }

  const blob = encodeWav(samples, sampleRate);
  const url = URL.createObjectURL(blob);
  cachedUrls[preset] = url;
  return url;
}
