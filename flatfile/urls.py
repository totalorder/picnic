from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    url(r'^tell/', include('tell.urls')),
    url(r'^admin/', include(admin.site.urls)),
)
