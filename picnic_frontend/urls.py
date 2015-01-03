# encoding: utf-8
from django.conf.urls import patterns, url, include
import views

urlpatterns = patterns('',
    url(r'^(?P<album_slug>[\w\-]+)/(?P<node_index>\d+)/$', views.index, name='index'),
    url(r'^(?P<album_slug>[\w\-]+)/$', views.index, name='index'),
    url(r'^$', views.index, name='index'),
)