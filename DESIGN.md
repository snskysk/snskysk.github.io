# Language switch and design variants

This page has two switches in the header, next to Dark Mode:

| Switch | Values | Stored in |
|---|---|---|
| Language | `EN` / `日本語` | `localStorage.siteLang` |
| Design | `Modern` (default) / `Classic` / `Editorial` / `Minimal` | `localStorage.siteDesign` |
| Dark Mode (pre-existing) | on / off | `localStorage.darkSwitch` |

All three are independent, so any language works with any design in either light
or dark mode. The choice is remembered per browser.

## Files

| File | Role |
|---|---|
| `assets/css/styles.css` | **The original theme. Not modified.** |
| `assets/css/site-prefs.css` | Language visibility rules + the control panel |
| `assets/css/design-variants.css` | The three alternative designs |
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

If you change the button or badge rules, check the result in all four designs in
both light and dark mode. The label disappearing into its own background is the
symptom to look for.

## Known gaps

- The skill tooltips (`title="..."`) are English only; the `title` attribute
  cannot hold two languages without re-initialising the Bootstrap tooltip.
- The undergraduate supervisor's name is left in romaji in the Japanese view
  (`Noritake Sunaga 先生`) because the kanji spelling was not confirmed.
