# 🎧 1. Base incontournable : Web Audio API

C’est le cœur de tout ce que tu veux faire côté micro.

### Pourquoi c’est indispensable

* Accès au **micro en live**
* Analyse temps réel (FFT, amplitude, etc.)
* Pipeline audio modulaire (filters, gain, etc.)
* Latence faible si bien configuré

### Concrètement

Tu vas utiliser :

* `AudioContext`
* `MediaStreamAudioSourceNode`
* `AnalyserNode`

👉 Ça te donne :

* waveform (signal brut)
* frequency spectrum (FFT)
* volume global

---

# 🎚️ 2. Extraction de features (le vrai nerf du projet)

Si tu veux “un max d’info”, ne te limite surtout pas au volume.

### À extraire :

* RMS (volume perçu)
* Spectre de fréquences
* Band energy (bass / mid / high)
* Détection de pics (transients / beats)
* Spectral centroid (brillance du son)

### Librairies utiles :

* Meyda
  👉 Très bon choix pour aller vite :

* 30+ features audio

* fonctionne directement avec Web Audio API

* Tone.js
  👉 Plus haut niveau :

* routing audio simplifié

* utile si tu veux mixer synthé + input

👉 Mon conseil :
👉 **Web Audio API + Meyda = combo parfait**

---

# 🎹 3. MIDI (obligatoire pour ton use case)

Pour le MIDI, tu dois utiliser :

👉 Web MIDI API

### Ça te permet :

* capter notes (noteOn / noteOff)
* velocity (super utile pour tes boids)
* contrôleurs (knobs, sliders)
* clock MIDI (si tu veux sync tempo)

### Librairie pratique :

* WebMidi.js
  👉 simplifie énormément :
* gestion devices
* events propres
* mapping facile

---

# 🔄 4. Architecture recommandée (important)

Si tu veux un système propre et scalable :

### 🔹 Input Layer

* Micro → Web Audio API
* MIDI → Web MIDI API

### 🔹 Analysis Layer

* Meyda → features audio
* Normalisation (0 → 1)
* Smoothing (éviter jitter)

### 🔹 Mapping Layer (CRUCIAL)

Tu dois absolument abstraire ça :

```js
{
  "bassEnergy": "boids.speed",
  "midEnergy": "boids.cohesion",
  "highEnergy": "boids.separation",
  "midi.cc1": "camera.zoom"
}
```

👉 Sinon ton projet va devenir ingérable.

---

# 🧠 5. Tips avancés (là où ton projet devient vraiment fort)

### 1. Smoothing obligatoire

Le son est chaotique → sinon tes oiseaux vont trembler :

* low-pass filter
* interpolation (lerp)
* moving average

---

### 2. Détection d’événements

Ne fais pas que du “continu” :

* beat detection → explosion du groupe
* silence → dispersion lente
* pic → changement de direction

---

### 3. Spatialisation du son → comportement

Exemple :

* bass → mouvement global du groupe
* highs → agitation individuelle

---

### 4. MIDI = contrôle artistique

Très puissant pour une install :

* knobs → paramètres boids
* pads → trigger scènes
* faders → intensité

---

# ⚠️ 6. Pièges à éviter

* ❌ Trop de features → inutilisables
* ❌ Pas de smoothing → visuel instable
* ❌ Mapping direct brut → résultats moches
* ❌ Latence ignorée → expérience cassée

---

# 🚀 Stack finale recommandée

* Web Audio API → capture + analyse
* Meyda → features avancées
* Web MIDI API → input MIDI
* WebMidi.js → confort dev
* Tone.js (optionnel) → si tu ajoutes du son généré

---

# 💡 Idée bonus (très forte pour ton projet)

Ajoute un **mode “audio profile” par scène** :

```json
{
  "scene": "storm",
  "audioMapping": {
    "bass": "turbulence",
    "high": "panic"
  }
}
```

👉 Chaque scène a sa “personnalité sonore”.

---