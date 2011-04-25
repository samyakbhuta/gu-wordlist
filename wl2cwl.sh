#!/bin/sh

# TODO: remove space from wordlist automatically.
# Author: Karitk Mistry <kartik.mistry@gmail.com>

#Sort wordlist and make wordlist uniq
sort gu-wordlist.txt > tmp-gu-wl-sorted.txt
uniq tmp-gu-wl-sorted.txt > tmp-gu-wl-sorted-uniq.txt

cp tmp-gu-wl-sorted-uniq.txt gu.wl

#make cwl
prezip -z -s gu.wl

#cleanup
rm -f tmp-*.txt
