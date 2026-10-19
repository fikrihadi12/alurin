#!/usr/bin/env python3
"""Launcher server lokal ALURIN v0.4 (hanya standard library Python).

Selalu menghidangkan folder tempat script ini berada, tanpa bergantung pada
working directory terminal. Jika suatu port sedang digunakan, pilih port
berikutnya. Menonaktifkan cache saat pengujian dan terikat ke localhost saja.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


def main():
    handler = partial(NoCacheHandler, directory=str(ROOT))
    server = None
    for port in range(8893, 8914):
        try:
            server = ThreadingHTTPServer(('127.0.0.1', port), handler)
            break
        except OSError as error:
            if getattr(error, 'errno', None) not in (48, 98, 10048):
                raise
    if server is None:
        raise SystemExit('Port 8893 sampai 8913 sedang digunakan. Tutup server lama dan coba lagi.')
    address = f'http://127.0.0.1:{server.server_port}/#/login'
    print('\n' + '='*57,flush=True)
    print('  ALURIN v0.4  |  ROLE DEMO + KONTEN AKTIF',flush=True)
    print('='*57,flush=True)
    print(f'Folder : {ROOT}',flush=True)
    print(f'Buka   : {address}',flush=True)
    print('Akhiri server dengan Ctrl+C.',flush=True)
    print('Jika halaman lama muncul, pastikan Anda menjalankan peluncur dari folder ALURIN v0.4 ini.\n',flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nServer ALURIN dihentikan.',flush=True)
    finally:
        server.server_close()

if __name__ == '__main__':
    main()
