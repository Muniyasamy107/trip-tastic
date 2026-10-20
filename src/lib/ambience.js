// A tiny Web Audio "ambience" engine — no audio files, no network calls.
// Two detuned sine pads through a slow filter sweep, plus a soft noise "wind".

let ctx = null
let master = null
let nodes = []
let running = false

function build(context) {
  const created = []

  master = context.createGain()
  master.gain.value = 0
  master.connect(context.destination)

  // gentle low-pass that breathes
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 620
  filter.Q.value = 0.6
  filter.connect(master)
  created.push(filter)

  const lfo = context.createOscillator()
  const lfoGain = context.createGain()
  lfo.frequency.value = 0.055
  lfoGain.gain.value = 180
  lfo.connect(lfoGain).connect(filter.frequency)
  lfo.start()
  created.push(lfo, lfoGain)

  const padGain = context.createGain()
  padGain.gain.value = 0.26
  padGain.connect(filter)
  created.push(padGain)

  ;[110, 164.81, 220.5].forEach((freq, i) => {
    const osc = context.createOscillator()
    osc.type = i === 2 ? 'triangle' : 'sine'
    osc.frequency.value = freq
    osc.detune.value = i === 1 ? 6 : i === 2 ? -8 : 0
    const g = context.createGain()
    g.gain.value = i === 2 ? 0.18 : 0.5
    osc.connect(g).connect(padGain)
    osc.start()
    created.push(osc, g)
  })

  // soft wind: looping filtered noise
  const length = context.sampleRate * 3
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  const noise = context.createBufferSource()
  noise.buffer = buffer
  noise.loop = true
  const noiseFilter = context.createBiquadFilter()
  noiseFilter.type = 'bandpass'
  noiseFilter.frequency.value = 780
  noiseFilter.Q.value = 0.5
  const noiseGain = context.createGain()
  noiseGain.gain.value = 0.045
  const noiseLfo = context.createOscillator()
  const noiseLfoGain = context.createGain()
  noiseLfo.frequency.value = 0.08
  noiseLfoGain.gain.value = 0.02
  noiseLfo.connect(noiseLfoGain).connect(noiseGain.gain)
  noiseLfo.start()
  noise.connect(noiseFilter).connect(noiseGain).connect(master)
  noise.start()
  created.push(noise, noiseFilter, noiseGain, noiseLfo, noiseLfoGain)

  nodes = created
}

export async function startAmbience() {
  if (running) return true
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return false
    if (!ctx) ctx = new AudioCtx()
    if (ctx.state === 'suspended') await ctx.resume()
    if (!master) build(ctx)
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0.085, ctx.currentTime + 2.4)
    running = true
    return true
  } catch {
    return false
  }
}

export function stopAmbience() {
  if (!ctx || !master || !running) return
  master.gain.cancelScheduledValues(ctx.currentTime)
  master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
  master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.9)
  running = false
}

export function isAmbienceOn() {
  return running
}

export function teardown() {
  stopAmbience()
  if (ctx) {
    const c = ctx
    window.setTimeout(() => {
      nodes.forEach((n) => {
        try {
          n.stop?.()
          n.disconnect?.()
        } catch {
          /* already stopped */
        }
      })
      nodes = []
      master = null
      c.close?.()
      ctx = null
    }, 1200)
  }
}
