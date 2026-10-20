#!/usr/bin/env python3
"""GA World Top 100 publication preflight. Only standard library, read-only."""
import csv
import datetime as dt
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT=Path(__file__).resolve().parent
COLUMNS='record_id,athlete_id,athlete,gender,country,age,event,event_spec,venue_type,mark,wind,timing,meet,date,team,source_name,source_url,permission_status,age_verified,record_status,notes'.split(',')
TECHNICAL={'55m Hurdles','60m Hurdles','80m Hurdles','100m Hurdles','110m Hurdles','200m Hurdles','300m Hurdles','400m Hurdles','Shot Put','Discus Throw','Javelin Throw','Turbo Javelin','Mini Javelin','Hammer Throw','Weight Throw','Softball Throw','Shuttle Hurdle Relay','Triathlon','Tetrathlon','Pentathlon','Hexathlon','Heptathlon','Octathlon','Decathlon'}
FIELD={'Long Jump','Triple Jump','High Jump','Pole Vault','Standing Long Jump','Shot Put','Discus Throw','Javelin Throw','Turbo Javelin','Mini Javelin','Hammer Throw','Weight Throw','Softball Throw'}
COMBINED={'Triathlon','Tetrathlon','Pentathlon','Hexathlon','Heptathlon','Octathlon','Decathlon'}
WIND={'100m','200m','80m Hurdles','100m Hurdles','110m Hurdles','Long Jump','Triple Jump'}
SHORT_SPRINT={'40m','50m','55m','60m','80m','100m','150m','200m','55m Hurdles','60m Hurdles','80m Hurdles','100m Hurdles','110m Hurdles','200m Hurdles','300m Hurdles','400m Hurdles'}

def parse_time(s):
    pieces=s.split(':')
    if len(pieces)>3 or any(not re.fullmatch(r'\d+(\.\d+)?',t) for t in pieces):return None
    out=0
    for piece in pieces:out=out*60+float(piece)
    return out

def validate(path):
    events={ev for group in json.loads((ROOT/'world-events.json').read_text('utf-8')) for ev in group['events']}
    errors=[];warnings=[];count=0;accepted=0;ids=set();years=set();countries=set();ages=set();seen=set()
    with open(path,encoding='utf-8-sig',newline='') as f:
        rd=csv.DictReader(f)
        if not rd.fieldnames or rd.fieldnames!=COLUMNS:
            errors.append('HEADER: Expected exactly the 21 fields documented in README-WORLD-TOP-100.md in order.');
            return count,accepted,errors,warnings,years,countries,ages
        for line,r in enumerate(rd,start=2):
            if not any((v or '').strip() for v in r.values()):continue
            count+=1;r={k:(v or '').strip() for k,v in r.items()}; err=lambda detail:errors.append(f'Row {line}: {detail}');warn=lambda detail:warnings.append(f'Row {line}: {detail}')
            rid=r['record_id']
            if not rid:err('record_id required')
            elif rid in ids:err('duplicate record_id '+rid)
            ids.add(rid)
            if not r['athlete']:err('athlete / squad name required')
            if r['gender'] not in ('Girls','Boys'):err('gender must be Girls or Boys')
            if not re.fullmatch('[A-Z]{2,3}',r['country']):err('country must be 2–3 uppercase letters')
            try:age=int(r['age']);assert 7<=age<=18;ages.add(age)
            except (ValueError,AssertionError):err('age must be integer 7–18')
            if r['event'] not in events:err('event missing or not in world-events.json')
            if r['event'] in TECHNICAL and (not r['event_spec'] or r['event_spec'].lower()=='standard'):err('exact event_spec needed for hurdle height / implement weight / relay hurdle specification / combined-event program')
            if r['event'].endswith('Relay') and not r['athlete_id']:err('relay results require stable team/squad athlete_id')
            if r['venue_type'] not in ('Indoor','Outdoor','Road','Cross Country'):err('venue_type must be Outdoor, Indoor, Road, Cross Country')
            if r['timing'] and r['timing'] not in ('FAT','Hand','Transponder','Not Applicable'):err('unsupported timing label')
            if r['event'] in SHORT_SPRINT and r['timing']!='FAT':err('short sprint/hurdle marks must be FAT to prevent mixing hand-timed marks')
            mark=r['mark']
            if r['event'] in FIELD and not re.fullmatch(r'\d+(\.\d+)?',mark):err('field mark must be decimal meters')
            elif r['event'] in COMBINED and not re.fullmatch(r'\d+',mark):err('combined event mark must be integer points')
            elif r['event'] not in FIELD|COMBINED and parse_time(mark) is None:err('running/racewalk mark must be seconds or mm:ss.hh or h:mm:ss.hh')
            if not r['meet'] or not r['source_name']:err('meet and source_name required')
            p=urlparse(r['source_url'])
            if p.scheme!='https' or not p.netloc:err('HTTPS source_url required')
            if r['permission_status'].lower() not in ('approved','licensed','owned'):err('permission_status must confirm authorized reuse')
            if r['age_verified'].lower()!='yes':err('age_verified=yes required after offline birth-year check')
            if r['record_status'].lower()!='verified':err('record_status=verified required after source review')
            if r['wind']:
                try:w=float(r['wind']);assert -15<=w<=15
                except (ValueError,AssertionError):err('wind must be plausible m/s value between -15 and +15')
            elif r['event'] in WIND and r['venue_type']=='Outdoor':warn('no wind reading — will be hidden by default in wind-legal view')
            try:
                day=dt.date.fromisoformat(r['date']);years.add(day.year)
                if day>dt.date.today():warn('future date: cross-check meet results')
            except ValueError:err('date must be real YYYY-MM-DD')
            key=(r['athlete_id'] or r['athlete'].lower(),r['gender'],r['age'],r['event'],r['event_spec'],r['date'],r['mark'])
            if key in seen:warn('possible duplicate performance')
            seen.add(key)
            if r['notes'] and re.search(r'\b(?:DOB|birthday|born|phone|email|address|diagnosis)\b',r['notes'],re.I):warn('notes may include minor-sensitive data; remove before publication')
            if r['country']:countries.add(r['country'])
            accepted+=1
    return count,accepted,errors,warnings,years,countries,ages

if __name__=='__main__':
    data=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT/'world-rankings-data.csv'
    result=validate(data)
    count,accepted,errors,warnings,years,countries,ages=result
    print('GA WORLD TOP 100 — DATA PREPUBLICATION CHECK')
    print('Rows:',count,'| Years:',','.join(map(str,sorted(years))) or 'none','| Countries:',len(countries),'| Ages:',','.join(map(str,sorted(ages))) or 'none')
    if not count:print('EMPTY WORLD DATASET: ranking UI built; no world Top 100 claims can be made yet.')
    for item in warnings:print('WARNING:',item)
    for item in errors:print('ERROR:',item)
    print('PASS' if not errors else f'FAIL — {len(errors)} errors')
    sys.exit(1 if errors else 0)
