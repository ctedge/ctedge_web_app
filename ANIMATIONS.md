# Animation & Transition Guide

This document outlines the animations and transitions available in your Next.js application. All animations are built with **Tailwind CSS v4** and are defined in `tailwind.config.ts`.

---

## 🎨 Available Animations

### Fade Animations
- **`animate-fade-in`** — Fades element in from transparent to opaque (0.6s)
- **`animate-fade-out`** — Fades element out from opaque to transparent (0.6s)

**Usage:**
```html
<div className="animate-fade-in">Content</div>
<div className="animate-fade-out">Disappearing content</div>
```

### Slide Animations
- **`animate-slide-up`** — Slides up from bottom-20px (0.6s)
- **`animate-slide-down`** — Slides down from top-20px (0.6s)
- **`animate-slide-left`** — Slides left from right-20px (0.6s)
- **`animate-slide-right`** — Slides right from left-20px (0.6s)

**Usage:**
```html
<div className="animate-slide-up">Hero content</div>
<nav className="animate-slide-down">Navigation</nav>
```

### Scale Animations
- **`animate-scale-in`** — Scales from 95% to 100% with fade (0.5s)
- **`animate-scale-up`** — Scales from 100% to 105% on hover effect (0.4s)

**Usage:**
```html
<div className="animate-scale-in">Card content</div>
<button className="group-hover:animate-scale-up">Icon</button>
```

### Bounce Animation
- **`animate-bounce-in`** — Bouncy entrance with scale (0.6s)

**Usage:**
```html
<div className="animate-bounce-in">Alert or modal</div>
```

### Glow & Shimmer
- **`animate-pulse-glow`** — Pulsing glow effect (2s infinite)
- **`animate-shimmer`** — Shimmer/sweep animation useful for skeletons and loading states (2s infinite)

**Usage:**
```html
<div className="animate-pulse-glow">Glowing element</div>
<div className="animate-skeleton">Loading skeleton</div>
```

### Float Animation
- **`animate-float`** — Subtle floating effect, ideal for parallax-like scenes (3s infinite)

**Usage:**
```html
<div className="animate-float">Floating element</div>
```

---

## ⏱️ Animation Delays

Use animation delays to create staggered effects where subsequent elements animate with a delay:

- **`animate-delay-100`** through **`animate-delay-700`** (100ms to 700ms increments)

**Usage:**
```html
<!-- Staggered item animations -->
<div className="animate-slide-up animate-delay-100">Item 1</div>
<div className="animate-slide-up animate-delay-200">Item 2</div>
<div className="animate-slide-up animate-delay-300">Item 3</div>
```

**Or use inline styles for dynamic delays:**
```tsx
{items.map((item, idx) => (
  <div 
    key={item.id}
    className="animate-scale-in"
    style={{ animationDelay: `${idx * 150}ms` }}
  >
    {item.name}
  </div>
))}
```

---

## 🎭 Smooth Transitions

These reusable transition utilities provide consistent timing across your app:

- **`transition-smooth`** — 300ms ease-in-out transition (default, most common use)
- **`transition-smooth-fast`** — 200ms ease-in-out (quick interactions)
- **`transition-smooth-slow`** — 500ms ease-in-out (longer, more dramatic transitions)

**Usage:**
```html
<!-- Hover effect with smooth transition -->
<button className="transition-smooth hover:bg-teal-600">
  Hover me
</button>

<!-- Fast transition for loading states -->
<div className="transition-smooth-fast opacity-0 animate-fade-in">
  Quick fade
</div>

<!-- Slow transition for page elements -->
<div className="transition-smooth-slow hover:scale-110">
  Smooth scale
</div>
```

---

## 🔤 Text Gradient Animation

Animate text with a gradient shimmer effect:

- **`animate-text-gradient`** — Creates a sliding rainbow gradient on text (2s linear infinite)

**Usage:**
```html
<h1 className="animate-text-gradient">Animated gradient text</h1>
```

---

## 🔄 Combined Examples

### Hero Section Entry
```tsx
<h1 className="animate-slide-up text-4xl">Title</h1>
<p className="animate-slide-up mt-4 animate-delay-100">Subtitle</p>
<button className="animate-slide-up animate-delay-200">CTA</button>
```

### Property Card Hover
```tsx
<Link className="group transition-smooth hover:shadow-md hover:translate-y-[-4px]">
  <Image 
    src={image}
    className="transition-smooth group-hover:scale-110"
  />
  <h3 className="transition-smooth group-hover:text-teal-700">Title</h3>
</Link>
```

### Form Field Stagger
```tsx
<div className="animate-slide-up animate-delay-100">
  <Input className="transition-smooth focus:shadow-md" />
</div>
<div className="animate-slide-up animate-delay-200">
  <Input className="transition-smooth focus:shadow-md" />
</div>
```

### Success Message
```tsx
{submitted && (
  <div className="animate-scale-in rounded-lg border-emerald-200 bg-emerald-50">
    <p>Success!</p>
  </div>
)}
```

---

## 📐 Custom Durations & Timings

You can override animation durations using inline styles:

```tsx
<div 
  className="animate-fade-in"
  style={{ animationDuration: "1s" }}
>
  Slower fade
</div>
```

Or adjust transition durations:

```tsx
<button 
  className="transition"
  style={{ transitionDuration: "600ms" }}
>
  Custom transition
</button>
```

---

## 🎪 Best Practices

1. **Use delays for list items** — Stagger delays to create flowing, natural entry animations
2. **Keep it subtle** — Most animations should be 300-600ms for web content
3. **Combine animations and transitions** — Use `animate-*` for entry, `transition-*` for interaction
4. **Prefer `transition-smooth`** — For consistency, use this class instead of bare `transition`
5. **Respect user preferences** — Always test with `prefers-reduced-motion` if needed (can add to globals.css):
   ```css
   @media (prefers-reduced-motion: reduce) {
     * {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

---

## 🔧 Configuration

All animations are defined in `tailwind.config.ts` under the `theme.extend` object:

```ts
animation: {
  "fade-in": "fadeIn 0.6s ease-in-out",
  "slide-up": "slideUp 0.6s ease-out",
  // ... more animations
}
```

Keyframes are defined separately:
```ts
keyframes: {
  fadeIn: {
    "0%": { opacity: "0" },
    "100%": { opacity: "1" },
  },
  // ... more keyframes
}
```

To customize or add new animations, edit `tailwind.config.ts` and restart your dev server.

---

## 📦 What's Included

✅ Fade animations (in/out)  
✅ Slide animations (4 directions)  
✅ Scale animations (in/up)  
✅ Bounce animation  
✅ Glow and shimmer effects  
✅ Float parallax effect  
✅ Animation delays (100ms–700ms)  
✅ Smooth transition utilities (fast/normal/slow)  
✅ Text gradient animation  
✅ Skeleton/loading animation  

---

## 🚀 Implemented Updates

The following components now have animations built in:

- ✅ Home page hero section
- ✅ Home page sections (about, services, features)
- ✅ Property cards (listings)
- ✅ Site header/navigation (slide-down entry)
- ✅ Service cards (staggered, hover lift)
- ✅ Buttons (smooth transitions + hover effects)
- ✅ Form inputs and textareas (focus glow)
- ✅ Inspection form (staggered fields)
- ✅ Lead form (staggered fields)
- ✅ Investment showcase card (scale-in entry)
- ✅ CTA section (staggered text + buttons)

---

## 💡 Tips for Adding to New Components

When building new pages or components, follow these patterns:

```tsx
// Entry animation + stagger
<div className="animate-slide-up animate-delay-100">

// Hover lift effect
<div className="transition-smooth hover:translate-y-[-4px]">

// Focus animation on inputs
<input className="transition-smooth focus:shadow-md focus:ring-teal-500" />

// Loading skeleton
<div className="animate-skeleton h-32 rounded-lg" />

// Success/alert
<div className="animate-scale-in rounded-lg bg-emerald-50" />
```

Enjoy smoother, more polished interactions across your real estate platform! 🎉
