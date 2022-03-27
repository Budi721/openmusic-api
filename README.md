### Open Music API

Ini adalah repository submission dicoding Dasar Pengembangan Aplikasi Backend

untuk dokumentasi dan test case bisa didownload di [link berikut](https://github.com/dicodingacademy/a271-backend-menengah-labs/raw/099-shared-files/03-submission-content/01-open-music-api-v1/OpenMusic%20API%20V1%20Test.zip)

1. untuk menjalankan perlu menginstall dulu dependencies
dengan command 
```
npm install 

atau 

yarn
```

2. setelah semua terinstall lakukan migrasi database
```
yarn migrate up

atau 

npm run migrate up
```

3. membuat file .env dan mengisikan sesuai environment untuk menjalankan
```
PGUSER=
PGPASSWORD=
PGDATABASE=
PGHOST=
PGPORT=

# server configuration
HOST=
PORT=
```

4. alright tinggal menjalankan aplikasi
```
yarn start

atau 

npm run start
```
