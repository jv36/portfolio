# joaovicente.dev

Personal portfolio built with Next.js and shadcn/ui.

## Songs of the week

- Public page: `/songs` (archive lives at `/songs/YYYY-MM-DD`)
- Admin page: `/admin`

The admin editor searches the public iTunes Search API, stores the selected
tracks, artwork, preview URLs and your commentary. Weeks are kept as history, so
older weekly picks stay available in the archive.

### Configuration

Create a `.env` file (see `.env.example`) with:

```bash
ADMIN_PASSWORD=choose-a-password
SESSION_SECRET=a-long-random-string
```

`ADMIN_PASSWORD` enables the admin editor. `SESSION_SECRET` signs the admin
session cookie; if it is omitted, `ADMIN_PASSWORD` is used as the signing key.

### Data

In production the picks are stored in
`$SONGS_DATA_DIR/songs-of-the-week.json` (Docker uses the `portfolio_data`
volume mounted at `/data`). Locally it defaults to `./data/songs-of-the-week.json`.

## Development

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm run lint
npm run build
```
