from datetime import datetime
from urllib2 import urlopen
from django.shortcuts import render
import json

CATALOG_URL = "http://localhost:8001/catalog.json"

CATALOG = None
FILES_URL = CATALOG_URL[:CATALOG_URL.rindex("/") + 1]

def getCatalog():
    global CATALOG
    if CATALOG is None:
        response = urlopen(CATALOG_URL)
        CATALOG = json.load(response)
        for album in CATALOG.values():
            album['date'] = datetime.strptime(album['date'], "%Y-%m-%dT%H:%M:%S")
            for photo in album['photos']:
                photo['date'] = datetime.strptime(photo['date'], "%Y-%m-%dT%H:%M:%S")

            album['photos'].sort(key=lambda x: x['date'])
    return CATALOG


def index(request):
    catalog = getCatalog()
    ctx = {"FILES_URL": FILES_URL, "albums": [catalog[album_name] for album_name in sorted(catalog.keys(),
                                                                   key=lambda x: catalog[x]['date'])]}
    return render(request, "index.html", ctx)