import sqlite3
import os
import threading
from typing import List

DB_PATH = "profile.db"
# Use a lock since SQLite can have issues with concurrent writes across threads
db_lock = threading.Lock()

def init_db():
    with db_lock:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id TEXT PRIMARY KEY,
                summary TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()

def get_user_profile(user_id: str) -> str:
    with db_lock:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT summary FROM user_profiles WHERE user_id = ?", (user_id,))
        row = c.fetchone()
        conn.close()
        if row:
            return row[0]
        return ""

def update_user_profile(user_id: str, new_summary: str):
    with db_lock:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute('''
            INSERT INTO user_profiles (user_id, summary, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET
                summary=excluded.summary,
                updated_at=CURRENT_TIMESTAMP
        ''', (user_id, new_summary))
        conn.commit()
        conn.close()
