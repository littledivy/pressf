echo Router
wrk -c 1 -d 10 -t 1 http://localhost:1234

echo Oak
wrk -c 1 -d 10 -t 1 http://localhost:1235

echo Opine
wrk -c 1 -d 10 -t 1 http://localhost:1236
