"""Kiểm tra thư viện và các file model bằng Python chuẩn, không cần cài gói."""
from pathlib import Path
import hashlib
import json
import struct


def check(root):
    source = (root / 'data/exercises.js').read_text()
    exercises = json.loads(source[source.index('['):source.rindex(']') + 1])
    provenance = json.loads((root / 'data/model3d-provenance.json').read_text())
    ids = [item['id'] for item in exercises]
    assert len(ids) == len(set(ids)), 'Exercise IDs must be unique'
    assert set(provenance['originalExerciseIds']) <= set(ids), 'Original exercise missing'
    mapped = {item['id']: item['model3d'] for item in exercises if item.get('model3d')}
    records = {item['exerciseId']: item for item in provenance['models']}
    assert set(mapped) == set(records), 'Model mapping and provenance disagree'
    for exercise_id, model in mapped.items():
        path = root / model['src']
        assert path.resolve().is_relative_to((root / 'assets/models').resolve())
        body = path.read_bytes()
        assert struct.unpack_from('<4sII', body) == (b'glTF', 2, len(body)), path
        json_size, chunk_type = struct.unpack_from('<II', body, 12)
        assert chunk_type == 0x4E4F534A, path
        document = json.loads(body[20:20 + json_size])
        assert document.get('meshes') and document.get('skins'), path
        assert all('uri' not in buffer for buffer in document['buffers']), path
        clips = {clip['name'] for clip in document['animations']}
        assert model['animations'] and set(model['animations']) <= clips, path
        record = records[exercise_id]
        assert record['localPath'] == model['src']
        assert record['bytes'] == len(body)
        assert record['sha256'] == hashlib.sha256(body).hexdigest(), path
    actual = {str(path.relative_to(root)) for path in (root / 'assets/models').glob('*.glb')}
    assert actual == {model['src'] for model in mapped.values()}, 'Untracked or missing model'
    print(f'PASS: {len(exercises)} unique exercises; {len(mapped)} local GLBs, clips and hashes valid.')


if __name__ == '__main__':
    check(Path(__file__).resolve().parent)
