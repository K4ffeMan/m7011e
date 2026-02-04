```mermaid

classDiagram
    class rooms {
        text id PK
        text owner_id
        text game_state
        integer winner_video FK
        timestamp created_at
    }

    class videos {
        serial id PK
        text room_id FK
        text url
        timestamp created_at
    }

    class votes {
        serial id PK
        text room_id FK
        integer video_id FK
        text user_id
        timestamp created_at
    }
    rooms "1" -- "0..*" videos : contains
    rooms "1" -- "0..1" videos : selects winner
    videos "1" -- "0..*" votes : receives
    rooms "1" -- "0..*" votes : tracks