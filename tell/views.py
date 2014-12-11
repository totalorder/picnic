from datetime import datetime
import os
from django.conf import settings
from django.shortcuts import render
import json

base_url = "http://localhost/"

CATALOG = None
FILES_URL = "".join((settings.STATIC_URL, "files/"))

def getCatalog():
    global CATALOG
    if CATALOG is None:
        with open("files/catalog.json", "r") as f:
            CATALOG = json.load(f)
            for album in CATALOG.values():
                album['date'] = datetime.fromtimestamp(album['date'])
                for photo in album['photos']:
                    photo['date'] = datetime.fromtimestamp(photo['date'])

                album['photos'].sort(key=lambda x: x['date'])
    return CATALOG


def index(request):
    catalog = getCatalog()
    ctx = {"FILES_URL": FILES_URL, "albums": [catalog[album_name] for album_name in sorted(catalog.keys(),
                                                                   key=lambda x: catalog[x]['date'])]}
    return render(request, "index.html", ctx)