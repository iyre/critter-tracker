#!/usr/bin/python3
# -*- coding: UTF-8 -*-

import argparse
import json
import csv
import re
import datetime
import requests
import pandas as pd
from bs4 import BeautifulSoup
from lxml import html


fish_url = 'https://animalcrossing.fandom.com/wiki/Fish_(New_Horizons)'
bugs_url = 'https://animalcrossing.fandom.com/wiki/Bugs_(New_Horizons)'
out_file = 'critters.json'
data = []

def get_table(url):
    r = requests.get(url)
    soup = BeautifulSoup(r.content, features="lxml")
    tbl = soup.find_all('table')
    for table in tbl:
        df = pd.read_html(str(table))[0]
        if df.shape[0] == 80:
            return df
    raise Exception("Didn't find any tables with a length of 80.")

def add_critter(critter_type,critter,index):
    critter_id = re.sub(r'[^a-z]+', '', critter['Name'].lower())
    months_north = parse_months(critter)
    months_south = convert_months(months_north)
    hours = parse_hours(critter['Time'])
    entry = {}
    entry['id'] = critter_id
    entry['index'] = index
    entry['type'] = critter_type
    entry['name'] = critter['Name']
    entry['image'] = ''
    entry['price'] = critter['Price']
    entry['location'] = critter['Location']
    entry['size'] = critter['Shadow size'] if critter_type == 'fish' else ''
    entry['hours'] = hours
    entry['northern'] = months_north
    entry['southern'] = months_south
    data.append(entry)

def parse_months(critter):
    months = []
    month_index = 0
    for month in critter['Jan':]:
        if month == '✓':
            months.append(month_index)
        month_index += 1
    months.sort()
    return months

def convert_months(months_north):
    months_south = []
    for month in months_north:
        #need months from 0-index, but datetime expects 1-indexed
        date = datetime.datetime(1900,month+1,1) + datetime.timedelta(days=32*6)
        months_south.append(date.month-1)
    months_south.sort()
    return months_south

def parse_hours(hour_str):
    hours = []
    if hour_str == 'All day':
        hours = [*range(0,24)]
    else:
        parsed = re.findall(r'\d+ [A-Z]+',hour_str)
        parsed_hours = []
        for hour in parsed:
            time = datetime.datetime.strptime(hour, '%I %p')
            parsed_hours.append(time.hour)
        for i in range(len(parsed_hours)):
            if i % 2 == 0:
                hours += list_hours(parsed_hours[i],parsed_hours[i+1])
    hours.sort()
    return hours

def list_hours(start, end):
    hours = []
    hour = start
    while hour != end:
        hours.append(hour)
        hour = (hour+1) if (hour < 23) else 0
    return hours

def process(critter_type,action='direct'):
    url = bugs_url if critter_type == 'bugs' else fish_url
    df = None
    if action == 'from_csv':
        df = pd.read_csv(critter_type + '.csv')
    else:
        url = bugs_url if critter_type == 'bugs' else fish_url
        df = get_table(url)
    if action == 'to_csv':
        df.to_csv(critter_type + '.csv', index=False)
        return
    incorporate(critter_type,df)

def incorporate(critter_type,df):
    for index,critter in df.iterrows():
        add_critter(critter_type,critter,index)

def write_file():
    with open(out_file, 'w') as f:
        json.dump(data, f, indent=4, sort_keys=True)

def main():
    arg_parser = argparse.ArgumentParser()
    arg_parser.add_argument("--write", help="write results to csv", action="store_true")
    arg_parser.add_argument("--read", help="read input from csv", action="store_true")
    args = arg_parser.parse_args()

    if args.write:
        process('fish','to_csv')
        process('bugs','to_csv')
        return
    elif args.read:
        process('fish','from_csv')
        process('bugs','from_csv')
    else:
        process('fish')
        process('bugs')
    write_file()

main()
