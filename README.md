# maptile-qc
A little node tool to check a tile cache for missing or invalid tiles


Requirements
=============

* ImageMagick (this is dependency for the nodejs module gm http://aheckmann.github.io/gm/)

Usage
=======

Generates a csv and geojson file reporting details about a tile cache at sampled locations and specified zoom levels.

-t, --tilecache   
>tile cache directory

-o, --outputfile
>outputfile without extension

-c, --cellsize   
>distance between sample points in sample grid

-r, --zoomrange
>comma delimited range of zoom levels to sample e.g. "2,10" (no spaces)

-h, --help
>display this help

EXAMPLE: 

        $ maptile-qc -t /home/me/my_tile_cache -o /home/me/temp/outputfile -c 0.05 -r 2,10 -e -122,36,-120,37