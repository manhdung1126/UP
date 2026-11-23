# Exercise library sources

Imported 2026-10-29 from [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db).

- Commit: `f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5`
- Dataset: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/dist/exercises.json`
- Source SHA-256: `5bb747e3fc658f095a60dcbf6d53c96627acdcc6ffb6fffde86f7e26995d40bf`
- Selection: 24 strength exercises from 876 source records, 48 JPEG images. This is a sample library, not a complete catalogue.
- Original IDs, English names, muscles, equipment, instructions and other metadata are retained. Only image paths change to local `assets/exercises/`.
- `data/exercises.js` wraps the selected JSON array in a constant so opening index.html directly still works without fetch or a build step.
- Images are downloaded unchanged from `exercises/<exercise-id>/<0 or 1>.jpg` at the same commit. No runtime hotlinking or paid API.
- The upstream repository publishes Unlicense; its text is retained in `data/LICENSE-free-exercise-db.txt`. Upstream credits wrkout/exercises.json. This records the upstream license claim, not an independent audit of each image's provenance.
- The sample workout numbers are UP demo data, not recommendations from the dataset and not the user's previous results. New exercises and sets start blank.

## Interactive 3D — 2026-10-29

- One supported exercise: existing `Pushups` ID maps to OpenGym3D `push_up` (same bodyweight movement). Other 23 exercises have no 3D mapping; the UI states this explicitly. Their photos are no longer used as exercise media in the UI. Previous local photos are retained unchanged.
- Original GLB: https://assiamahs.github.io/opengym3d/assets/push_up.glb (5,957,800 bytes), downloaded unchanged to `assets/models/pushups.glb`.
- SHA-256: `67bfd1bf9c9c679dfd81f34202c661f954ce0ec4b15baac56a5781a372d11326`.
- Source code/provenance snapshot: https://github.com/AssiamahS/opengym3d/tree/ea3a60130fdcfb3c4771e44d09f84ebab4ee9bae. Deployed binary is content-pinned by hash; it is not claimed to be reproducibly built from that commit.
- `data/model3d-provenance.json` retains the live manifest entry and relevant asset-library entries. Upstream declares the MakeHuman/MPFB2 generated character CC0-1.0 and the Mesh2Motion/Quaternius Pushup motion CC0-1.0. The repo code is MIT (retained in `data/LICENSE-OpenGym3D.txt`). No Mixamo, video-demo, or paid-pack models imported. This documents upstream provenance; it is not an independent motion-capture or coaching certification.
- GLB has a skeleton animation `Human.rig` and a morph-weight animation `Human`; both are played together. It is an interactive mesh with animation, not an MP4 or an image sequence. Upstream published QA reported zero failures for this model at retrieval.
- Viewer: Google `<model-viewer>` 4.1.0, locally vendored from https://cdn.jsdelivr.net/npm/@google/model-viewer@4.1.0/dist/model-viewer.min.js. Apache-2.0 license in `vendor/LICENSE-model-viewer.txt`; third-party license notices remain in the unmodified bundle. Component owns WebGL/camera/touch behavior. No runtime CDN or API key needed.
- 3D requires an HTTP(S) preview and WebGL. Direct file opening still works for the basic app, but the viewer gives an error/recovery message if local module/model loading is blocked.

## Free model expansion — 2026-10-30

The current library has 32 exercises and 10 interactive moving models: 2/24 original records supported, plus 8 separately named bodyweight/cardio exercises. See MODEL-COVERAGE.md for the accepted and rejected candidate list. The preceding 2026-10-29 section records the initial single-model milestone, not current coverage.

- Five live CC0 binaries: push_up, jog, jumping_jack, run, walk. Their character and Mesh2Motion/Quaternius motion provenance come from the upstream asset library. The deployed manifest's non-critical QA warnings are retained in per-model sourceEntry; visual checks are not a certification of biomechanics.
- Five original MIT v1 pose-pack binaries: calf_raise, crunch, high_knees, squat, superman. Public original archive: https://raw.githubusercontent.com/AssiamahS/opengym3d/ea3a60130fdcfb3c4771e44d09f84ebab4ee9bae/dist/opengym3d-exercise-pack-v1.zip. Archive LICENSE is the same MIT copyright and terms retained in data/LICENSE-OpenGym3D.txt. Generated MPFB2 body is declared CC0 by upstream; the pose animations are authored by the repository owner. These are keyframed animations, not claimed to be motion capture.
- All 10 GLBs remain byte-for-byte unchanged; SHA256, bytes, original URL/archive member, clip names, duration and framing bounds are retained per model in data/model3d-provenance.json.
- Candidate decisions for all CC0 live models and all 24 v1 pack entries are in data/3d-coverage-audit.json. Duplicated Push-Up/Jumping Jack pack versions are not imported. Missing-equipment models, visibly unsuitable poses and the nearly static meditation pose are not shipped.
- New names Walk in Place and Run in Place describe the visible movement without implying a treadmill asset. Bodyweight Calf Raise is distinct from the original machine exercise. Existing 24 IDs and English names remain unchanged.
- Models total about 43.1 MB on disk; only the opened model loads at runtime, with one viewer and modelCacheSize=1. No API charges or runtime CDN. Session remains in-memory.

## Free wger catalogue and local video — 2026-11-04

- Public source: https://wger.de/api/v2/exerciseinfo/?limit=1000&format=json and https://wger.de/api/v2/video/?limit=1000&format=json. Full pagination verified: 930 exercise records and 78 videos, neither response has a next page. All 930 exercise records contain an English translation (language 2); source names are kept.
- The English snapshot in `data/wger-source.json` preserves source descriptions, classifications, public author names and per-record licenses. Author entries consisting of an email address were removed from the snapshot and catalogue. The linked wger exercise remains the source for full credits. `data/video-provenance.json` records hashes for the original and public snapshots. The app renders descriptions as plain text.
- 23 explicitly reviewed equivalent exercise mappings retain the existing UP IDs/names/instructions; all other imported IDs are namespaced WGER_. The catalogue contains 939 entries including the 32 preserved UP records. The wger entries include overlapping variants and custom community names; 939 is a record count, not a claim of 939 unique biomechanical movements.
- wger English text licenses in this snapshot: 782 CC BY-SA 4.0, 128 CC BY-SA 3.0, 20 CC0. Each new record keeps its title, source link and license URI. Transformations: English translation selected, HTML converted to plain text, muscle and equipment values mapped to UP terms. Adapted wger material remains under its source license.
- All 78 source video objects declare CC BY-SA 4.0 and author Goulart. One smallest video per source exercise selected initially (46 exercises). The Pull-ups (475) binary is identical to Pull Ups on Machine (477); 475 is rejected to avoid mapping the assisted-machine demonstration to UP's unassisted Pullups record. Final import: 45 local video demonstrations, one per supported exercise. This is not a claim that every catalogue entry has video.
- Originals converted to H.264, yuv420p, maximum 640px on either side, 24fps, MP4 faststart, audio removed. JPEG posters extracted at 1s except Incline Bench Press - Barbell (538), extracted at 9s because the opening frame shows the floor. Both derivatives retain CC BY-SA 4.0. Each video has visible title, author, original exercise link, license link and change notice in the player. Original URL, authorship fields and hashes are retained in data/video-provenance.json.
- Source equipment for Shoulder Shrug (570) says bodyweight; the reviewed footage visibly contains a barbell. Runtime equipment corrected to barbell in import_wger.py. Other absent source metadata remains explicitly unknown. Still-frame review confirms exercise/equipment presentation; this is not a biomechanics or coaching certification.
- No runtime API key, subscription, media hotlink or external request is needed. Video is loaded only when opened; native controls are used, autoplay disabled, and closing removes the media source. The app stores no personal records beyond its existing in-memory demonstration session.
- Wikimedia Commons Bench Press was checked (FitnessScape, CC BY 3.0), but its file download returned HTTP 403 in this environment. No Commons video is included; wger supplies the Bench Press demonstration. No Hevy or GymVisual asset was copied.
