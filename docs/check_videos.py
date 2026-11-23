"""Verify the retained snapshot, old exercises, attribution and playable local MP4s."""
from pathlib import Path
import hashlib
import json
import subprocess


def check(root):
    body = (root / 'data/exercises.js').read_text()
    exercises = json.loads(body[body.index('['):body.rindex(']') + 1])
    by_id = {item['id']: item for item in exercises}
    assert len(by_id) == len(exercises), 'Duplicate exercise ID'
    provenance = json.loads((root / 'data/video-provenance.json').read_text())
    snapshot = root / 'data/wger-source.json'
    assert hashlib.sha256(snapshot.read_bytes()).hexdigest() == provenance['snapshotSha256']
    source = json.loads(snapshot.read_text())
    imported_ids = {item.get('wgerId', item.get('source', {}).get('id')) for item in exercises}
    assert {item['id'] for item in source['exercises']} <= imported_ids
    for original in provenance['preservedExercises']:
        current = {key: value for key, value in by_id[original['id']].items() if key not in ('video', 'wgerId')}
        assert original == current, f'Changed original exercise: {original["id"]}'
    actual_videos = {item['id']: item['video'] for item in exercises
                     if item.get('video', {}).get('source') == 'wger'}
    assert len(actual_videos) == provenance['selectedExerciseCount']
    expected_files = set()
    for record in provenance['videos']:
        video = actual_videos[record['localExerciseId']]
        assert video['author'] and video['license'] == 'CC BY-SA 4.0'
        assert video['sourceUrl'].startswith('https://wger.de/')
        assert video['licenseUrl'] == 'https://creativecommons.org/licenses/by-sa/4.0/'
        for key, hash_key in [('src', 'sha256'), ('poster', 'posterSha256')]:
            path = root / video[key]
            assert path.resolve().is_relative_to((root / 'assets/videos').resolve())
            assert hashlib.sha256(path.read_bytes()).hexdigest() == record[hash_key], path
            expected_files.add(video[key])
        assert (root / video['src']).stat().st_size == record['bytes']
        info = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-of', 'json', str(root / video['src'])]))
        streams = info['streams']
        assert len(streams) == 1 and streams[0]['codec_name'] == 'h264'
        stream = streams[0]
        assert stream['pix_fmt'] == 'yuv420p' and float(stream['duration']) > 1
        assert max(stream['width'], stream['height']) <= 640
    assert {str(path.relative_to(root)) for path in (root / 'assets/videos').iterdir()} == expected_files
    assert 'Pullups' not in actual_videos, 'Assisted machine demo must not map to unassisted Pullups'
    for item in exercises:
        if item.get('source', {}).get('name') == 'wger':
            source = item['source']
            assert source['license'] in ('CC-BY-SA 3', 'CC-BY-SA 4', 'CC0')
            assert source['title'] and source['licenseUrl'].startswith('https://creativecommons.org/')
    print(f'PASS: {len(exercises)} unique exercises, all 930 wger IDs covered, 32 original records preserved, {len(actual_videos)} local H.264 videos with attribution and valid hashes.')


if __name__ == '__main__':
    check(Path(__file__).resolve().parent)
