#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════
#  WHOAMI — local server
#  concept, design & code by ghostly.grl ♥
#
#  python3 serve.py [port]   →   http://localhost:5820
#
#  serves the site, plus one secret door: /whoami
#  it answers only to 127.0.0.1 and tells the cat
#  what this computer is called and who owns it.
#  on any normal host the door doesn't exist,
#  and the cat has to guess from your browser.
# ═══════════════════════════════════════════════════════════════
import functools, http.server, json, os, pwd, subprocess, sys


def ask(cmd):
    try:
        return subprocess.run(cmd, capture_output=True, text=True, timeout=2).stdout.strip()
    except Exception:
        return ''


def who():
    user = pwd.getpwuid(os.getuid()).pw_name
    full = ask(['id', '-F']) or ask(['getent', 'passwd', user]).split(':')[4:5] or ''
    if isinstance(full, list):
        full = (full[0] if full else '').split(',')[0]
    computer = ask(['scutil', '--get', 'ComputerName']) or os.uname().nodename
    return {'full': full, 'user': user, 'computer': computer}


class Door(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_GET(self):
        if self.path.split('?')[0] == '/whoami':
            if self.client_address[0] not in ('127.0.0.1', '::1'):
                self.send_error(404)
                return
            body = json.dumps(who()).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def log_message(self, *a):
        pass


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5820
    root = os.path.dirname(os.path.abspath(__file__))
    print(f'  whoami → http://localhost:{port}   (the cat is awake)')
    http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Door, directory=root)).serve_forever()
