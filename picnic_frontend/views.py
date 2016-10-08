from collections import defaultdict
from datetime import datetime
from urllib2 import urlopen
from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render
import json
from zipfile import ZipFile
from StringIO import StringIO

CATALOG = None
FILES_URL = settings.CATALOG_URL[:settings.CATALOG_URL.rindex("/") + 1]

def getCatalog():
    global CATALOG
    if CATALOG is None:
        response = urlopen(settings.CATALOG_URL)
        CATALOG = json.load(response)
        for album in CATALOG.values():
            album['date'] = datetime.strptime(album['date'], "%Y-%m-%dT%H:%M:%S")
            for photo in album['photos']:
                photo['date'] = datetime.strptime(photo['date'], "%Y-%m-%dT%H:%M:%S")

            album['photos'].sort(key=lambda x: x['date'])
    return CATALOG


def index(request, album_slug=None, node_index=None):
    catalog = getCatalog()
    year_month_map = defaultdict(lambda: defaultdict(lambda: []))
    for album in sorted(catalog.values(),
                        key=lambda x: x['date'], reverse=True):
        year_month_map[album['date'].year][album['date'].month].append(album)

    years = []
    month_names = {1: u"Januari",
                   2: u"Februari",
                   3: u"Mars",
                   4: u"April",
                   5: u"Maj",
                   6: u"Juni",
                   7: u"Juli",
                   8: u"Augusti",
                   9: u"September",
                   10: u"Oktober",
                   11: u"November",
                   12: u"December"}
    for year in sorted(year_month_map.keys(), reverse=True):
        months = []
        for month in sorted(year_month_map[year].keys(), reverse=True):
            months.append((month_names[month], year_month_map[year][month]))
        years.append((year, months))
    ctx = {"FILES_URL": FILES_URL,
           "albums": [catalog[album_name] for album_name in sorted(catalog.keys(),
                                                                   key=lambda x: catalog[x]['date'], reverse=True)],
           "years": years,
           "album_slug": album_slug,
           "node_index": int(node_index) - 1 if node_index is not None else None}
    return render(request, "index.html", ctx)


def zipfile(request, album_slug):
    catalog = getCatalog()
    album = catalog[album_slug]

    inmemory_file = StringIO()

    zip_file = ZipFile(inmemory_file, "w")

    for photo in album["photos"]:
        response = urlopen(FILES_URL + photo["file"])

        zip_file.writestr(photo["file"], response.read())
    zip_file.close()

    inmemory_file.seek(0)
    response = HttpResponse(inmemory_file, content_type="application/zip")
    response["Content-Disposition"] = "attachment; filename=%s.zip" % album_slug
    return response
