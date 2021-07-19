#!/usr/bin/python3

# run with '--index' to name images with the critterpedia index number
# useful for getting things to sort properly for sprite sheet creation

from urllib.request import urlopen
from bs4 import BeautifulSoup
import os
import re
import requests
import json
import argparse

sprites_dir = 'sprites'
urls = {
    'bugs' : 'https://animalcrossing.fandom.com/wiki/Bugs_(New_Horizons)',
    'fish' : 'https://animalcrossing.fandom.com/wiki/Fish_(New_Horizons)',
    'creatures' : 'https://animalcrossing.fandom.com/wiki/Deep-sea_creatures_(New_Horizons)'
} 

# for finding index number by critter name
with open('critters.json') as f:
    critters_json = json.load(f)
critters={'fish':{},'bugs':{},'creatures':{}}
for i in critters_json:
    critters[i['type']].update({i['id']:i['index']})

def find_images(url):
    html = urlopen(url)
    bs = BeautifulSoup(html, 'html.parser')
    images = bs.find_all('img', {'data-src':re.compile('NH-Icon-.*?.png')})
    return images

def download_images(critter_type,use_index=False):
    if not os.path.exists(f'{sprites_dir}/{critter_type}'):
        os.makedirs(f'{sprites_dir}/{critter_type}')
    images = find_images(urls[critter_type])
    for image in images:
        filename = image['data-image-key'].lower().replace('nh-icon-','').replace('.png','')
        filename = re.sub(r'[^a-z]+', '', filename) #remove special characters
        if use_index:
            filename = str(critters[critter_type][filename]).zfill(2)
        source = (image['data-src'].split('.png')[0]) + '.png'
        print(source)
        img_data = requests.get(source).content
        with open(f'{sprites_dir}/{critter_type}/{filename}.png', 'wb') as handler:
            handler.write(img_data)
            print(f'{filename}.png')

def main():
    arg_parser = argparse.ArgumentParser()
    arg_parser.add_argument("--index", help="write results to csv", action="store_true")
    args = arg_parser.parse_args()

    if args.index:
        download_images('bugs',True) 
        download_images('fish',True)
        download_images('creatures',True)
        return
    else:
        download_images('bugs') 
        download_images('fish')
        download_images('creatures')

main()
