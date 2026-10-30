# Graph Report - Nestle  (2026-10-27)

## Corpus Check
- 64 files · ~19,803 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 45 file(s) not represented in the graph (top: .xml 11, .gltf 11, (none) 6)

## Summary
- 440 nodes · 719 edges · 29 communities (15 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0f76d060`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- home.js
- startMessages
- private-home.sql
- package.json
- .application
- build-original-avatars.py
- ref_node_fs
- app.js
- app-quaternius.js
- ExampleInstrumentedTest.java
- manifest.json
- index.ts
- MainActivity.java
- Package.swift
- Design System: Nestle
- Nestle on Android and iPhone
- Nestle
- Private two-profile home
- AGENTS.md
- CapApp-SPM/README.md

## God Nodes (most connected - your core abstractions)
1. `startMessages()` - 25 edges
2. `MessageStore` - 13 edges
3. `startConnected()` - 12 edges
4. `render()` - 12 edges
5. `public.nestle_messages` - 10 edges
6. `public.nestle_profile_devices` - 10 edges
7. `AppDelegate` - 10 edges
8. `SharedHome` - 9 edges
9. `Design System: Nestle` - 9 edges
10. `changeMoment()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `refreshShared()` --calls--> `createCharacterState()`  [EXTRACTED]
  public/home.js → public/character-state.mjs
- `setUpCharacter()` --calls--> `createCharacterState()`  [EXTRACTED]
  public/home.js → public/character-state.mjs
- `syncClock()` --calls--> `getRoomCycle()`  [EXTRACTED]
  public/home.js → public/room-time.mjs
- `startConnected()` --calls--> `startMessages()`  [EXTRACTED]
  public/home.js → public/messages.mjs
- `public.send_nestle_media_message()` --writes_to--> `public.nestle_messages`  [EXTRACTED]
  backend/chat-media.sql → backend/messages.sql

## Import Cycles
- None detected.

## Communities (29 total, 14 thin omitted)

### Community 0 - "home.js"
Cohesion: 0.08
Nodes (45): expressionLabel(), boot(), changeMoment(), characterAsset(), chooseExpression(), connectChoice(), currentMoods(), home (+37 more)

### Community 1 - "startMessages"
Cohesion: 0.10
Nodes (26): inspectImage(), mediaLimit, showMedia(), uploadImage(), validMediaPath(), checked(), mergeMessage(), messageLimit (+18 more)

### Community 2 - "private-home.sql"
Cohesion: 0.08
Nodes (29): public.nestle_push_devices, public.send_nestle_media_message(), nestle_private.push_jobs, nestle_private.queue_chat_push(), public.nestle_push_jobs(), push_jobs_user_idx, queue_chat_push, nestle_private.retry_chat_push() (+21 more)

### Community 3 - "package.json"
Cohesion: 0.06
Nodes (37): author, dependencies, @capacitor/android@8.5.3, @capacitor/core@8.5.3, @capacitor-firebase/messaging@8.5.2, @capacitor/ios@8.5.3, @supabase/supabase-js@2.118.0, three@0.180.0 (+29 more)

### Community 4 - ".application"
Cohesion: 0.07
Nodes (4): Capacitor, AppDelegate, SceneDelegate, UIKit

### Community 5 - "build-original-avatars.py"
Cohesion: 0.11
Nodes (11): arm_weights(), blend(), body_weights(), cap(), ell(), face_y(), finish(), hair_lock() (+3 more)

### Community 6 - "ref_node_fs"
Cohesion: 0.10
Nodes (10): characterIds, createCharacterState(), expressions, getRoomCycle(), esbuild, root, target, mime (+2 more)

### Community 7 - "app.js"
Cohesion: 0.11
Nodes (27): accentMaterials, assetCache, box(), buildPerson(), buildVersions, changePerson(), characters, countVisibleMeshes() (+19 more)

### Community 8 - "app-quaternius.js"
Cohesion: 0.11
Nodes (26): accentMaterials, assetCache, box(), buildPerson(), buildVersions, changePerson(), characters, countVisibleMeshes() (+18 more)

### Community 10 - "manifest.json"
Cohesion: 0.17
Nodes (11): animations, asset, expressions, hair, notes, original, outfits, revision (+3 more)

### Community 11 - "index.ts"
Cohesion: 0.40
Nodes (3): base64(), cors, googleToken()

### Community 23 - "Design System: Nestle"
Cohesion: 0.10
Nodes (20): Colors, Components, Design System: Nestle, Do:, Do's and Don'ts, Don't:, Elevation & Depth, Fixed profiles and shared expressions (+12 more)

### Community 24 - "Nestle on Android and iPhone"
Cohesion: 0.14
Nodes (12): Activate device notifications, Chat, Nestle on Android and iPhone, Prepare native projects, Server behavior, Validation, Connect your devices, Implementation and checks (+4 more)

### Community 25 - "Nestle"
Cohesion: 0.33
Nodes (5): Home experience, Identity and shared home, Nestle, Private conversation, Scope and validation

### Community 26 - "Private two-profile home"
Cohesion: 0.40
Nodes (4): Current connection flow: choose a name, Media and native notifications, Messages, Private two-profile home

## Knowledge Gaps
- **1 isolated node(s):** `PackageDescription`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 181 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `three` connect `package.json` to `app-quaternius.js`, `ref_node_fs`, `app.js`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `startConnected()` (e.g. with `.advance()` and `.read()`) actually correct?**
  _`startConnected()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `PackageDescription` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `home.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0777323202805377 - nodes in this community are weakly interconnected._
- **Why does `startMessages()` connect `startMessages` to `home.js`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Should `startMessages` be split into smaller, more focused modules?**
  _Cohesion score 0.10017730496453901 - nodes in this community are weakly interconnected._
- **Why does `esbuild` connect `ref_node_fs` to `package.json`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._