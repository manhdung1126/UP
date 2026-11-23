"""Rebuild the local catalogue from the retained wger snapshot; no network calls."""
from html.parser import HTMLParser
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
# Reviewed equivalent movements. Keep UP IDs, names, instructions and models.
MERGES = {
    73: 'Barbell_Bench_Press_-_Medium_Grip', 75: 'Dumbbell_Bench_Press',
    538: 'Barbell_Incline_Bench_Press_-_Medium_Grip', 83: 'Bent_Over_Barbell_Row',
    475: 'Pullups', 567: 'Dumbbell_Shoulder_Press', 348: 'Side_Lateral_Raise',
    222: 'Face_Pull', 92: 'Dumbbell_Bicep_Curl', 272: 'Hammer_Curls',
    91: 'Barbell_Curl', 76: 'Close-Grip_Barbell_Bench_Press',
    659: 'Triceps_Pushdown_-_Rope_Attachment', 660: 'Triceps_Pushdown',
    615: 'Barbell_Squat', 371: 'Leg_Press', 507: 'Romanian_Deadlift',
    365: 'Lying_Leg_Curls', 622: 'Standing_Calf_Raises', 167: 'Crunches',
    283: 'Hanging_Leg_Raise', 1551: 'Pushups', 1117: 'Seated_Cable_Rows',
}
MUSCLES = {1: 'biceps', 2: 'shoulders', 3: 'serratus', 4: 'chest',
           5: 'triceps', 6: 'abdominals', 7: 'calves', 8: 'glutes',
           9: 'traps', 10: 'quadriceps', 11: 'hamstrings', 12: 'lats',
           13: 'brachialis', 14: 'obliques', 15: 'calves'}
EQUIPMENT = {'Barbell': 'barbell', 'Dumbbell': 'dumbbell', 'Cable machine': 'cable',
             'none (bodyweight exercise)': 'body only', 'Bench': 'bench',
             'Incline bench': 'incline bench', 'Gym mat': 'mat',
             'Kettlebell': 'kettlebell', 'Pull-up bar': 'pull-up bar',
             'Resistance band': 'band', 'SZ-Bar': 'ez bar', 'Swiss Ball': 'ball'}
# The source says bodyweight here; the reviewed video visibly uses a barbell.
EQUIPMENT_CORRECTIONS = {570: ['barbell']}


class PlainSteps(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)

    def handle_starttag(self, tag, attrs):
        if tag in ('p', 'li', 'br', 'h2', 'h3', 'h4'):
            self.parts.append('\n')

    def handle_endtag(self, tag):
        if tag in ('p', 'li', 'h2', 'h3', 'h4'):
            self.parts.append('\n')


def rebuild():
    file = ROOT / 'data/exercises.js'
    body = file.read_text()
    existing = json.loads(body[body.index('['):body.rindex(']') + 1])
    base = [item for item in existing if not item['id'].startswith('WGER_')]
    for item in base:
        item.pop('wgerId', None)
        if item.get('video', {}).get('source') == 'wger':
            item.pop('video')
    by_id = {item['id']: item for item in base}
    source = json.loads((ROOT / 'data/wger-source.json').read_text())
    provenance = json.loads((ROOT / 'data/video-provenance.json').read_text())
    videos = {item['exerciseId']: item for item in provenance['videos']}
    licenses = {item['id']: item for item in source['licenses']}
    result = list(base)
    for raw in source['exercises']:
        english = raw['translation']
        assert english['language'] == 2 and english['name'].strip()
        license = licenses[english['license']]
        assert english['license'] in (1, 2, 3), 'Unreviewed data license'
        url = f'https://wger.de/en/exercise/{raw["id"]}/view/'
        attribution = {'name': 'wger', 'url': url, 'id': raw['id'],
                       'author': english['license_author'],
                       'authors': english['author_history'],
                       'title': english['license_title'] or english['name'],
                       'originalUrl': english['license_object_url'],
                       'license': license['short_name'],
                       'licenseUrl': license['url'].replace('http:', 'https:')}
        target = by_id.get(MERGES.get(raw['id']))
        if target is None:
            parser = PlainSteps()
            parser.feed(english['description'])
            equipment = EQUIPMENT_CORRECTIONS.get(raw['id'], list(dict.fromkeys(EQUIPMENT[item['name']] for item in raw['equipment'])))
            target = {'id': f'WGER_{raw["id"]}', 'name': english['name'],
                      'level': '', 'equipment': equipment[0] if equipment else 'unspecified',
                      'equipmentList': equipment,
                      'primaryMuscles': list(dict.fromkeys(MUSCLES[item['id']] for item in raw['muscles'])),
                      'secondaryMuscles': list(dict.fromkeys(MUSCLES[item['id']] for item in raw['muscles_secondary'])),
                      'instructions': [line.strip() for line in ''.join(parser.parts).splitlines() if line.strip()],
                      'images': [], 'source': attribution}
            result.append(target)
        else:
            target['wgerId'] = raw['id']
        if raw['id'] in videos:
            video = videos[raw['id']]
            original = video['original']
            assert original['license'] == 2 and original['license_author']
            target['video'] = {'src': video['src'], 'poster': video['poster'],
                               'source': 'wger', 'sourceUrl': url,
                               'title': original['license_title'] or english['name'],
                               'author': original['license_author'],
                               'license': 'CC BY-SA 4.0',
                               'licenseUrl': 'https://creativecommons.org/licenses/by-sa/4.0/',
                               'changes': 'Converted to 640px H.264 MP4, 24fps; audio removed. Poster extracted.'}
            video['localExerciseId'] = target['id']
    ids = [item['id'] for item in result]
    assert len(ids) == len(set(ids))
    file.write_text('const EXERCISES = ' + json.dumps(result, ensure_ascii=False, indent=2) + ';\n')
    (ROOT / 'data/video-provenance.json').write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + '\n')
    print(f'Imported {len(source["exercises"])} wger entries; {len(result)} total; {len(videos)} video exercises.')


if __name__ == '__main__':
    rebuild()
