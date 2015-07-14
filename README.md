# maptile-qc
A little node tool to check a tile cache for missing or invalid tiles


Requirements
=============

* ImageMagick (this is dependency for the nodejs module gm http://aheckmann.github.io/gm/)

Usage
=======

Generates a csv and geojson file reporting details about a tile cache at sampled locations and specified zoom levels. The output file name will have the csv and geojson extensions added to it. Don't use the name of an existing file in the output directory as any csv or geojson files with that name will be over-written. (I will change this soon)

-t, --tilecache   
>tile cache directory

-o, --outputfile
>outputfile without extension

-l, --locations   
>number of locations to sample

-r, --zoomrange
>comma delimited range of zoom levels to sample e.g. "2,10" (no spaces)

-h, --help
>display this help

EXAMPLE: 

        $ maptile-qc -t /home/me/my_tile_cache -o /home/me/temp/outputfile -l 20 -r 2,10 

