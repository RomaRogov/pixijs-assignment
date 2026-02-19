# PixiJS Assignment

A PixiJS v8 demo with three interactive scenes, built with TypeScript and Vite.

## Project Structure

```
src/
  app/
    Application.ts      # entry point: PIXI init, asset manifest, scene wiring
    Config.ts           # all tunable constants in one place
  core/
    BaseScene.ts        # abstract scene lifecycle contract
    SceneManager.ts     # parallel hide/init transitions, resize delegation
    AssetManager.ts     # singleton wrapper over Assets with typed get()
  scenes/               # thin scene shells — layout and lifecycle only
    MainMenuScene.ts
    AceOfShadowsScene.ts
    MagicWordsScene.ts
    PhoenixFlameScene.ts
  gameplay/.            # gameplay logic for different parts of project
    ace-of-shadows/
      CardTable.ts      # two CardStacks + overlay container + timer
      CardStack.ts      # stack abstraction (push/pop/getNextSlotWorldPosition)
      CardAnimator.ts   # all GSAP tweens for card movement
    magic-words/
      DialoguesControl.ts   # handles dialogue instances, timer, clicks
      DialogueSide.ts       # one dialogue card: avatar + 9-slice bubble + EmojiText
    phoenix-flame/
      FireParticles.ts      # pooled emitter and system for particle array
  services/
    dialogue/               # service and data structures for dialogues
      DialogueService.ts    # parallel API fetch + asset load
      DialoguePhrase.ts
      DialogueCharacter.ts
      DialogueEmoji.ts
  ui/
    Button.ts           # 9-slice sprite button with GSAP hover/press
    EmojiText.ts        # mixed BitmapText + Sprite word-wrap renderer
    FpsCounter.ts       # ticker-sampled FPS overlay
```

## Architecture

### Scene Lifecycle

Every scene implements `BaseScene` with the following contract:

```
init(screenSize) → resize(screenSize) → show() → update(dt) → hide() → [release inside hide if necessary]
```

`SceneManager.changeScene()` runs `hide()` and `init()` in parallel with `Promise.all`, so the next scene loads its assets while the current one is animating out — minimising perceived transition time.

### Config

All magic numbers live in `src/app/Config.ts` as a single `const` object. Scenes and gameplay classes import only the sub-section they need. This makes every tunable value visible in one file without scattering constants across classes.

### Asset Bundles

PixiJS AssetPack plugin for vite generates `public/assets/manifest.json`, which defines named bundles (`default`, `ace-of-shadows`, `magic-words`, `phoenix-flame`). The `default` bundle (button texture, MSDF font) loads at startup; scene bundles load lazily in `init()`.
Raw assets from `src/assets` folder are processed automatically on build.

---

## Scene Highlights

### Ace of Shadows

144 cards move one-by-one from a source stack to a target stack, then reset. Cards and stack placeholder share one packed texture to reduce drawcalls amount.

**Overlay animation container for Z-order**
Cards in flight must render above both stacks. Rather than dynamically reordering within a shared container, `CardTable` has three children: `sourceStack`, `targetStack`, and `overlayContainer` (always on top). `CardAnimator` reparents a card to the overlay when it starts moving and back to the target stack on arrival — no Z-order bookkeeping needed.

**Batch stagger animations**
The initial card-drop entrance and the full-deck reset swap use `gsap.to(arrayOfCards, { stagger })`. GSAP batches all targets into one tween object, keeping the active-tween list short and avoiding per-card ticker overhead.

---

### Magic Words

Streaming dialogue phrases from an API with inline emoji, rendered in speech bubbles with character avatars.

**BitmapFont for metrics**
Bitmap font metrics (`baseMeasurementFontSize`, `lineHeight`, `chars[' '].xAdvance`) are read directly to compute spacing in `EmojiText`, so no DOM measurement is needed.

**EmojiText tokenizer**
`EmojiText` is a plain `Container` that implements its own word-wrap layout. A regex tokenizes input text into word tokens and `{emojiName}` tokens. Each line accumulates width by summing `BitmapText.width` for words and a fixed `emojiSize` for sprites. When a token would overflow `maxWidth`, the cursor moves to the next line. Font-metric-derived `lineHeight` and `spaceWidth` keep mixed text/emoji baselines aligned. The `rebuild(options)` pattern (call `removeChildren()` then rebuild) avoids keeping a diff of the previous state.

**Smooth animations between dialogues**
`DialoguesControl` holds two `DialogueSide` instances. Showing a new phrase hides the previously active side and shows the idle one. Both animations run concurrently, giving a smooth overlap without managing any transition state machine.

**Responsive layout**
`DialogueSide.repositionContent(withText)` recalculates all positions from `screenSize` and `Config` constants on every resize. `withText: false` skips the expensive `EmojiText.rebuild()` call during resize-only updates.

**API communication**
`DialogueService.load()` runs the API fetch and loads textures from provided URLs. If the fetch fails, the service falls back to an empty phrase list, so the scene still renders without crashing.

---

### Phoenix Flame

A fire particle effect rendered at the centre-bottom of the screen.

**Object pool**
`FireParticles` allocates `Config.phoenixFlame.maxParticles` sprites once in the constructor and reuses them indefinitely. Sprites are hidden while idle; `spawnParticle()` resets position, velocity, and life without allocating anything.

**Two-phase easing for scale, alpha, and tint**
The full particle lifetime is split at a configurable ratio (`particleLifeSplitRatio`). Two ease functions are pre-parsed at construction with `gsap.parseEase()`, returning `(t: number) => number` closures:

- Phase 1 (0 → split): `easeIn` drives scale and alpha from 0 to peak
- Phase 2 (split → 1): `easeOut` drives scale and alpha from peak back to 0

A monotonically increasing `tintProgress` (0→1) is derived from the same eased values and used to shift the tint from orange-red toward dark red, giving the impression of embers cooling as they rise. Using `gsap.parseEase` means the same ease library that drives all UI animations also controls per-frame particle math — no custom curve functions needed.

---

## Key Libraries

| Library | Version | Usage |
|---|---|---|
| PixiJS | ^8.0.0 | renderer, sprites, BitmapText, NineSliceSprite |
| GSAP | ^3.14.2 | all animations, `parseEase` for particles |
| AssetPack | ^1.7.0 | texture atlases, mipmaps, compression, manifest |
