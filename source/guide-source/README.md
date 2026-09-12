# Full A10VO LA Rev B guide source

The checked zlib/base64 parts store the complete page-layout text records of the two approved 15-page Rev B guides. They are not the earlier six-page summaries. Concatenate the numbered parts, decode base64 and inflate zlib. The SHA-256 checks in scripts/build_la_assets.py guard against truncation or accidental edits.

The build replays every source paragraph, formula, table and page label and checks each text span against the final PDF. Fonts are embedded by PyMuPDF. Concept illustrations are rendered as vectors; manufacturer circuits and characteristics are native clips from Bosch Rexroth RE 92705 (2019-03-25), pp. 13-14, provided by the user. The source datasheet is fetched only at build time, with an exact SHA-256 check. A different source version must be reviewed explicitly.

Generated PDFs are static public/docs/*.pdf assets. The browser never re-creates a shortened guide. The single download link follows the shared algo-team-language setting.

Manual build: python3 -m pip install PyMuPDF==1.26.7 && python3 scripts/build_la_assets.py
For offline builds set LA_DATASHEET_PATH to the checksum-matching source PDF.
