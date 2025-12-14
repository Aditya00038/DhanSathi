import json
import urllib.request
import urllib.error

API = 'http://localhost:8000'

def post_json(path, data, headers=None):
    url = API + path
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'} if headers is None else headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print('HTTPError', e.code, e.read().decode('utf-8'))
        raise
    except Exception as e:
        print('Error', e)
        raise

if __name__ == '__main__':
    try:
        login = post_json('/api/auth/token', {'username': 'demo@dhan.local', 'password': 'password123'})
        token = login.get('access_token')
        print('LOGIN_OK')
        print(token)

        headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'}
        goal = post_json('/api/goals/', {'name': 'Automated Test Goal', 'target_amount': 1000, 'target_date': '2026-12-31T00:00:00Z'}, headers=headers)
        print('CREATE_OK')
        print(json.dumps(goal, indent=2))
    except Exception:
        pass
