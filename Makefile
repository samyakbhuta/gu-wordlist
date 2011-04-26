# Makefile to create/view wordlist
# Author: Kartik Mistry <kartik.mistry@gmail.com>, 2011.

EDITOR = gedit
WLRAW = gu-wordlist.txt
WL = gu.wl

all:
	@echo ""
	@echo "Usage:"
	@echo ""
	@echo "* make view   -- to see raw wordlist $(WLRAW)"
	@echo "* make wl     -- to make sorted, uniq wordlist"
	@echo "* make cwl    -- to create cwl out of $(WL)"
	@echo "* make clean  -- to remove generated cwl file"
	@echo ""

wl:
	@sort $(WLRAW) > tmp-gu-wl-sorted.txt
	@uniq tmp-gu-wl-sorted.txt > tmp-gu-wl-sorted-uniq.txt
	@cp tmp-gu-wl-sorted-uniq.txt gu.wl
	@rm tmp-*.txt

cwl:
	@echo "* We're making backup of gu.wl to gu.wl.bak first"
	@cp gu.wl gu.wl.bak
	@prezip -z -s gu.wl

view:
	@$(EDITOR) $(WLRAW) &

clean:
	@rm -f *.cwl *.bak

