# Lucky Claw

A browser claw-machine arcade game. Steer the claw, drop it on a prize, and hope the grip holds.

## Play

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## Controls

| Input | Action |
| --- | --- |
| `←` `→` or `A` `D` | Move claw |
| `Space` / `Enter` | Drop claw, or start a round |
| On-screen buttons | Same actions on touch devices |

## Rules

- Each play costs **1 coin** (you start with 12).
- Align the claw, then drop.
- Grip depends on aim, luck, and prize value — valuable prizes are harder to keep.
- Winning a prize adds to your score and refunds some coins.
- High score is saved in `localStorage`.

## Build

```bash
npm run build
npm run preview
```
