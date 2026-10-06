#!/usr/bin/env node
// Exports the landing page's overview map of Germany as two standalone SVG files for use outside
// the app (slides, posters, print material):
//
//   docs/landing-map/germany_background.svg    -- the federal-state (NUTS-1) background only
//   docs/landing-map/germany_living_labs.svg   -- the same background with the five LL polygons
//
// It reuses the exact projection, path builder, canvas size and colours LandingMap.jsx renders
// with, so the files match what the start page shows (the LL polygons in their resting,
// un-hovered colour). Each state and LL is its own <path>/<g> with an id, so the files stay
// editable in Inkscape or Illustrator.
//
// Usage (from app/): npm run export:landing-svgs

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildProjection, featuresBbox } from '../src/lib/projection.js'
import { featureToPath } from '../src/lib/geojson.js'
import { C } from '../src/theme.js'

// Keep in sync with SVG_W / SVG_H in src/components/LandingMap.jsx.
const SVG_W = 420
const SVG_H = 560

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = join(appDir, 'public', 'data')
const outDir = join(appDir, '..', 'docs', 'landing-map')

const readJson = (name) => JSON.parse(readFileSync(join(dataDir, name), 'utf8'))
const nuts1 = readJson('nuts1_de.geojson')
const nuts3 = readJson('nuts3_ll_simplified.geojson')
const metadata = readJson('ll_metadata.json')

const lls = Object.values(metadata).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

const project = buildProjection(featuresBbox(nuts1.features), SVG_W, SVG_H, 16)

const escapeXml = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]
  )

const statesGroup = [
  '  <g id="germany-states">',
  ...nuts1.features.map(
    (f) =>
      `    <path id="${f.properties.NUTS_ID}" d="${featureToPath(f, project)}" fill="${C.surfaceDark}" stroke="${C.white}" stroke-width="1.2" stroke-linejoin="round"/>`
  ),
  '  </g>',
]

const llGroup = ['  <g id="living-labs">']
for (const ll of lls) {
  const feats = nuts3.features.filter((f) => ll.nuts3.includes(f.properties.NUTS_ID))
  if (feats.length === 0) throw new Error(`No NUTS-3 polygons found for Living Lab ${ll.slug}`)
  const d = feats.map((f) => featureToPath(f, project)).join(' ')
  const name = ll.en?.name || ll.slug
  llGroup.push(
    `    <g id="${ll.slug}">`,
    `      <title>${escapeXml(name)}</title>`,
    `      <path d="${d}" fill="${ll.colorDark}" stroke="${C.white}" stroke-opacity="0.7" stroke-width="1.2" stroke-linejoin="round"/>`,
    '    </g>'
  )
}
llGroup.push('  </g>')

const svg = (title, body) =>
  [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_W} ${SVG_H}" width="${SVG_W}" height="${SVG_H}">`,
    `  <title>${escapeXml(title)}</title>`,
    ...body,
    '</svg>',
    '',
  ].join('\n')

mkdirSync(outDir, { recursive: true })
const outputs = {
  'germany_background.svg': svg('Germany - federal states', statesGroup),
  'germany_living_labs.svg': svg('Germany - Living Lab regions', [...statesGroup, ...llGroup]),
}
for (const [file, content] of Object.entries(outputs)) {
  writeFileSync(join(outDir, file), content)
  console.log(`wrote ${relative(join(appDir, '..'), join(outDir, file))}`)
}
