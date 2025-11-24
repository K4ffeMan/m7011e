```Mermaid
erDiagram
    USERS {
        int id PK
        text username
        text email
        text password_hash
        timestamp created_at
    }

    ROOMS {
        int id PK
        text room_code UK 
        int created_by FK
        timestamp created_at
        boolean active
    }

    ROOM_MEMBERS {
        int id PK
        int room_id FK
        int user_id FK
    }

    VIDEOS {
        int id PK
        int room_id FK
        text url
        text title
        int added_by FK
        timestamp added_at
    }

    VOTES {
        int id PK
        int video_id FK
        int user_id FK
        int amount
        timestamp created_at
    }

    WATCH_SESSIONS {
        int id PK
        int room_id FK
        int video_id FK
        timestamp started_at
        float current_time
        boolean is_playing
    }

    USERS ||--o{ ROOMS : creates
    USERS ||--o{ ROOM_MEMBERS : joins
    USERS ||--o{ VIDEOS : adds
    USERS ||--o{ VOTES : votes

    ROOMS ||--o{ ROOM_MEMBERS : has_members
    ROOMS ||--o{ VIDEOS : contains
    ROOMS ||--o{ WATCH_SESSIONS : has_sessions

    VIDEOS ||--o{ VOTES : has_votes
    VIDEOS ||--o{ WATCH_SESSIONS : played_in
```