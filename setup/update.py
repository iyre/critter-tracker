import json
import csv


infile='fish_south.txt'
outfile='fish.json'
data = {}

def add_creature(entry,index):
    id1 = entry[0].lower().replace(' ','_')
    months = []
    month_index = 1
    for a in entry[6:]:
        if int(a) == 1:
            months.append(month_index)
        month_index += 1

    print(entry[0])
    print(months)

    months.sort()
    data[id1]['southern'] = months

with open(outfile) as f:
    data = json.load(f)

with open(infile) as f:
    reader = csv.reader(f, delimiter='\t')
    index = 0
    for row in reader:
        if index == 0:
            index+=1
            continue
        print(row)
        add_creature(row,index)
        index+=1

def write_file():
    with open(outfile, 'w') as f:
        json.dump(data, f, indent=4, sort_keys=True)

print(json.dumps(data,indent=4))

write_file()