# Timekeeper 3.0

### Project setup
```
1. Plik ".env" należy umieścić w głównym folderze projektu. 
2. Aplikację uruchamiamy komendą "docker compose up -d"
```

### Populacja bazy danych testowymi danymi
```
1. Przechodzimy do folderu "populate database" -> cd backend\database\populate_database
2. Uruchamiany komendę "docker exec -i tk_db mysql -uroot -p<HASŁO> tk_db < populate.sql"
  - Jeśli jesteś biedną duszą, która próbuje odpalić powyższą komendę na Windowsie - zamiast Powershella użyj zwykłego, pobożnego   wiersza poleceń.

```



