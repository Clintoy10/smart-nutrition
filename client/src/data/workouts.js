const buildMedia = (label, accent) => {
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 200'>
      <defs>
        <linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop stop-color='${accent}' offset='0%' />
          <stop stop-color='#e8f5e9' offset='100%' />
        </linearGradient>
      </defs>
      <rect width='320' height='200' rx='16' fill='url(#g)' />
      <text x='50%' y='50%' text-anchor='middle' fill='#1b5e20' font-family='Arial, sans-serif' font-size='26' font-weight='700'>
        ${label}
      </text>
      <text x='50%' y='70%' text-anchor='middle' fill='#2e7d32' font-family='Arial, sans-serif' font-size='14'>
        Form - Control - Breathe
      </text>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const WORKOUT_TYPES = [
  {
    slug: 'strength',
    title: 'Strength',
    icon: 'bi-barbell',
    description: 'Build muscle and joint support with controlled reps.',
    focus: 'Push/pull splits or full-body 3x weekly.',
    moves: ['Squats', 'Deadlifts', 'Bench/Push-ups', 'Rows', 'Overhead press', 'Lunges'],
    media: buildMedia('Strength', '#c8e6c9'),
    detail: 'Prioritise compound lifts and progressive overload with 2-3 minutes rest on heavy sets.',
    guide: [
      'Warm up with 2-3 ramp sets before your heaviest work.',
      'Use a steady tempo (about 2 seconds down) to own positions.',
      'Stop 1-3 reps shy of failure; add load or reps week to week.',
      'Finish with a lighter accessory for the same pattern (e.g., split squats after squats).',
    ],
  },
  {
    slug: 'cardio',
    title: 'Cardio',
    icon: 'bi-heart-pulse',
    description: 'Improve heart health and endurance with steady movement.',
    focus: '20-40 minutes, zone 2-3 effort.',
    moves: ['Brisk walk', 'Jog/Run', 'Cycling', 'Rowing', 'Elliptical', 'Jump rope'],
    media: buildMedia('Cardio', '#b2ebf2'),
    detail: 'Keep intensity conversational; build duration before adding speed or hills.',
    guide: [
      'Pick a pace where you can talk in full sentences (zone 2).',
      'Hold steady for 10-15 minutes, then add 5 minutes weekly up to 40.',
      'Use relaxed breathing to stay under control; avoid early surges.',
      'Cool down 3-5 minutes and hydrate with a pinch of salt if you sweat heavily.',
    ],
  },
  {
    slug: 'hiit',
    title: 'HIIT',
    icon: 'bi-lightning-charge',
    description: 'Short, intense intervals for power and metabolic boost.',
    focus: '8-15 minutes, 1:1 or 1:2 work/rest ratios.',
    moves: ['Sprints', 'Kettlebell swings', 'Burpees', 'Mountain climbers', 'Battle ropes'],
    media: buildMedia('HIIT', '#ffe082'),
    detail: 'Warm up well; keep sets crisp and stop before form breaks down.',
    guide: [
      'Warm up thoroughly; practice the movement at low speed first.',
      'Choose one power move; work 15-30 seconds, rest 30-60 seconds.',
      'Cap at 8-12 total rounds; switch to low impact if form fades.',
      'Finish with easy breathing drills to drop the heart rate.',
    ],
  },
  {
    slug: 'mobility',
    title: 'Mobility & Stretch',
    icon: 'bi-arrows-move',
    description: 'Restore range of motion and reduce stiffness.',
    focus: '5-15 minutes daily around joints you train.',
    moves: ['Hip openers', 'Thoracic rotations', 'Ankle dorsiflexion drills', 'Hamstring stretch', 'Pigeon pose'],
    media: buildMedia('Mobility', '#d1c4e9'),
    detail: 'Pair stretches with light activation to own new ranges.',
    guide: [
      'Spend 30-60 seconds in each stretch; breathe slow and keep ribs down.',
      'Follow with a light activation in the same range (e.g., leg lift after hip opener).',
      'Prioritise areas you will load today (hips/ankles before squats, shoulders before presses).',
      'Finish with 3-5 controlled breaths to keep tension low.',
    ],
  },
  {
    slug: 'core',
    title: 'Core',
    icon: 'bi-circle-half',
    description: 'Stabilize the spine and improve posture.',
    focus: '2-3 sets after lifts or on off days.',
    moves: ['Planks', 'Dead bugs', 'Pallof press', 'Hollow holds', 'Side planks'],
    media: buildMedia('Core', '#ffccbc'),
    detail: 'Aim for tension and breathing control instead of racing reps.',
    guide: [
      'Brace lightly (like a gentle cough) and breathe through the nose when you can.',
      'Hold positions 20-40 seconds; keep hips level and ribs tucked.',
      'Rotate anti-extension, anti-rotation, and carry variations across the week.',
      'Stop if you feel lower-back strain; shorten the hold and reset.',
    ],
  },
  {
    slug: 'balance',
    title: 'Balance & Stability',
    icon: 'bi-joystick',
    description: 'Train control and injury prevention.',
    focus: 'Light work in warm-ups or finishers.',
    moves: ['Single-leg RDL', 'Step-downs', 'Bosu holds', 'Heel-to-toe walk', 'Lateral bounds'],
    media: buildMedia('Balance', '#c5cae9'),
    detail: 'Start with slow tempo single-leg drills before adding load.',
    guide: [
      'Start barefoot or in flat shoes; use a wall or dowel for light support.',
      'Lower in 3-4 seconds on single-leg drills; pause at the bottom.',
      'Hold balance positions 20-45 seconds before adding weight or movement.',
      'Advance to dynamic moves (bounds, step-downs) only after you can stay stable.',
    ],
  },
  {
    slug: 'recovery',
    title: 'Recovery',
    icon: 'bi-droplet-half',
    description: 'Recharge between sessions and manage fatigue.',
    focus: 'Sleep, light movement, and breath work.',
    moves: ['Walks', 'Foam rolling', 'Box breathing', 'Light yoga flow', 'Contrast shower'],
    media: buildMedia('Recovery', '#ffe0b2'),
    detail: 'Stack sleep, hydration, and gentle movement to bounce back faster.',
    guide: [
      'Sleep 7-9 hours; front-load fluids and add electrolytes if you sweat a lot.',
      'Use 5-10 minutes of easy walking or cycling to reduce soreness.',
      'Foam roll tender spots for 30-60 seconds, then move that joint lightly.',
      'Try 4-6 slow breaths (4 seconds in, 6 out) to downshift before bed.',
    ],
  },
  {
    slug: 'conditioning',
    title: 'Sport & Conditioning',
    icon: 'bi-flag',
    description: 'Carry over fitness to real-world play.',
    focus: 'Movement quality first; progress volume gradually.',
    moves: ['Pick-up sports', 'Ruck/Weighted walk', 'Agility ladder', 'Shuttle runs', 'Med ball throws'],
    media: buildMedia('Conditioning', '#c8e6c9'),
    detail: 'Layer agility and power after a base of cardio and strength.',
    guide: [
      'Warm up with skips, shuffles, and acceleration drills before sharp cuts.',
      'Build change-of-direction work after you can sprint straight pain-free.',
      'Increase total volume by no more than 10 percent per week.',
      'Cap hard sessions at 20-30 minutes; finish with a light cooldown walk.',
    ],
  },
];
