import json
import os
import requests
from datetime import datetime

SERVERS = [
    {"ip": "play.strudel.rip", "file": "src/data/players_strudel.json"}
]

for server in SERVERS:
    ip = server["ip"]
    file_path = server["file"]
    
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    stored = {}
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                stored = json.load(f)
        except:
            stored = {}

    try:
        res = requests.get(f"https://api.mcsrvstat.us/3/{ip}", timeout=10)
        data = res.json()
        
        current_online = []
        if data.get("online") and "list" in data.get("players", {}):
            for p in data["players"]["list"]:
                is_obj = isinstance(p, dict)
                name = p.get("name") if is_obj else p
                uuid = p.get("uuid") if is_obj else None
                
                current_online.append(name)
                stored[name] = {
                    "name": name,
                    "uuid": uuid,
                    "lastSeen": datetime.utcnow().isoformat(),
                    "isOnline": True
                }

        for name in stored:
            if name not in current_online:
                stored[name]["isOnline"] = False

        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(stored, f, indent=2, ensure_ascii=False)

    except Exception as e:
        print(f"Fehler bei {ip}: {e}")