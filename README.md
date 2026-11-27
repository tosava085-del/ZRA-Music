<div align="center">

# ZRA MUSIC | Spatial Music

### Klien Web YouTube Music Modern Berbasis Next.js 15, Material 3 Expressive, Pure Black AMOLED, Mesin Lirik Sinkron 5-Gaya, Ambient AOD & Opt-In Physics Liquid Glass

<p>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15.4.9-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.2.1-149ECA?style=for-the-badge&logo=react&logoColor=white" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.9" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" /></a>
  <a href="https://motion.dev/"><img src="https://img.shields.io/badge/Motion-12.23-FFF312?style=for-the-badge&logo=framer&logoColor=black" alt="Motion" /></a>
</p>

<p>
  <a href="https://www.npmjs.com/package/ytmusic-api"><img src="https://img.shields.io/badge/ytmusic--api-v6.0-FF0000?style=flat-square&logo=youtubemusic&logoColor=white" alt="ytmusic-api" /></a>
  <img src="https://img.shields.io/badge/Unit_Tests-26%2F26_Passing-22C55E?style=flat-square&logo=node.js&logoColor=white" alt="26/26 Unit Tests Passing" />
  <img src="https://img.shields.io/badge/ESLint-0_Errors-4B32C3?style=flat-square&logo=eslint&logoColor=white" alt="ESLint 0 Errors" />
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-D22128?style=flat-square&logo=apache&logoColor=white" alt="Apache 2.0 License" /></a>
  <img src="https://img.shields.io/badge/Deploy-Vercel_Ready-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel Ready" />
</p>

<p>
  <a href="#-galeri-preview">Galeri Preview</a> •
  <a href="#-fitur-utama">Fitur Utama</a> •
  <a href="#-teknologi-yang-digunakan">Tech Stack</a> •
  <a href="#-arsitektur--struktur-direktori">Arsitektur</a> •
  <a href="#-dokumentasi-api-internal">API Routes</a> •
  <a href="#-instalasi--menjalankan-lokal">Instalasi</a> •
  <a href="#-pengujian-unit-test">Pengujian</a> •
  <a href="#-lisensi">Lisensi</a>
</p>

</div>

---

## Tentang ZRA

**ZRA** adalah aplikasi web klien **YouTube Music** modern berbasis **Next.js App Router** yang menggabungkan pengalaman desain **Material 3 Expressive** & **Pure Black AMOLED**, **Dynamic Color** adaptif dari sampul album, **Dynamic Island Pro** (dengan dukungan *Background Picture-in-Picture*), serta efek opt-in **Physics Liquid Glass** (menggunakan simulasi refraksi Hukum Snell + filter SVG `feDisplacementMap` + *specular rim highlight*).

Secara fungsional, ZRA memadukan mesin rekomendasi, antrean, dan animasi lirik per-kata bergaya **Metrolist** dengan fitur analitik, audio tools, dan antarmuka ekspresif bergaya **ArchiveTune** — termasuk **Equalizer 5-Band**, **Sleep Timer (End of Current Track)**, **Ambient Always-On Display (AOD)**, **Shareable Lyrics Card Studio**, **Listening Stats & Year-in-Music Recap**, **Auto Top Mixes**, **Custom Playlist Tags**, serta **Dual-Scope Search (Online + My Library)**.

> **Performa Awal Ringan:** Saat web pertama kali dibuka, ZRA menggunakan gaya dock ringan (`dockStyle: 'default'`) agar rendering cepat dan hemat sumber daya. Mode **Liquid Glass** berbasis SVG refraksi dapat diaktifkan kapan saja melalui menu **Settings → Appearance**.

---

## Galeri Preview

### Tampilan Desktop (`1440×900`)

| Now Playing (V9 Expressive + Dynamic Color) | Audio Equalizer 5-Band + Sub-Bass |
| :---: | :---: |
| <img src="./docs/screenshots/now-playing-desktop.png" alt="ZRA Now Playing Desktop" width="100%" /> | <img src="./docs/screenshots/equalizer-desktop.png" alt="Sonara Audio Equalizer Desktop" width="100%" /> |

<div align="center">
  <img src="./docs/screenshots/aod-desktop.png" alt="ZRA Ambient Always-On Display Desktop" width="92%" />
  <br />
  <sub><b>Ambient Always-On Display (AOD)</b> — Mode latar Adaptive Blurred Art, jam digital bold, sampul Squircle, ticker lirik sinkron real-time, & kontrol OLED hemat layar.</sub>
</div>

### Tampilan Mobile (`390×844` / `360×780`)

| Explore (Podium & Moods) | Library (5-Tab & Auto Mixes) | Listening Stats & Recap | Now Playing V9 | Ambient AOD (Pure Black) |
| :---: | :---: | :---: | :---: | :---: |
| <img src="./docs/screenshots/explore-mobile.png" alt="Explore Mobile" width="180" /> | <img src="./docs/screenshots/library-mobile.png" alt="Library Mobile" width="180" /> | <img src="./docs/screenshots/stats-mobile.png" alt="Stats Mobile" width="180" /> | <img src="./docs/screenshots/now-playing-mobile.png" alt="Now Playing Mobile" width="180" /> | <img src="./docs/screenshots/aod-mobile.png" alt="AOD Mobile" width="180" /> |

---

## Fitur Utama

### 1. Pemutar Musik & Kontrol Ekspresif (`NowPlayingSheet`, `MiniPlayer`, `PlayerSlider`)
- **Pemutaran Langsung YouTube IFrame Player API**: Mendukung mode audio-fokus maupun tampilan **Video Stage** langsung di dalam `Now Playing`.
- **V9 Expressive Elastic Controls vs Classic**: Tombol pemutar utama bergaya elastis dengan animasi pegas dan morfologi bentuk *Play/Pause* (pil bulat ↔ kotak membulat) yang dapat dialihkan ke gaya *Classic* di Pengaturan.
- **5 Latar Belakang Pemutar (`PlayerBackground`)**: `BLURRED_ARTWORK`, `SOLID`, `GRADIENT`, `ANIMATED_GRADIENT`, dan `LIQUID`.
- **4 Gaya Seekbar (`PlayerSlider`)**: `DEFAULT`, `SQUIGGLY` (gelombang sinusoidal SVG yang rata saat jeda dan bergelombang saat diputar), `WAVY`, dan `SLIM`.
- **Kontrol Lanjutan**: Kecepatan putar (*playback rate*), durasi lompat kustom (`5s`, `10s`, `15s`, `30s`), gestur geser ganti lagu (*swipe to change track*), *keep paused on song change*, dan *auto skip on error*.

### 2. Mesin Lirik Sinkron 5-Gaya & Lyrics Card Studio (`SyncedLyricsView`, `LyricsShareModal`)
- **Resolusi Sumber Berlapis (`/api/music/lyrics`)**:
  1. **YouTube Music Timed Lyrics** (`yt.getTimedLyrics`)
  2. **LRCLIB Synced & Plain Lyrics** (`lrclib.net/api/get`) dengan parser LRC & format enhanced `<mm:ss.xx>`
  3. **YouTube Music Plain Lyrics** (`yt.getLyrics`)
- **5 Gaya Animasi Kata (`lib/metrolist/lyricsEngine.ts`)**: `APPLE`, `BRACCATO`, `EXPRESSIVE`, `SIMPLE`, dan `NONE`, lengkap dengan **Live Preview** interaktif di halaman Settings.
- **Kustomisasi Penuh**: Perataan teks (`LEFT`, `CENTER`, `RIGHT`), ukuran huruf (`18px–34px`), spasi baris (`1.0×–2.2×`), *Progressive Blur* pada baris jauh, mode warna tema vs netral, klik lirik untuk melompat waktu (*click-to-seek*), auto-scroll cerdas, dan offset sinkronisasi global (`-2000ms` hingga `+2000ms`).
- **Shareable Lyrics Card Studio**: Pilih 1–4 baris lirik, atur rasio kartu (`1:1`, `4:5`, `9:16`), pilih 5 tema visual (*Artwork Blur*, *Deep Gradient*, *AMOLED Dark*, *Editorial Paper*, *Frosted Slate*), salin teks kutipan, atau ekspor gambar PNG resolusi tinggi melalui HTML5 Canvas.

### 3. Audio Tools & Ambient Always-On Display (`AudioToolsModals`, `AodPlayerOverlay`)
- **Audio Equalizer 5-Band**: Pengaturan 5 pita frekuensi (`60Hz`, `230Hz`, `910Hz`, `3.6kHz`, `14kHz`) dalam rentang `-12 dB` hingga `+12 dB`, **6 preset siap pakai** (*Flat*, *Bass Boost*, *Vocal Clarity*, *Acoustic*, *Electronic*, *Late Night*) + mode *Custom*, tombol reset cepat, dan sakelar **Sub-Bass Enhancement**.
- **Sleep Timer Lanjutan**: Pilihan cepat (`10`, `15`, `30`, `45`, `60`, `90` menit), slider durasi kustom (`5–120 menit`), serta mode **End of Current Track** yang otomatis menghentikan pemutaran tepat setelah lagu aktif selesai.
- **Queue Search**: Pencarian instan di dalam tab `Queue` pada `Now Playing` untuk menyaring daftar antrean berdasarkan judul lagu atau artis.
- **Ambient Always-On Display (AOD)**:
  - 3 gaya jam digital: `BOLD`, `MINIMAL`, `STACKED`
  - 5 bentuk bingkai sampul: `SQUIRCLE`, `CIRCLE`, `ROUNDED`, `ARCH`, `DIAMOND`
  - 3 latar OLED: `PURE_BLACK` (`#000000`), `AMBIENT_GLOW`, dan `ADAPTIVE_ART`
  - Ticker lirik sinkron satu baris, kontrol pemutar minim *burn-in*, serta tombol **Touch Lock**.

### 4. Dynamic Island Pro & Background Play (`DynamicIsland`, `DynamicIslandPopup`, `lib/metrolist/background.ts`)
- **Cascading Background Popup Strategy**: Otomatis memilih mode terbaik yang didukung browser: `Document Picture-in-Picture` → `Canvas Video PiP` → `Floating Overlay`.
- **Integrasi Media Session API**: Menampilkan metadata lagu, sampul album, posisi putar, serta tombol Play/Pause/Prev/Next pada kontrol media sistem operasi dan layar kunci, dilengkapi *visibility recovery* & koreksi drift.

### 5. Beranda Editorial, Explore, Dual-Scope Search & Library Analytics
- **Home (`HomeView`, `HomeEditorialSections`)**: Berbagai variasi layout editorial (kartu unggulan, daftar padat, karusel album, rak bergaya majalah), filter mood (*All*, *Relax*, *Energize*, *Focus*, *Workout*, *Commute*, *Sad*), strip genre, *Quick Picks* (menjaga invarian filter `hideVideoSongs` sebelum slicing), *Keep Listening*, dan *Forgotten Favorites*.
- **Explore (`ChartsView`)**: Strip ubin interaktif **Moods & Genres**, tombol aksi *Play Chart* & *Shuffle*, kartu **Top 3 Podium** asimetris, daftar peringkat penuh `#4+`, dan karusel **New Releases**.
- **Dual-Scope Search (`SearchView`)**: Beralih instan antara pencarian **Online** (dengan saran *autocomplete* & filter *All / Songs / Videos / Albums / Artists / Playlists*) dan **My Library** (pencarian lokal deduplikasi lintas lagu disukai, riwayat, playlist, dan tag), dilengkapi kartu **Top Result** unggulan dan pilihan urutan (*Relevance*, *Title*, *Duration*).
- **Library (`LibraryView`, `StatsView`)**:
  - 5 tab terpadu: **Playlists**, **Liked**, **History**, **Stats**, dan **Saved**.
  - **Auto Top Mixes** otomatis (`My Top Mix`, `On Repeat`, `Rediscover`) dari riwayat putar & lagu disukai.
  - **Custom Playlist Tags**: Tambah/hapus tag pada playlist dan filter koleksi berdasarkan tag.
  - **Impor Playlist YouTube Music** via URL atau Playlist ID, filter teks lokal, pengurutan (*Recent*, *Title A–Z*, *Artist*, *Most Played*, *Duration*), serta sakelar **Grid / List**.
  - **Listening Stats & Year-in-Music Recap**: Filter periode (`7 Days`, `30 Days`, `This Year`, `All Time`), persona pendengar, total menit & putaran, porsi artis, ritme 7 hari, distribusi 24 jam, podium Top 3 lagu, dan modal cerita interaktif **Play Year Recap** 4 slide.
- **Detail View (`DetailView`)**: Header hero berlatar sampul buram adaptif untuk Album, Playlist, Artis, dan Playlist Pengguna — lengkap dengan total durasi lagu, kontrol *Play All / Shuffle / Radio / Save*, editor tag inline, dan pencarian lagu di dalam daftar.

### 6. Sistem Tema & Physics Liquid Glass (`lib/metrolist/theme.ts`, `lib/liquid-glass/refraction.ts`)
- **Tema & Warna**: Mode Gelap/Terang, **Pure Black AMOLED**, **Dynamic Color** dari warna dominan sampul album, 5 preset aksen (`metrolist`, `rose`, `emerald`, `violet`, `amber`), dan kustomisasi radius sudut thumbnail (`8`, `16`, `24`, `32`).
- **Opt-In Liquid Glass (Referensi Fisika `kube.io`)**: Menghitung profil tinggi permukaan *convex squircle*, pembiasan cahaya berbasis **Hukum Snell** (`n = 1.5`), peta perpindahan 2D (`feDisplacementMap` SVG), dan peta pantulan spekular tepi (*specular rim highlight*) untuk preset `pill`, `orb`, dan `droplet`.

---

## Teknologi yang Digunakan

| Kategori | Teknologi / Paket | Versi | Kegunaan di Project |
| :--- | :--- | :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router) | `15.4.9` | Routing, SSR/RSC, API Routes (`nodejs` runtime), build standalone |
| **UI Library** | [React](https://react.dev/) & React DOM | `19.2.1` | Arsitektur komponen modular & state context (`MusicProvider`) |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) | `5.9.3` | Strict typing untuk model media, antrean, statistik, dan API |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + `@tailwindcss/postcss` | `4.1.11` | Utility styling, dark/AMOLED tokens, animasi `tw-animate-css` |
| **Animasi** | [Motion (`motion/react`)](https://motion.dev/) | `12.23.24` | Transisi layar, kontrol elastis V9, modal, & animasi lirik |
| **Ikon** | [Lucide React](https://lucide.dev/) | `0.553.0` | Konsistensi ikonografi modern di seluruh UI |
| **Sumber Musik** | [`ytmusic-api`](https://www.npmjs.com/package/ytmusic-api) | `6.0.0` | Home shelves, search, suggestions, detail album/artis/playlist, up-next, & timed lyrics |
| **Sumber Lirik** | [LRCLIB API](https://lrclib.net/) | REST | Lirik sinkron LRC & plain lyrics sebagai fallback/pelengkap YouTube Music |
| **Tipografi** | Google Fonts (`next/font/google`) | — | `Plus Jakarta Sans`, `DM Sans`, dan `JetBrains Mono` (angka tabular) |
| **Utilitas CSS** | `clsx`, `tailwind-merge`, `class-variance-authority` | — | Komposisi kelas Tailwind yang aman dan modular (`lib/utils.ts`) |
| **Pengujian** | `node:test` + `tsx` | Built-in | 26 unit test deterministik untuk logika murni |
| **Linting** | ESLint + `eslint-config-next` | `9.39.1` | Validasi kualitas kode dan aturan Next.js/React |

---

## Arsitektur & Struktur Direktori

```text
.
├── app/
│   ├── layout.tsx                   # Root layout, Google Fonts, metadata SEO & OpenGraph
│   ├── page.tsx                     # Shell utama aplikasi (Sidebar, MobileNav, Views, Player)
│   ├── globals.css                  # Tailwind v4 & token desain Material 3 / AMOLED / Glass
│   └── api/music/
│       ├── home/route.ts            # GET rak beranda, mood picks, & quick pick candidates
│       ├── search/route.ts          # GET pencarian katalog & autocomplete suggestions
│       ├── detail/route.ts          # GET detail album, playlist, & artis
│       ├── up-next/route.ts         # GET kelanjutan radio / rekomendasi lagu berikutnya
│       └── lyrics/route.ts          # GET lirik sinkron (YTMusic Timed -> LRCLIB -> Plain)
├── components/
│   ├── MusicProvider.tsx            # State global pemutar, YouTube IFrame, antrean, & persistensi
│   ├── HomeView.tsx                 # Halaman Beranda + filter mood, genre, & Quick Picks
│   ├── HomeEditorialSections.tsx    # Variasi layout rak editorial pada Beranda
│   ├── ChartsView.tsx               # Halaman Explore (Moods & Genres, Top 3 Podium, New Releases)
│   ├── SearchView.tsx               # Halaman Search Dual-Scope (Online + Local Library)
│   ├── LibraryView.tsx              # Halaman Library 5-tab, Auto Top Mixes, & Playlist Tags
│   ├── StatsView.tsx                # Analitik mendengarkan & modal Year-in-Music Recap
│   ├── DetailView.tsx               # Tampilan imersif Album, Playlist, Artis, & Playlist Lokal
│   ├── SettingsView.tsx             # Pengaturan Appearance, Lyrics, Player, AOD, EQ, & Data
│   ├── NowPlayingSheet.tsx          # Lembar Now Playing penuh (Playing / Lyrics / Queue)
│   ├── AudioToolsModals.tsx         # Modal Equalizer 5-Band & Sleep Timer (End of Track)
│   ├── AodPlayerOverlay.tsx         # Overlay Ambient Always-On Display (OLED)
│   ├── SyncedLyricsView.tsx         # Renderer lirik sinkron 5 gaya + Progressive Blur
│   ├── LyricsShareModal.tsx         # Studio kartu kutipan lirik (1:1, 4:5, 9:16 + export PNG)
│   ├── PlayerBackground.tsx         # 5 gaya latar pemutar adaptif
│   ├── PlayerSlider.tsx             # 4 gaya seekbar (Default, Squiggly, Wavy, Slim)
│   ├── DynamicIsland.tsx            # Bilah status Dynamic Island interaktif
│   ├── DynamicIslandPopup.tsx       # Background Player Popup (Document PiP / Video PiP / Overlay)
│   ├── LiquidGlassSurface.tsx       # Layer opt-in SVG Liquid Glass berbasis refraksi
│   ├── MiniPlayer.tsx               # Pemutar mini mengambang (desktop)
│   ├── Sidebar.tsx                  # Navigasi sidebar desktop + daftar playlist cepat
│   ├── MobileNav.tsx                # Navigasi 4-tab mobile + mini player mobile
│   ├── ArtworkImage.tsx             # Komponen gambar sampul dengan fallback bersih
│   ├── PlaylistPickerModal.tsx      # Modal tambah lagu ke playlist
│   ├── TrackContextMenu.tsx         # Menu aksi lagu (Play Next, Add to Queue, Radio, Save)
│   └── Skeletons.tsx                # Loading skeleton responsif
├── lib/
│   ├── metrolist/
│   │   ├── types.ts                 # Definisi tipe Track, Playlist, Settings, Lyrics, dsb.
│   │   ├── seed.ts                  # Pengaturan default (dockStyle: 'default') & data awal
│   │   ├── storage.ts               # Persistensi localStorage (riwayat, liked, playlist, settings)
│   │   ├── queue.ts                 # QueueEngine (playNext, append, shuffle pin, repeat, radio)
│   │   ├── recommendations.ts       # Filter preferensi, Quick Picks, Keep Listening, Forgotten Favorites
│   │   ├── lyrics.ts                # Parser LRC & utilitas format durasi
│   │   ├── lyricsEngine.ts          # Fisika 5 gaya animasi kata, offset, progressive blur, squiggly SVG
│   │   ├── statsEngine.ts           # Agregasi statistik, Auto Top Mixes, pencarian lokal, & preset EQ
│   │   ├── background.ts            # Cascade Background Popup, Media Session, & drift correction
│   │   ├── theme.ts                 # Resolver tema Dark/Light/AMOLED & ekstraksi Dynamic Color
│   │   ├── logic.test.ts            # Unit test rekomendasi, antrean, tema, & background popup
│   │   ├── lyricsEngine.test.ts     # Unit test parser enhanced word timing & 5 gaya animasi lirik
│   │   └── statsEngine.test.ts      # Unit test statistik, Auto Top Mixes, pencarian lokal, & EQ
│   ├── liquid-glass/
│   │   ├── refraction.ts            # Matematika Hukum Snell, convex squircle, displacement & specular map
│   │   └── refraction.test.ts       # Unit test fisika refraksi & pembangkitan peta SVG
│   ├── server/
│   │   └── ytmusic.ts               # Client wrapper & normalizer ytmusic-api sisi server
│   └── utils.ts                     # Helper `cn()` (clsx + tailwind-merge)
├── hooks/
│   └── use-mobile.ts                # Hook deteksi breakpoint mobile
├── docs/screenshots/                # Aset tangkapan layar preview terbaru
├── next.config.ts                   # Konfigurasi Next.js (standalone output & remotePatterns)
├── vercel.json                      # Konfigurasi fungsi serverless Vercel (`maxDuration: 25`)
└── LICENSE                          # Lisensi Apache 2.0
```

---

## Dokumentasi API Internal

Seluruh pemanggilan ke `ytmusic-api` dan `LRCLIB` dijalankan pada **Next.js API Routes (Node.js runtime)** sehingga aman dari batas CORS browser dan dilengkapi fallback otomatis.

| Endpoint | Method | Parameter Query / Header | Deskripsi |
| :--- | :---: | :--- | :--- |
| `/api/music/home` | `GET` | `gl` (`ID`\|`US`\|`JP`\|`KR`\|`GB`), `mood` (`all`\|`energize`\|`relax`\|`focus`\|`workout`\|`commute`\|`party`), Header opsional `x-yt-cookie` | Mengambil rak beranda YouTube Music, kurasi berbasis mood, dan kandidat *Quick Picks* (dengan fallback `SEED_TRACKS` jika upstream gagal). |
| `/api/music/search` | `GET` | `q` (kata kunci), `type` (`all`\|`songs`\|`videos`\|`albums`\|`artists`\|`playlists`), `gl`, `suggest=1` | Mencari katalog YouTube Music atau mengambil hingga 8 saran *autocomplete* saat `suggest=1`. |
| `/api/music/detail` | `GET` | `kind` (`album`\|`playlist`\|`artist`), `id`, `gl` | Memuat daftar lagu lengkap dan metadata untuk Album, Playlist YouTube Music, atau halaman Artis (top songs, albums, singles, featured playlists). |
| `/api/music/up-next` | `GET` | `videoId`, `gl` | Mengambil daftar lagu lanjutan (*Up Next / Auto Radio*) berdasarkan `videoId` aktif. |
| `/api/music/lyrics` | `GET` | `videoId`, `title`, `artist`, `duration` | Resolusi lirik berjenjang: YouTube Music Timed Lyrics → LRCLIB Synced/Plain Lyrics → YouTube Music Plain Lyrics. |

---

## Instalasi & Menjalankan Lokal

### Prasyarat
- **Node.js** versi `20.x` atau lebih baru
- **npm** (bawaan Node.js) atau **Bun** (`bun.lock` tersedia di repositori)
- Koneksi internet untuk mengambil katalog YouTube Music dan lirik LRCLIB

### 1. Clone Repositori

```bash
git clone https://github.com/sannnproject/Sonara-Music.git
```

### 2. Pasang Dependensi

Menggunakan **npm**:
```bash
npm install
```

Atau menggunakan **Bun**:
```bash
bun install

### 3. Jalankan Server Pengembangan

```bash
npm run dev
```

Buka browser dan kunjungi **[http://localhost:3000](http://localhost:3000)**.

### Perintah Skrip Lainnya

```bash
# Build produksi Next.js (output standalone)
npm run build

# Jalankan hasil build produksi
npm run start

# Jalankan pemeriksaan ESLint
npm run lint

# Bersihkan cache build Next.js
npm run clean
```

---

## Pengujian (Unit Test)

Logika inti aplikasi dipisahkan dari komponen UI dan diuji menggunakan test runner bawaan Node (`node:test` + `node:assert/strict`) melalui `tsx`.

Jalankan seluruh rangkaian unit test (26 pengujian):

```bash
npx --yes tsx --test \
  lib/metrolist/logic.test.ts \
  lib/metrolist/lyricsEngine.test.ts \
  lib/metrolist/statsEngine.test.ts \
  lib/liquid-glass/refraction.test.ts
```

### Cakupan Pengujian (`26/26 Pass`)
- **`lib/liquid-glass/refraction.test.ts` (5 tes)**: Validasi profil *convex squircle*, profil pembiasan Hukum Snell (`n = 1.0` vs `n = 1.5`), simetri peta perpindahan 2D, peta *specular rim highlight*, serta preset `pill`/`orb`/`droplet`.
- **`lib/metrolist/logic.test.ts` (9 tes)**: Validasi filter `hideVideoSongs` sebelum slicing *Quick Picks*, deduplikasi `videoId`, *Keep Listening*, *Forgotten Favorites*, *QueueEngine* (*playNext*, *append*, *shuffle pin*, *repeat*, *radio deduplication*), parser LRC, resolver tema AMOLED/Dynamic Color, dan strategi *Background Popup*.
- **`lib/metrolist/lyricsEngine.test.ts` (5 tes)**: Validasi parsing enhanced word timestamps `<mm:ss.xx>`, global offset, fisika 5 gaya animasi lirik (*Apple*, *Braccato*, *Expressive*, *Simple*, *None*), *progressive blur*, dan generator jalur SVG *Squiggly Seekbar*.
- **`lib/metrolist/statsEngine.test.ts` (7 tes)**: Validasi filter periode statistik (`7d`, `30d`, `year`, `all`), agregasi menit & porsi artis, pencarian pustaka lokal + tag, pengurutan track, pembangkitan **Auto Top Mixes** (*My Top Mix*, *On Repeat*, *Rediscover*), total durasi, serta helper **Equalizer**.

---

## Deployment

### Deploy ke Vercel
Repositori ini sudah menyertakan konfigurasi [`vercel.json`](./vercel.json) dengan batas waktu eksekusi optimal (`maxDuration: 25` detik) untuk seluruh endpoint `app/api/music/**/*.ts`:

1. Impor repositori ke dashboard [Vercel](https://vercel.com/).
2. Framework Preset akan otomatis terdeteksi sebagai **Next.js**.
3. Klik **Deploy** — aplikasi siap berjalan tanpa konfigurasi tambahan.

### Self-Hosting (Docker / VPS)
Berkat `output: 'standalone'` pada [`next.config.ts`](./next.config.ts), aplikasi dapat dijalankan secara ringan pada VPS atau kontainer:

```bash
npm run build
npm run start
```

---

## Komunitas & Kredit

**POWERED BY SANN404 FORUM GROUP**

<p>
  <a href="https://whatsapp.com/channel/0029Vb7vOOyLY6cyTRQF1M06"><img src="https://img.shields.io/badge/WhatsApp_Channel-SANN404-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp Channel" /></a>
  <a href="https://t.me/sannnforums"><img src="https://img.shields.io/badge/Telegram-@sannnforums-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram" /></a>
  <a href="https://www.tiktok.com/@sannforum.id"><img src="https://img.shields.io/badge/TikTok-@sannforum.id-000000?style=for-the-badge&logo=tiktok&logoColor=white" alt="TikTok" /></a>
</p>

### Referensi & Inspirasi Open-Source
- [ytmusic-api](https://github.com/zS1L3NT/ts-npm-ytmusic-api) — API klien YouTube Music TypeScript.
- [LRCLIB](https://lrclib.net/) — Penyedia lirik sinkron open-source.
- [kube.io Liquid Glass CSS/SVG](https://kube.io/blog/liquid-glass-css-svg/) — Referensi fisika refraksi optik untuk mode *Liquid Glass* opt-in.
- [Metrolist](https://github.com/MetrolistGroup/Metrolist) & [ArchiveTune](https://github.com/rukamori/ArchiveTune) — Inspirasi arsitektur fitur, animasi lirik, kontrol ekspresif, analitik, dan pengalaman pemutar musik Material 3.

---

## Lisensi

Proyek ini dilisensikan di bawah **Apache License 2.0**. Lihat berkas [`LICENSE`](./LICENSE) untuk rincian lengkap mengenai hak penggunaan, modifikasi, dan distribusi.

```text
Copyright 2026 ZRA  — BIG THX TO SANN404 FORUM GROUP

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
```
