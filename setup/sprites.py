from urllib.request import urlopen
from bs4 import BeautifulSoup
import os
import re
import requests

fish_url = 'https://animalcrossing.fandom.com/wiki/Fish_(New_Horizons)'
bugs_url = 'https://animalcrossing.fandom.com/wiki/Bugs_(New_Horizons)'

def find_images(url):
    html = urlopen(url)
    bs = BeautifulSoup(html, 'html.parser')
    images = bs.find_all('img', {'data-src':re.compile('NH-Icon-.*?.png')})
    return images

def download_images(url,path):
    if not os.path.exists(path):
        os.makedirs(path)
    images = find_images(url)
    for image in images:
        filename = image['data-image-key'].lower().replace('nh-icon-','')
        source = (image['data-src'].split('.png')[0]) + '.png'
        print(source)
        img_data = requests.get(source).content
        with open(path + filename, 'wb') as handler:
            handler.write(img_data)
            print(filename)


download_images(bugs_url,'sprites/bugs/')
download_images(fish_url,'sprites/fish/')
