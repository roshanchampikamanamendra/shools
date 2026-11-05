# Schools of Sri Lanka
Cartography by Roshan. An interactive school-location map built with GeoLibre 3.6.1.

## GitHub Pages
Extract this ZIP and commit the contents at the root of your publishing branch. Choose Settings → Pages → Deploy from a branch and select that branch and /(root). Serve over HTTP for a local preview.

## Map and data
Source: [Sri Lanka NSDI, Educational Institutions](https://gisapps.nsdi.gov.lk/server/rest/services/Srilanka/Society_Health/MapServer/2). Retrieved 5 November 2026. The source returned 10,155 records. Seven lacked usable point coordinates, leaving 10,148 mapped records (9,775 provincial and 373 national). Counts describe records in this dataset.

Occupied H3 hexagons show school counts. Zoom levels below 8 use resolution 5; the map switches to resolution 6 at zoom 8 and resolution 7 at 9.7. At 11.3 it shows individual school locations. The chart counts school points inside the current map extent. The map and the downloadable GeoLibre project contain the same records.

This package includes the read-only GeoLibre viewer components needed for this map. The detailed basemap uses CARTO and OpenStreetMap online. The alternative rendering path uses the same GeoLibre project with MapLibre GL JS, Natural Earth context land and simplified Sri Lanka boundaries from the Survey Department/OCHA via HDX and geoBoundaries (CC BY 3.0 IGO). Library licences are included.
