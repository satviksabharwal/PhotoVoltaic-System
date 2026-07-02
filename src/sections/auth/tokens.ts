// ----------------------------------------------------------------------
// SolarSense auth design tokens.
// Sourced from the SolarSense design spec (warm solar-yellow + white theme).
// ----------------------------------------------------------------------

export const solar = {
  accent: '#FFC107', // primary solar yellow — CTA fill, focus ring, wordmark "Sense", logo accent
  accentDeep: '#B57F00', // deep amber — links, "Forgot password?", checkbox accent
  ink: '#1D1A14', // near-black warm charcoal — body text, CTA label, logo backgrounds
  paper: '#FDFBF6', // warm off-white — the floating form card
  line: '#E9E4D8', // input border (default)
  fieldLabel: '#3E3828', // field labels
  sub: '#6B6455', // card subtitles, consent/helper text
  muted: '#8A8270', // placeholder text, eye icon
  inputBg: '#FFFFFF', // text input background
  eyeHover: '#F3EFE4', // eye toggle hover background

  fontDisplay: "'Space Grotesk', sans-serif", // wordmark, taglines, headings, buttons
  fontBody: "'Instrument Sans', sans-serif", // inputs, labels, helper text
} as const;

// Full-bleed background layers for the auth shell.
export const solarBg = {
  // Warm "solar dusk" gradient — makes the screen look finished with no photo.
  sky: 'radial-gradient(ellipse 1000px 560px at 66% 76%, rgba(255,214,110,.95), rgba(255,193,7,.38) 46%, rgba(255,193,7,0) 72%), linear-gradient(180deg,#221B0D 0%,#453310 42%,#A9770F 70%,#EFB01B 100%)',
  // Subtle striped horizon anchored to the bottom.
  horizon:
    'repeating-linear-gradient(90deg, rgba(255,255,255,0) 0 110px, rgba(255,214,110,.06) 110px 113px), linear-gradient(180deg, rgba(20,16,8,0) 0%, rgba(20,16,8,.85) 55%, #14100A 100%)',
  // Amber tint that keeps overlaid text legible and blends any photo into the brand.
  scrim:
    'linear-gradient(100deg, rgba(38,26,4,.74) 0%, rgba(52,35,6,.40) 42%, rgba(120,80,10,.18) 100%), radial-gradient(ellipse 720px 520px at 22% 82%, rgba(255,176,27,.20), rgba(255,176,27,0) 68%)',
} as const;
