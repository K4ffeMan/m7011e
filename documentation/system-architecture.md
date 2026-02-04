```mermaid
graph TD
    subgraph LoadTestingNS ["Namespace: load-testing"]
        TesterPods[load-testing]
    end

    User-interface

    subgraph frontendNS ["Namespace: frontend-dev"]
        frontendPods[frontend]
    end

    subgraph BackendDevNS ["Namespace: backend-dev"]
        Ingress[Ingress Controller]
            BackendPods[Backend]
    end

    subgraph RoomNS ["Namespace: room-service-dev"]
            room-servicePods[room-service]
    end

    subgraph VideoNS ["Namespace: video-service-dev"]
            video-servicePods[video-service]
    end

    subgraph Start-voteNS ["Namespace: start-vote-service-dev"]
            start-vote-servicePods[start-vote-service]
    end

    subgraph VoteNS ["Namespace: vote-service-dev"]
            vote-servicePods[vote-service]
    end

    subgraph End-voteNS ["Namespace: end-vote-service-dev"]
            en-vote-servicePods[end-vote-service]
    end

    subgraph End-voteNS ["Namespace: end-vote-service-dev"]
            en-vote-servicePods[end-vote-service]
    end

    subgraph Worker-videoNS ["Namespace: video-service-dev"]
            worker-videoPods[video-rabbitmq]
    end

    subgraph Worker-voteNS ["Namespace: vote-service-dev"]
            worker-votePods[vote-rabbitmq]
    end

    subgraph RabbitmqNS ["Namespace: rabbitmq-dev"]
            rabbitmqPods[rabbitmq-deployment]
    end

    subgraph KeycloakNS ["Namespace: keycloak-dev"]
        keycloakPods[keycloak]
    end

    subgraph MonitoringNS ["Namespace: monitoring"]
            PrometheusPods[prometheus]
            GrafanPods[grafana]
    end

    subgraph DatabaseNS ["Namespace: database-dev"]
        Postgres[PostgreSQL Pod]
    end

    User-interface --> frontendPods
    frontendPods --> Ingress
    TesterPods --> Ingress
    Ingress --> BackendPods


    BackendPods --> room-servicePods
    BackendPods --> video-servicePods
    BackendPods --> start-vote-servicePods
    BackendPods --> vote-servicePods
    BackendPods --> en-vote-servicePods

    video-servicePods -- "Publish" --> rabbitmqPods
    vote-servicePods -- "Publish" --> rabbitmqPods

    rabbitmqPods -- "Consume" --> worker-videoPods
    rabbitmqPods -- "Consume" --> worker-votePods

    room-servicePods -.->|Validate Token| keycloakPods
    video-servicePods -.->|Validate Token| keycloakPods
    start-vote-servicePods -.->|Validate Token| keycloakPods
    vote-servicePods -.->|Validate Token| keycloakPods
    en-vote-servicePods -.->|Validate Token| keycloakPods

    GrafanPods --- PrometheusPods
    PrometheusPods -.->|Scrape| rabbitmqPods
    PrometheusPods -.->|Scrape| room-servicePods
    PrometheusPods -.->|Scrape| video-servicePods
    PrometheusPods -.->|Scrape| vote-servicePods
    PrometheusPods -.->|Scrape| start-vote-servicePods
    PrometheusPods -.->|Scrape| en-vote-servicePods
    PrometheusPods -.->|Scrape| worker-videoPods
    PrometheusPods -.->|Scrape| worker-votePods

    room-servicePods --> Postgres
    start-vote-servicePods --> Postgres
    en-vote-servicePods --> Postgres
    worker-videoPods --> Postgres
    worker-votePods --> Postgres
    keycloakPods -- "Store User information" --> Postgres

    