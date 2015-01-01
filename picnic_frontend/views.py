from collections import defaultdict
from datetime import datetime
from urllib2 import urlopen
from django.shortcuts import render
import json

CATALOG_URL = "http://192.168.0.115:8001/catalog.json"

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
           "years": years}
    return render(request, "index.html", ctx)