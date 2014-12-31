# encoding: utf-8
from django.conf.urls import patterns, url, include
import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
)