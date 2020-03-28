import json
import csv


infile='fish_north_time.txt'
outfile='fish.json'
data = {}

def add_creature(entry,index):
    id1 = entry[0].lower().replace(' ','_')
    months = []
    month_index = 0
    for a in entry[7:]:
        if int(a) == 1:
            months.append(month_index)
        month_index += 1

    hours = []
    hour = int(entry[5])
    stop = int(entry[6])
    while hour != stop:
        if hour == 24:
            hour = 0
        print('hour', hour)
        print('stop', stop)
        hours.append(hour)
        hour += 1
    print(entry[0])
    print(months)
    print(hours)
    hours.sort()
    months.sort()
    data[id1] = {
        'index': index,
        'name': entry[0],
        'image': '',
        'price': int(entry[2]),
        'location': entry[3],
        'size': entry[4],
        'hours': hours,
        'northern': months,
        'southern': []
    }

#with open(outfile) as f:
#    data = json.load(f)

with open(infile) as f:
    reader = csv.reader(f, delimiter='\t')
    index = 0
    for row in reader:
        if index==0:
            index+=1
            continue
        #print(row)
        add_creature(row,index)
        index+=1

def write_file():
    with open(outfile, 'w') as f:
        json.dump(data, f, indent=4, sort_keys=True)

#print(json.dumps(data,indent=4))

write_file()