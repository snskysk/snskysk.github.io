# Language switch and design variants

This page has two switches in the header, next to Dark Mode:

| Switch | Values | Stored in |
|---|---|---|
| Language | `EN` / `日本語` | `localStorage.siteLang` |
| Design | `Modern` (default) / `Classic` / `Editorial` / `Minimal` | `localStorage.siteDesign` |
| Dark Mode (pre-existing) | on / off | `localStorage.darkSwitch` |

All three are independent, so any language works with any design in either light
or dark mode. The choice is remembered per browser.

## Which language a visitor sees first

1. If they have clicked `EN` or `日本語` on this site before, that choice wins.
   It is the only thing written to `localStorage.siteLang`.
2. Otherwise the boot snippet reads `navigator.languages`, the ordered list the
   browser also sends as its `Accept-Language` header, and takes the first entry
   that is Japanese (`ja`, `ja-JP`, ...) or English (`en`, `en-GB`, ...).
   So `["ja-JP", "en-US"]` gets Japanese and `["en-GB", "ja"]` gets English.
3. Anything else, including a browser that reports no language, gets English.

The detected language is deliberately **not** stored. Only an explicit click is.
That way the site keeps following the browser setting if it ever changes, and a
visitor who overrides it is never overridden back.

This keys off the browser's language preference, not the visitor's location.
Telling where someone is would need a geo-IP lookup, which a static GitHub Pages
site cannot do without calling a third-party API on every page load. The browser
preference is also the better signal: a Japanese speaker abroad still wants
Japanese, and an English speaker in Tokyo still wants English.

## Files

| File | Role |
|---|---|
| `assets/css/styles.css` | **The original theme. Not modified.** |
| `assets/css/site-prefs.css` | Language visibility rules + the control panel |
| `assets/css/design-variants.css` | The three alternative designs |
| `assets/css/paper-cards.css` | The illustrated publication list |
| `assets/css/experience.css` | Work history list and the Current-position card |
| `assets/js/site-prefs.js` | Wires up the buttons, remembers the choice |
| inline `<script>` right after `<body>` | Applies the stored choice before the first paint |

`Modern` is the current default. `Classic` is the original design: with
`data-design="classic"` **no rule in `design-variants.css` matches**, so the page
renders exactly as it did before.

To go back to Classic, change `data-design` on the `<body>` tag and the
`|| 'modern'` fallback in the boot snippet to `classic`.

## Picking a design and dropping the rest

1. Decide which design you want as the default.
2. In `index.html`, change the default on the `<body>` tag and in the boot
   snippet:

   ```html
   <body data-lang="en" data-design="modern">
   ```
   ```js
   var design = get('siteDesign') || 'modern';
   ```

   Visitors who already clicked a design keep their own choice; clearing
   `siteDesign` from localStorage (or using a fresh browser) shows the new default.
3. Delete the design picker: remove the whole `.prefs-row` marked
   `<!-- DESIGN PICKER ... -->` in `index.html`.
4. Optionally delete the unused variants' blocks from
   `assets/css/design-variants.css`. Each variant is self-contained: a palette
   block near the top (light + dark) and a "flavour" block in section 3.

## Reverting to exactly the original design

Remove these from `index.html`:

- the two `<link>` tags for `site-prefs.css` and `design-variants.css`
- the `<script src="assets/js/site-prefs.js">` tag
- the inline boot `<script>` after `<body>`

That is enough: `styles.css` was never touched. The bilingual markup
(`data-i18n="en"` / `data-i18n="ja"` pairs) is inert without
`site-prefs.css`, but **both languages would then show at once**, so if you want
English only, also delete the `data-i18n="ja"` elements — or keep
`site-prefs.css` and drop only `design-variants.css`, which is the tidier way to
keep the language switch and lose the new designs.

Alternatively, revert the commit that introduced all of this.

## Editing content

Text is authored twice, side by side:

```html
<p data-i18n="en">English sentence.</p>
<p data-i18n="ja">日本語の文。</p>
```

```html
<h3 class="title"><span data-i18n="en">Reviewer</span><span data-i18n="ja">査読委員</span></h3>
```

Keep both in sync when you add an entry. Paper titles, author names and the
press-release media list are deliberately shared between languages.

## Cascade note (worth knowing before editing the CSS)

`design-variants.css` has a shared section 2 that applies to every variant, and a
per-variant section 3 that refines it. For section 3 to be able to override
section 2, the two must sit at the same specificity, so the shared selectors are
written as:

```css
body[data-design]:where(:not([data-design="classic"])) a.btn-cta-secondary { ... }
```

`:where()` contributes no specificity, so this ties with
`body[data-design="editorial"] a.btn-cta-secondary` and loses to it on source
order, which is what we want. Writing a bare `:not()` there instead raises the
shared rule above every per-variant rule, which silently repainted Editorial's
and Minimal's outlined buttons as a solid accent fill while they kept their
accent-coloured label: accent text on an accent background.

For the same reason the generic link colour is scoped as `a:not(:where(.btn))`,
so it cannot capture buttons and hide their labels.

That same generic rule, at 0-2-2, also outranks a plain `.paper-list .paper-title a`
at 0-2-1, which is why those rules in `paper-cards.css` are written as
`body .paper-list .paper-title a`: the extra element lifts them to 0-2-2 and the
later file wins the tie. `design-variants.css` likewise excludes the cards from
its prose-list tweaks (`ul:not(.paper-list)`, `li:not(.paper-card)`) and from
Editorial's measure limit (`.content:not(.paper-content)`).

If you change the button or badge rules, check the result in all four designs in
both light and dark mode. The label disappearing into its own background is the
symptom to look for.

## Publication cards

The two publication sections use `.paper-list` from
`assets/css/paper-cards.css`. One entry looks like this:

```html
<li class="paper-card">
  <a class="paper-thumb" href="<arxiv abs>" target="_blank">
    <img src="assets/images/papers/<slug>.jpg" alt="..." loading="lazy" />
  </a>
  <div class="paper-body">
    <div class="paper-venue">
      <span class="venue-chip venue-neurips">NeurIPS 2026</span>
      <span class="venue-note">Under review</span>   <!-- preprints only -->
      <span class="venue-full">...EN/JA...</span>
    </div>
    <h3 class="paper-title"><a href="...">Title</a></h3>
    <p class="paper-authors">A, <span class="me">Shunsuke Yasuki</span>, B</p>
    <p class="paper-links"><a href="..."><i class="fas fa-file-pdf"></i>PDF</a></p>
  </div>
</li>
```

`.me` bolds your own name. Venue colours are set by the `venue-*` class; add a
new one next to `venue-cvpr` and friends in `paper-cards.css`.

Thumbnails live in `assets/images/papers/` and are shown with
`object-fit: contain` on a white panel, so any aspect ratio is safe and no
figure gets cropped. Two kinds are in use:

- **Animated `.webp`** for CVPR, ICCV and NeurIPS, re-encoded from the Taki Lab
  research-page GIFs (視覚的な解釈可能性 / 3D言語フィールド /
  イベントベースビジョンのための深層学習). The originals total 18 MB; thinning
  the frames, resizing to 480px and encoding as animated WebP brings all three
  down to about 770 KB. A browser too old for animated WebP (Safari 15 and
  earlier) shows the first frame, which is still a sensible picture.
- **1080px `.jpg`** for the rest, taken from the paper's own figure, cropped out
  of the arXiv PDF.

To re-encode a GIF: keep every second or third frame, folding the dropped
frames' durations into the one kept so the loop keeps its length, resize to
480px wide, then `Image.save(..., save_all=True, quality=50-58, method=6)`.

## Work history, awards and academic service

These three sections share `.job-list` from `assets/css/experience.css`:

```html
<li class="job-item">
  <span class="org-mark"><img src="assets/images/projects/sakiku.png" alt="sAkIku" /></span>
  <!-- or, where there is no logo file: -->
  <span class="org-mark org-aist"><span class="org-initials">AIST</span></span>
  <div class="job-body">
    <h3 class="job-role">...EN/JA...</h3>
    <p class="job-meta"><span class="job-org">...</span><span class="job-year">...</span></p>
    <p class="job-desc">...</p>
    <ul class="job-points"><li>...</li></ul>          <!-- optional -->
    <p class="job-output"><span class="job-output-label">成果</span>...</p>  <!-- optional -->
  </div>
</li>
```

An organisation with a logo file uses `<img>`; one without uses a monogram
tinted by an `org-*` class (`.org-neurips`, `.org-jsai`). Add a new colour next
to those in `experience.css`.

Logo files live in `assets/images/projects/`. `utokyo.png` and `aist.png` were
trimmed of their surrounding whitespace before being added, since the tile is
only ~54px and padding wastes most of it. The AIST source is a 5.4:1 lockup
(symbol plus 産総研) that would render about 8px tall in the tile, so only the
symbol is used; the full name is already in the text beside it.

To add another logo: crop the uniform border away by taking the bounding box of
everything that differs from the top-left pixel, flatten near-white pixels to
pure white so JPEG speckle does not show against the tile, and save at about
four times the tile size.

The sidebar "Current position" card uses `.now-card` from the same file.

Note for whoever edits `design-variants.css`: its prose-list rules exclude these
lists by name, as `ul:not(.paper-list, .job-list, .now-tags)` and
`li:not(.paper-card, .job-item)`. A new card list has to be added there too, or
it picks up a 1.2em indent in every non-Classic design.

## Known gaps

- The skill tooltips (`title="..."`) are English only; the `title` attribute
  cannot hold two languages without re-initialising the Bootstrap tooltip.
- The Japanese body copy is in plain form (常体) in Career Profile and
  Academia, but the remaining sections (Work Experience, Awards, Academic
  Service, Latest Works, News, Apps) are still in polite form (です・ます).
