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

-e, --extent
>sample extent: xmin,ymin,xmax,ymax

-f, --samplefile
>a geojson file with sample locations to use instead of generating a point grid

-h, --help
>display this help

EXAMPLES: 

>generated sample grid requires a cell size and extent:

    $ maptile-qc -t ~/my_tile_cache -o ~/temp/outputfile -c 0.05 -r 2,10 -e -122,36,-120,37

>sample loaded from a geojsonfile:

    $ maptile-qc -t ~/my_tile_cache -o ~/temp/outputfile -r 2,10 -f '~/samplepoints.geojson'
