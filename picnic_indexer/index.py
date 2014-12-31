import json
import os
from os import listdir, makedirs
from os.path import join, exists, isdir, basename, isfile, splitext
from multiprocessing.pool import ThreadPool

convert_types = {'thumbnail': "-thumbnail 200x200^ -gravity center -extent 200x200",
                 'medium': "-thumbnail 800"}
file_extensions = {'.png', '.jpeg', '.jpg'}

albums = {}

def run(path, reprocess=False):
    convert_jobs = []
    for album_dir in listdir(path):
        if isdir(album_dir):
            album = {
                'name': basename(album_dir),
                'photos': [],
                'date': os.path.getctime(album_dir)
            }

            files_to_convert = {}
            for convert_type in convert_types:
                files_to_convert[convert_type] = []
                convert_dir = join(album_dir, convert_type)
                if not exists(convert_dir):
                    makedirs(convert_dir)

            for file_path in listdir(album_dir):
                full_file_path = join(path, album_dir, file_path)
                if isfile(full_file_path):
                    lower_extension = splitext(file_path)[1].lower()
                    if lower_extension in file_extensions:
                        photo = {'file': "/".join((album_dir, file_path)),
                                 'convert_types': {},
                                 'date': os.path.getctime(full_file_path),
                                 'name': basename(file_path).lower()}
                        for convert_type in convert_types:

                            convert_file = join(album_dir, convert_type, basename(file_path))
                            photo['convert_types'][convert_type] = "/".join((album_dir, convert_type, basename(file_path)))

                            if reprocess or not exists(convert_file):
                                files_to_convert[convert_type].append(file_path)
                        album['photos'].append(photo)
                    elif file_path == "album.json":
                        with open(full_file_path, "r") as f:
                            album.update(json.load(f))

            for convert_type, files in files_to_convert.items():
                for file_path in files:
                    command = 'convert {input_file} {convert_options} {output_file}'.format(
                        input_file=join(path, album_dir, file_path).replace(" ", "\ "),
                        output_file=join(path, album_dir, convert_type, file_path).replace(" ", "\ "),
                        convert_options=convert_types[convert_type]
                    )
                    convert_jobs.append(command)

            albums[album_dir] = album

    class Counter:
        def __init__(self):
            self.count = 0
    counter = Counter()
    numfiles = len(convert_jobs)

    def parallel(cmd):
        os.system(cmd)
        counter.count += 1
        print "Processed %s of %s files" % (counter.count, numfiles)
    threadpool = ThreadPool(5)
    threadpool.map(parallel, convert_jobs)

    with open("catalog.json", "w") as f:
        json.dump(albums, f, sort_keys=True, indent=2)

if __name__ == '__main__':
    run(".", reprocess=False)