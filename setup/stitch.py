#!/usr/bin/python3

import numpy as np
import PIL
from PIL import Image
import json

size = 128,128
sprites_dir = 'sprites'

def create_sprite_sheet(critter,count):
    paths = [f'{sprites_dir}/{critter}/{str(i).zfill(2)}.png' for i in range(count)]
    imgs = [Image.open(i).resize(size) for i in paths]
    imgs_arr = np.vstack(imgs)
    imgs_comb = PIL.Image.fromarray(imgs_arr)
    imgs_comb.save(f'{critter}.png')

def main():
    create_sprite_sheet('bugs',80)
    create_sprite_sheet('fish',80)
    create_sprite_sheet('creatures',40)

main()