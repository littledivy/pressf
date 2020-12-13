# TODO: Add more benchmarks
declare -a arr=("pressf.ts"  "oak.ts" "abc.ts" "drash.ts" "opine.ts")

echo Running benchmarks

for i in "${arr[@]}"
do
   deno run -A --no-check $i &
   # NOTE: Adjust sleep when running the first time.
   sleep 2
   wrk -c 100 -d 40 http://localhost:1234
   kill $!
done
