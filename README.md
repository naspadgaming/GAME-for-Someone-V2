# GAME for Someone V2

Personal birthday game built with Three.js, with an optional message and music gift.

## Python prototype (Ursina)

Prototype game in 3D (single-player) using the Ursina engine.

Run:

```bash
pip install -r requirements.txt
python main.py
```

Controls:
- WASD to move
- Mouse to look
- Left click to destroy block
- Right click to place block

Save / Load:
- Press `K` to save the world to `world.json`.
- Press `L` to load the world from `world.json`.

UI:
- Use the filename input at the top-left to change the save file name.
- Click the `Save` or `Load` buttons to save/load without keyboard.

## Web game: greeting inbox across devices

The web version offers the recipient an optional, personal invitation to share a message with the game owner about the year they have known each other. It clearly says that a submitted message is stored and readable by the owner, and lets the recipient skip without sending anything. Messages are available in the private owner inbox at `/inbox.html`.

### One-time setup for Vercel

1. Create a Supabase project and open its **SQL Editor**.
2. Run the SQL in [supabase-schema.sql](supabase-schema.sql) to create the greeting table.
3. In the Supabase project settings, copy the project URL and the **service_role** API key. Keep the service-role key private; never put it in browser code or commit it to Git.
4. In the Vercel project, add these Environment Variables for Production (and Preview if needed):
	- `SUPABASE_URL` — the Supabase project URL.
	- `SUPABASE_SERVICE_ROLE_KEY` — the private service-role API key.
	- `INBOX_PASSWORD` — a long, unique password used only to open `/inbox.html`.
5. Redeploy the site. Then open `https://<your-domain>/inbox.html` on your laptop and sign in with `INBOX_PASSWORD`.

The recipient may submit a message with **Kirim Pesan** or choose **Lewati**. The inbox has a refresh button, per-message `.txt` downloads, and a CSV download for all currently listed messages. Inbox reads require the password; submissions are public by design. Only text is stored—the optional music upload is not uploaded to the server.

Blocks & Colors:
- Multiple block types available: `Grass`, `Dirt`, `Stone`, `Wood`, `Water`.
- Press `Q` / `E` to cycle the selected block type; preview shown top-right.
- Placing a block uses the currently selected type.
